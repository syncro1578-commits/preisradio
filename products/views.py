from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.http import HttpResponse
from django.core.cache import cache
from django.conf import settings
from mongoengine.queryset.visitor import Q
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import logging

logger = logging.getLogger(__name__)
from .models import SaturnProduct, MediaMarktProduct, OttoProduct, KauflandProduct
from .serializers import (
    SaturnProductSerializer,
    MediaMarktProductSerializer,
    OttoProductSerializer,
    KauflandProductSerializer,
)
from .google_merchant import get_merchant_service
from datetime import datetime
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 10000  # Allow up to 10000 items for sitemap generation


class RetailerViewSet(viewsets.ViewSet):
    """ViewSet for retailers (Saturn, MediaMarkt, Otto, and Kaufland)"""

    def list(self, request):
        """List all retailers"""
        retailers = [
            {
                'id': 'saturn',
                'name': 'Saturn',
                'website': 'https://www.saturn.de',
                'category_count': SaturnProduct.objects.count()
            },
            {
                'id': 'mediamarkt',
                'name': 'MediaMarkt',
                'website': 'https://www.mediamarkt.de',
                'category_count': MediaMarktProduct.objects.count()
            },
            {
                'id': 'otto',
                'name': 'Otto',
                'website': 'https://www.otto.de',
                'category_count': self._safe_count(OttoProduct)
            },
            {
                'id': 'kaufland',
                'name': 'Kaufland',
                'website': 'https://www.kaufland.de',
                'category_count': self._safe_count(KauflandProduct)
            }
        ]
        return Response({'results': retailers})

    def _safe_count(self, model):
        """Safely count documents, return 0 if connection fails"""
        try:
            return model.objects.count()
        except Exception as e:
            logger.warning(f"Could not count {model.__name__}: {e}")
            return 0

    def retrieve(self, request, pk=None):
        """Retrieve a retailer by ID"""
        retailers = {
            'saturn': {
                'id': 'saturn',
                'name': 'Saturn',
                'website': 'https://www.saturn.de',
                'product_count': SaturnProduct.objects.count()
            },
            'mediamarkt': {
                'id': 'mediamarkt',
                'name': 'MediaMarkt',
                'website': 'https://www.mediamarkt.de',
                'product_count': MediaMarktProduct.objects.count()
            },
            'otto': {
                'id': 'otto',
                'name': 'Otto',
                'website': 'https://www.otto.de',
                'product_count': self._safe_count(OttoProduct)
            },
            'kaufland': {
                'id': 'kaufland',
                'name': 'Kaufland',
                'website': 'https://www.kaufland.de',
                'product_count': self._safe_count(KauflandProduct)
            }
        }
        if pk in retailers:
            return Response(retailers[pk])
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class ProductViewSet(viewsets.ViewSet):
    """ViewSet for products from all retailers (Saturn, MediaMarkt, Otto, and Kaufland)"""

    def _normalize_text(self, text):
        """Normalize text for better search matching (remove accents, lowercase)"""
        if not text:
            return ""

        import unicodedata
        # Remove accents
        text = ''.join(
            c for c in unicodedata.normalize('NFD', text)
            if unicodedata.category(c) != 'Mn'
        )
        return text.lower().strip()

    def _tokenize_search(self, search_term):
        """Split search term into individual tokens/words"""
        if not search_term:
            return []

        # Split by spaces and remove empty strings
        tokens = [t.strip() for t in search_term.split() if t.strip()]
        return tokens

    def _calculate_search_relevance(self, product, search_term):
        """Calculate relevance score for a product based on search term match.

        Enhanced scoring with:
        - Multi-word tokenization
        - Accent/case normalization
        - Position-based scoring
        - Freshness boosting
        - Image availability boosting

        Scoring:
        - Title exact match (all tokens): 100
        - Title starts with (all tokens): 80
        - Title contains all tokens: 60
        - Title contains partial tokens: 20-40 (scaled by match ratio)
        - GTIN exact match: 90
        - Brand match: 50
        - Description match: 15-30 (scaled)
        - Has image: +5
        - Recent product (<7 days): +10
        - Recent product (<30 days): +5
        """
        if not search_term:
            return 0

        # Normalize and tokenize search term
        search_normalized = self._normalize_text(search_term)
        search_tokens = self._tokenize_search(search_normalized)

        if not search_tokens:
            return 0

        score = 0

        # Normalize product fields
        title_normalized = self._normalize_text(product.title) if product.title else ""
        brand_normalized = self._normalize_text(product.brand) if product.brand else ""
        desc_normalized = self._normalize_text(product.description) if product.description else ""
        gtin_normalized = self._normalize_text(str(product.gtin)) if product.gtin else ""

        # Check GTIN (highest priority for exact product matching)
        if gtin_normalized and gtin_normalized == search_normalized:
            score = max(score, 90)

        # Check title (very high priority)
        if title_normalized:
            # Exact match with all tokens
            if title_normalized == search_normalized:
                score = max(score, 100)
            # Starts with search term
            elif title_normalized.startswith(search_normalized):
                score = max(score, 80)
            else:
                # Multi-token matching
                tokens_found = sum(1 for token in search_tokens if token in title_normalized)
                match_ratio = tokens_found / len(search_tokens)

                if match_ratio == 1.0:
                    # All tokens found in title
                    score = max(score, 60)

                    # Bonus if tokens appear in order
                    tokens_in_order = all(
                        title_normalized.find(search_tokens[i]) < title_normalized.find(search_tokens[i+1])
                        for i in range(len(search_tokens)-1)
                        if search_tokens[i] in title_normalized and search_tokens[i+1] in title_normalized
                    ) if len(search_tokens) > 1 else False

                    if tokens_in_order:
                        score += 10

                elif match_ratio > 0.5:
                    # More than half tokens found
                    score = max(score, int(40 * match_ratio))
                elif match_ratio > 0:
                    # Some tokens found
                    score = max(score, int(20 * match_ratio))

        # Check brand (moderate priority)
        if brand_normalized:
            # Exact brand match
            if brand_normalized == search_normalized:
                score = max(score, 55)
            # Brand contains search term
            elif search_normalized in brand_normalized:
                score = max(score, 50)
            # Multi-token brand matching
            else:
                tokens_found = sum(1 for token in search_tokens if token in brand_normalized)
                if tokens_found > 0:
                    score = max(score, int(45 * tokens_found / len(search_tokens)))

        # Check description (lower priority)
        if desc_normalized:
            # Count token matches in description
            tokens_found = sum(1 for token in search_tokens if token in desc_normalized)
            match_ratio = tokens_found / len(search_tokens)

            if match_ratio == 1.0:
                score = max(score, 30)
            elif match_ratio > 0.5:
                score = max(score, int(25 * match_ratio))
            elif match_ratio > 0:
                score = max(score, int(15 * match_ratio))

        # Freshness boost (favor recent products)
        if product.scraped_at:
            from datetime import datetime, timezone

            # Make product.scraped_at timezone-aware if it's naive
            scraped_at = product.scraped_at
            if scraped_at.tzinfo is None:
                scraped_at = scraped_at.replace(tzinfo=timezone.utc)

            age_days = (datetime.now(timezone.utc) - scraped_at).days

            if age_days < 7:
                score += 10  # Very recent
            elif age_days < 30:
                score += 5   # Recent

        # Image availability boost (better UX)
        if product.image:
            score += 5

        return score

    def list(self, request):
        """List products from both retailers with filtering and search"""
        search = request.query_params.get('search', '')
        category = request.query_params.get('category', '')
        brand = request.query_params.get('brand', '')
        retailer = request.query_params.get('retailer', 'all').lower()  # normalize to lowercase
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))

        # Generate cache key based on query parameters
        cache_params = f"{search}:{category}:{brand}:{retailer}:{page}:{page_size}"
        cache_key = f"products_list_{hashlib.md5(cache_params.encode()).hexdigest()}"

        # Determine cache duration based on request type
        # Homepage (no filters): 1 hour, Search/filters: 10 minutes
        is_homepage = not search and not category and not brand and retailer == 'all' and page == 1
        cache_duration = getattr(settings, 'CACHE_HOMEPAGE_DURATION', 3600) if is_homepage else getattr(settings, 'CACHE_SEARCH_DURATION', 600)

        # Try to get from cache
        cached_response = cache.get(cache_key)
        if cached_response is not None:
            return Response(cached_response)

        # Build queries with filters using helper function
        def build_query(model, category_filter, brand_filter, search_query):
            """Build a filtered query for any product model"""
            query = model.objects()
            if category_filter:
                query = query.filter(category=category_filter)
            if brand_filter:
                query = query.filter(brand=brand_filter)
            if search_query:
                query = query.filter(
                    Q(title__icontains=search_query) |
                    Q(sku__icontains=search_query) |
                    Q(sku=search_query) |  # Exact SKU match
                    Q(gtin__icontains=search_query) |
                    Q(gtin=search_query) |  # Exact GTIN match
                    Q(description__icontains=search_query) |
                    Q(brand__icontains=search_query)
                )
            return query

        saturn_query = build_query(SaturnProduct, category, brand, search) if retailer in ['all', 'saturn'] else None
        mediamarkt_query = build_query(MediaMarktProduct, category, brand, search) if retailer in ['all', 'mediamarkt'] else None
        otto_query = build_query(OttoProduct, category, brand, search) if retailer in ['all', 'otto'] else None
        kaufland_query = build_query(KauflandProduct, category, brand, search) if retailer in ['all', 'kaufland'] else None

        # Apply pagination
        start = (page - 1) * page_size

        if retailer == 'saturn':
            # Single retailer pagination with relevance scoring
            # Limit to max of 10000 to respect MAX_PAGE_SIZE setting
            query_limit = min(page_size * 2, 10000)
            saturn_results = list(saturn_query.order_by('-scraped_at').limit(query_limit)) if saturn_query else []
            total_count = saturn_query.count() if saturn_query else 0

            # Add relevance scores and sort by score (descending), then by date
            saturn_with_scores = [(p, 'saturn', self._calculate_search_relevance(p, search)) for p in saturn_results]
            saturn_with_scores.sort(key=lambda x: (-x[2], -(x[0].scraped_at.timestamp() if x[0].scraped_at else 0)))

            # Apply pagination after sorting
            end = start + page_size
            page_products = saturn_with_scores[start:end]
            page_products = [(p, source) for p, source, _ in page_products]

        elif retailer == 'mediamarkt':
            # Single retailer pagination with relevance scoring
            # Limit to max of 10000 to respect MAX_PAGE_SIZE setting
            query_limit = min(page_size * 2, 10000)
            mediamarkt_results = list(mediamarkt_query.order_by('-scraped_at').limit(query_limit)) if mediamarkt_query else []
            total_count = mediamarkt_query.count() if mediamarkt_query else 0

            # Add relevance scores and sort by score (descending), then by date
            mediamarkt_with_scores = [(p, 'mediamarkt', self._calculate_search_relevance(p, search)) for p in mediamarkt_results]
            mediamarkt_with_scores.sort(key=lambda x: (-x[2], -(x[0].scraped_at.timestamp() if x[0].scraped_at else 0)))

            # Apply pagination after sorting
            end = start + page_size
            page_products = mediamarkt_with_scores[start:end]
            page_products = [(p, source) for p, source, _ in page_products]

        elif retailer == 'otto':
            # Single retailer pagination with relevance scoring
            # Limit to max of 10000 to respect MAX_PAGE_SIZE setting
            query_limit = min(page_size * 2, 10000)
            otto_results = list(otto_query.order_by('-scraped_at').limit(query_limit)) if otto_query else []
            total_count = otto_query.count() if otto_query else 0

            # Add relevance scores and sort by score (descending), then by date
            otto_with_scores = [(p, 'otto', self._calculate_search_relevance(p, search)) for p in otto_results]
            otto_with_scores.sort(key=lambda x: (-x[2], -(x[0].scraped_at.timestamp() if x[0].scraped_at else 0)))

            # Apply pagination after sorting
            end = start + page_size
            page_products = otto_with_scores[start:end]
            page_products = [(p, source) for p, source, _ in page_products]

        elif retailer == 'kaufland':
            # Single retailer pagination with relevance scoring
            # Limit to max of 10000 to respect MAX_PAGE_SIZE setting
            query_limit = min(page_size * 2, 10000)
            kaufland_results = list(kaufland_query.order_by('-scraped_at').limit(query_limit)) if kaufland_query else []
            total_count = kaufland_query.count() if kaufland_query else 0

            # Add relevance scores and sort by score (descending), then by date
            kaufland_with_scores = [(p, 'kaufland', self._calculate_search_relevance(p, search)) for p in kaufland_results]
            kaufland_with_scores.sort(key=lambda x: (-x[2], -(x[0].scraped_at.timestamp() if x[0].scraped_at else 0)))

            # Apply pagination after sorting
            end = start + page_size
            page_products = kaufland_with_scores[start:end]
            page_products = [(p, source) for p, source, _ in page_products]

        else:
            # For 'all' retailers - load from all in PARALLEL and merge with relevance scoring
            load_size = min(max(page_size * 5, 250), 10000)

            # Helper function to load products from a query
            def load_products(query, retailer_name):
                try:
                    if query:
                        results = list(query.order_by('-scraped_at').limit(load_size))
                        count = query.count()
                        return retailer_name, results, count
                    return retailer_name, [], 0
                except Exception as e:
                    logger.warning(f"Could not load {retailer_name} products: {e}")
                    return retailer_name, [], 0

            # Execute all queries in parallel using ThreadPoolExecutor
            saturn_results, mediamarkt_results, otto_results, kaufland_results = [], [], [], []
            saturn_count, mediamarkt_count, otto_count, kaufland_count = 0, 0, 0, 0

            with ThreadPoolExecutor(max_workers=4) as executor:
                futures = [
                    executor.submit(load_products, saturn_query, 'saturn'),
                    executor.submit(load_products, mediamarkt_query, 'mediamarkt'),
                    executor.submit(load_products, otto_query, 'otto'),
                    executor.submit(load_products, kaufland_query, 'kaufland'),
                ]

                for future in as_completed(futures):
                    retailer_name, results, count = future.result()
                    if retailer_name == 'saturn':
                        saturn_results, saturn_count = results, count
                    elif retailer_name == 'mediamarkt':
                        mediamarkt_results, mediamarkt_count = results, count
                    elif retailer_name == 'otto':
                        otto_results, otto_count = results, count
                    elif retailer_name == 'kaufland':
                        kaufland_results, kaufland_count = results, count

            total_count = saturn_count + mediamarkt_count + otto_count + kaufland_count

            # Combine products with relevance scores
            products = [(p, 'saturn', self._calculate_search_relevance(p, search)) for p in saturn_results]
            products += [(p, 'mediamarkt', self._calculate_search_relevance(p, search)) for p in mediamarkt_results]
            products += [(p, 'otto', self._calculate_search_relevance(p, search)) for p in otto_results]
            products += [(p, 'kaufland', self._calculate_search_relevance(p, search)) for p in kaufland_results]

            # Sort by relevance score (descending), then by date (most recent first)
            products.sort(key=lambda x: (-x[2], -(x[0].scraped_at.timestamp() if x[0].scraped_at else 0)))

            # Apply pagination on the sorted results
            end = start + page_size
            page_products = products[start:end]
            page_products = [(p, source) for p, source, _ in page_products]

        # Serialize results
        results = []
        for product, source in page_products:
            if source == 'saturn':
                serializer = SaturnProductSerializer(product)
            elif source == 'mediamarkt':
                serializer = MediaMarktProductSerializer(product)
            elif source == 'otto':
                serializer = OttoProductSerializer(product)
            elif source == 'kaufland':
                serializer = KauflandProductSerializer(product)
            else:
                continue  # Unknown retailer
            data = serializer.data
            data['retailer'] = source
            results.append(data)

        # Calculate pagination links
        has_next = (page * page_size) < total_count

        # Build response data
        response_data = {
            'count': total_count,
            'next': f'/api/products/?page={page + 1}' if has_next else None,
            'previous': f'/api/products/?page={page - 1}' if page > 1 else None,
            'results': results
        }

        # Cache the response
        cache.set(cache_key, response_data, cache_duration)

        return Response(response_data)

    def retrieve(self, request, pk=None):
        """Retrieve a product by ID"""
        # Try Kaufland
        try:
            product = KauflandProduct.objects.get(id=pk)
            serializer = KauflandProductSerializer(product)
            data = serializer.data
            data['retailer'] = 'kaufland'
            return Response(data)
        except KauflandProduct.DoesNotExist:
            pass
        except Exception as e:
            logger.error(f"Kaufland product retrieve error for ID {pk}: {type(e).__name__}: {e}")
            pass

        # Try Saturn
        try:
            product = SaturnProduct.objects.get(id=pk)
            serializer = SaturnProductSerializer(product)
            data = serializer.data
            data['retailer'] = 'saturn'
            return Response(data)
        except SaturnProduct.DoesNotExist:
            pass

        # Try MediaMarkt
        try:
            product = MediaMarktProduct.objects.get(id=pk)
            serializer = MediaMarktProductSerializer(product)
            data = serializer.data
            data['retailer'] = 'mediamarkt'
            return Response(data)
        except MediaMarktProduct.DoesNotExist:
            pass

        # Try Otto
        try:
            product = OttoProduct.objects.get(id=pk)
            serializer = OttoProductSerializer(product)
            data = serializer.data
            data['retailer'] = 'otto'
            return Response(data)
        except OttoProduct.DoesNotExist:
            pass

        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """
        Get all unique categories with product count, pagination and search.

        Query parameters:
        - search: Filter categories by name
        - page: Page number (default: 1)
        - page_size: Items per page (default: 50, max: 200)

        Returns categories with product counts for better UX.
        """
        # Use aggregation to count products per category efficiently (avoids N+1 query problem)
        # Each retailer: 1 aggregation query instead of N count queries

        def get_category_counts(model):
            """Get category counts using MongoDB aggregation"""
            try:
                pipeline = [
                    {'$group': {'_id': '$category', 'count': {'$sum': 1}}},
                    {'$sort': {'count': -1}}
                ]
                results = model.objects.aggregate(pipeline)
                return {item['_id']: item['count'] for item in results if item['_id']}
            except Exception as e:
                logger.warning(f"Could not aggregate {model.__name__} categories: {e}")
                return {}

        # Get counts from all retailers (4 queries instead of N*4)
        saturn_counts = get_category_counts(SaturnProduct)
        mediamarkt_counts = get_category_counts(MediaMarktProduct)
        otto_counts = get_category_counts(OttoProduct)
        kaufland_counts = get_category_counts(KauflandProduct)

        # Combine all unique categories
        all_categories = set(
            list(saturn_counts.keys()) +
            list(mediamarkt_counts.keys()) +
            list(otto_counts.keys()) +
            list(kaufland_counts.keys())
        )

        # Build category list with counts
        categories_with_count = []
        for category in all_categories:
            saturn_count = saturn_counts.get(category, 0)
            mediamarkt_count = mediamarkt_counts.get(category, 0)
            otto_count = otto_counts.get(category, 0)
            kaufland_count = kaufland_counts.get(category, 0)
            total_count = saturn_count + mediamarkt_count + otto_count + kaufland_count

            categories_with_count.append({
                'name': category,
                'count': total_count,
                'saturn_count': saturn_count,
                'mediamarkt_count': mediamarkt_count,
                'otto_count': otto_count,
                'kaufland_count': kaufland_count
            })

        # Sort by product count (most popular first)
        categories_with_count.sort(key=lambda x: x['count'], reverse=True)

        # Filter by search query
        search = request.query_params.get('search', '').lower()
        if search:
            categories_with_count = [
                c for c in categories_with_count
                if search in c['name'].lower()
            ]

        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = min(int(request.query_params.get('page_size', 50)), 200)

        total_count = len(categories_with_count)
        start = (page - 1) * page_size
        end = start + page_size

        paginated_categories = categories_with_count[start:end]

        # Calculate pagination info
        has_next = end < total_count
        has_prev = page > 1

        return Response({
            'count': total_count,
            'next': f'?page={page + 1}&page_size={page_size}&search={search}' if has_next else None,
            'previous': f'?page={page - 1}&page_size={page_size}&search={search}' if has_prev else None,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size,
            'results': paginated_categories
        })

    @action(detail=False, methods=['get'])
    def by_gtin(self, request):
        """Get products by GTIN (cross-retailer comparison)"""
        gtin = request.query_params.get('gtin', '')
        if not gtin:
            return Response({'detail': 'GTIN parameter required'}, status=status.HTTP_400_BAD_REQUEST)

        products = []

        try:
            saturn_product = SaturnProduct.objects.get(gtin=gtin)
            serializer = SaturnProductSerializer(saturn_product)
            data = serializer.data
            data['retailer'] = 'saturn'
            products.append(data)
        except SaturnProduct.DoesNotExist:
            pass

        try:
            mediamarkt_product = MediaMarktProduct.objects.get(gtin=gtin)
            serializer = MediaMarktProductSerializer(mediamarkt_product)
            data = serializer.data
            data['retailer'] = 'mediamarkt'
            products.append(data)
        except MediaMarktProduct.DoesNotExist:
            pass

        try:
            otto_product = OttoProduct.objects.get(gtin=gtin)
            serializer = OttoProductSerializer(otto_product)
            data = serializer.data
            data['retailer'] = 'otto'
            products.append(data)
        except OttoProduct.DoesNotExist:
            pass

        try:
            kaufland_product = KauflandProduct.objects.get(gtin=gtin)
            serializer = KauflandProductSerializer(kaufland_product)
            data = serializer.data
            data['retailer'] = 'kaufland'
            products.append(data)
        except KauflandProduct.DoesNotExist:
            pass

        if not products:
            return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'results': products})

    @action(detail=True, methods=['get'])
    def similar(self, request, pk=None):
        """Get similar products based on category from all retailers"""
        # Find the product across all retailers
        product = None
        retailer = None

        retailers_config = [
            ('saturn', SaturnProduct, SaturnProductSerializer),
            ('mediamarkt', MediaMarktProduct, MediaMarktProductSerializer),
            ('otto', OttoProduct, OttoProductSerializer),
            ('kaufland', KauflandProduct, KauflandProductSerializer),
        ]

        # Find the original product
        for ret_name, model, _ in retailers_config:
            try:
                product = model.objects.get(id=pk)
                retailer = ret_name
                break
            except model.DoesNotExist:
                continue
            except Exception as e:
                logger.warning(f"Error checking {ret_name} for product {pk}: {e}")
                continue

        if not product:
            return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        # Find similar products from all retailers
        similar_products = []
        limit = 6  # Increased limit to show more products from all retailers

        # Search in same retailer first, then others
        for ret_name, model, serializer_class in retailers_config:
            if len(similar_products) >= limit:
                break

            try:
                # Exclude current product if searching in same retailer
                query = model.objects.filter(category=product.category)
                if ret_name == retailer:
                    query = query.filter(id__ne=pk)

                remaining = limit - len(similar_products)
                similar = query.order_by('-scraped_at').limit(remaining)

                for p in similar:
                    serializer = serializer_class(p)
                    data = serializer.data
                    data['retailer'] = ret_name
                    similar_products.append(data)
            except Exception as e:
                logger.warning(f"Error fetching similar products from {ret_name}: {e}")
                continue

        return Response({
            'count': len(similar_products),
            'results': similar_products
        })

    @action(detail=True, methods=['get'])
    def price_history(self, request, pk=None):
        """Get price history for a product (currently returns latest snapshot)

        Note: This endpoint returns the current price snapshot.
        For full historical tracking, implement periodic price scraping
        and store price snapshots with timestamps in a separate collection.
        """
        # Get the current product
        product = None
        retailer = None

        try:
            product = SaturnProduct.objects.get(id=pk)
            retailer = 'saturn'
        except SaturnProduct.DoesNotExist:
            try:
                product = MediaMarktProduct.objects.get(id=pk)
                retailer = 'mediamarkt'
            except MediaMarktProduct.DoesNotExist:
                return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        if not product:
            return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        # Return current price as latest history point
        if retailer == 'saturn':
            serializer = SaturnProductSerializer(product)
        else:
            serializer = MediaMarktProductSerializer(product)

        data = serializer.data
        data['retailer'] = retailer

        # Structure for historical data (currently just latest)
        history_data = {
            'product_id': str(product.id),
            'current_price': product.price,
            'old_price': product.old_price,
            'discount': product.discount,
            'currency': product.currency,
            'retailer': retailer,
            'last_checked': product.scraped_at,
            'history': [
                {
                    'date': product.scraped_at,
                    'price': product.price,
                    'old_price': product.old_price,
                    'discount': product.discount
                }
            ],
            'product_details': data
        }

        return Response(history_data)

    @action(detail=False, methods=['get'])
    def sitemap(self, request):
        """
        Get products for sitemap generation (paginated, optimized for search engines).
        Returns minimal data (id, lastModified) to keep response small.

        Usage:
        - GET /api/products/sitemap/?limit=10000
        Returns up to 10000 products (default/max)
        """
        limit = int(request.query_params.get('limit', 10000))
        limit = min(limit, 50000)  # Max 50k per request

        try:
            # Get all products with minimal fields
            saturn_products = list(
                SaturnProduct.objects.only('id', 'scraped_at')
                .order_by('-scraped_at')
                .limit(limit)
            )

            mediamarkt_products = list(
                MediaMarktProduct.objects.only('id', 'scraped_at')
                .order_by('-scraped_at')
                .limit(limit)
            )

            otto_products = list(
                OttoProduct.objects.only('id', 'scraped_at')
                .order_by('-scraped_at')
                .limit(limit)
            )

            kaufland_products = list(
                KauflandProduct.objects.only('id', 'scraped_at')
                .order_by('-scraped_at')
                .limit(limit)
            )

            # Combine and format for sitemap
            all_products = []

            for p in saturn_products:
                all_products.append({
                    'id': str(p.id),
                    'lastModified': p.scraped_at.isoformat() if p.scraped_at else datetime.now().isoformat()
                })

            for p in mediamarkt_products:
                all_products.append({
                    'id': str(p.id),
                    'lastModified': p.scraped_at.isoformat() if p.scraped_at else datetime.now().isoformat()
                })

            for p in otto_products:
                all_products.append({
                    'id': str(p.id),
                    'lastModified': p.scraped_at.isoformat() if p.scraped_at else datetime.now().isoformat()
                })

            for p in kaufland_products:
                all_products.append({
                    'id': str(p.id),
                    'lastModified': p.scraped_at.isoformat() if p.scraped_at else datetime.now().isoformat()
                })

            # Sort by date descending
            all_products.sort(key=lambda x: x['lastModified'], reverse=True)

            # Get total counts
            total_saturn = SaturnProduct.objects.count()
            total_mediamarkt = MediaMarktProduct.objects.count()
            total_otto = OttoProduct.objects.count()
            total_kaufland = KauflandProduct.objects.count()
            total_count = total_saturn + total_mediamarkt + total_otto + total_kaufland

            return Response({
                'count': total_count,
                'returned': len(all_products),
                'limit': limit,
                'results': all_products[:limit]  # Return only up to limit
            })

        except Exception as e:
            import traceback
            logger.error(f"Sitemap error: {traceback.format_exc()}")
            return Response(
                {'error': str(e), 'detail': 'Failed to fetch sitemap data'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def google_merchant_feed(self, request):
        """
        Generate Google Merchant Center XML feed.

        Returns all products in Google Merchant Center RSS 2.0 format.
        Compatible with Google Shopping and other shopping platforms.

        Usage: GET /api/products/google_merchant_feed/
        """
        try:
            # Fetch all products
            saturn_products = list(SaturnProduct.objects.order_by('-scraped_at'))
            mediamarkt_products = list(MediaMarktProduct.objects.order_by('-scraped_at'))
            otto_products = list(OttoProduct.objects.order_by('-scraped_at'))
            kaufland_products = list(KauflandProduct.objects.order_by('-scraped_at'))

            # Create RSS XML structure
            rss = Element('rss', {
                'version': '2.0',
                'xmlns:g': 'http://base.google.com/ns/1.0'
            })

            channel = SubElement(rss, 'channel')
            SubElement(channel, 'title').text = 'Preisradio - Vergleichen Sie Preise'
            SubElement(channel, 'link').text = 'https://preisradio.de'
            SubElement(channel, 'description').text = 'Finden Sie die besten Angebote von Saturn, MediaMarkt und Otto'

            # Helper function to add product to feed
            def add_product_to_feed(product, retailer):
                item = SubElement(channel, 'item')

                # Required fields
                SubElement(item, 'g:id').text = str(product.id)
                SubElement(item, 'title').text = product.title[:150] if product.title else 'Produkt'
                SubElement(item, 'description').text = (product.description[:5000] if product.description else product.title[:5000]) if product.title else 'Keine Beschreibung'
                SubElement(item, 'link').text = f'https://preisradio.de/product/{product.id}'

                # Image
                if product.image:
                    SubElement(item, 'g:image_link').text = product.image

                # Price - format as "99.99 EUR"
                if product.price:
                    SubElement(item, 'g:price').text = f'{product.price:.2f} EUR'

                # Availability
                SubElement(item, 'g:availability').text = 'in stock'

                # Condition
                SubElement(item, 'g:condition').text = 'new'

                # Brand
                if product.brand:
                    SubElement(item, 'g:brand').text = product.brand[:70]

                # GTIN (if available)
                if product.gtin:
                    SubElement(item, 'g:gtin').text = str(product.gtin)

                # Additional fields
                if product.category:
                    SubElement(item, 'g:product_type').text = product.category

                # Custom attribute for retailer name
                SubElement(item, 'g:custom_label_0').text = retailer

                # Original retailer URL (optional, for reference)
                if product.url:
                    SubElement(item, 'g:custom_label_1').text = product.url[:100]

            # Add all products to feed
            for product in saturn_products:
                add_product_to_feed(product, 'Saturn')

            for product in mediamarkt_products:
                add_product_to_feed(product, 'MediaMarkt')

            for product in otto_products:
                add_product_to_feed(product, 'Otto')

            for product in kaufland_products:
                add_product_to_feed(product, 'Kaufland')

            # Convert to pretty XML string
            xml_string = minidom.parseString(tostring(rss, encoding='utf-8')).toprettyxml(indent='  ', encoding='utf-8')

            # Return XML response with cache headers
            response = HttpResponse(xml_string, content_type='application/xml; charset=utf-8')
            response['Cache-Control'] = 'public, s-maxage=86400, stale-while-revalidate=43200'

            return response

        except Exception as e:
            import traceback
            logger.error(f"Google Merchant Feed error: {traceback.format_exc()}")
            return HttpResponse(
                f'<?xml version="1.0"?><error>{str(e)}</error>',
                content_type='application/xml',
                status=500
            )

    @action(detail=False, methods=['post'])
    def sync_to_google_merchant(self, request):
        """
        Sync products to Google Merchant Center via API.

        Query parameters:
        - limit (int): Number of products to sync (default: 100, max: 10000)
        - retailer (str): Filter by retailer (saturn, mediamarkt, otto, or all)

        Returns:
            JSON response with sync statistics
        """
        try:
            # Get query parameters
            limit = int(request.query_params.get('limit', 100))
            limit = min(limit, 10000)  # Cap at 10000
            retailer = request.query_params.get('retailer', 'all').lower()

            # Initialize Google Merchant service
            try:
                merchant_service = get_merchant_service()
            except Exception as e:
                return Response(
                    {
                        'error': 'Failed to initialize Google Merchant service',
                        'detail': str(e)
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Fetch products based on retailer filter
            all_products = []

            if retailer in ['saturn', 'all']:
                saturn_products = list(
                    SaturnProduct.objects.order_by('-scraped_at').limit(limit)
                )
                all_products.extend([
                    {
                        'id': str(p.id),
                        'title': p.title,
                        'description': p.description,
                        'price': p.price,
                        'image': p.image,
                        'brand': p.brand,
                        'gtin': p.gtin,
                        'category': p.category,
                    }
                    for p in saturn_products
                ])

            if retailer in ['mediamarkt', 'all']:
                mediamarkt_products = list(
                    MediaMarktProduct.objects.order_by('-scraped_at').limit(limit)
                )
                all_products.extend([
                    {
                        'id': str(p.id),
                        'title': p.title,
                        'description': p.description,
                        'price': p.price,
                        'image': p.image,
                        'brand': p.brand,
                        'gtin': p.gtin,
                        'category': p.category,
                    }
                    for p in mediamarkt_products
                ])

            if retailer in ['otto', 'all']:
                otto_products = list(
                    OttoProduct.objects.order_by('-scraped_at').limit(limit)
                )
                all_products.extend([
                    {
                        'id': str(p.id),
                        'title': p.title,
                        'description': p.description,
                        'price': p.price,
                        'image': p.image,
                        'brand': p.brand,
                        'gtin': p.gtin,
                        'category': p.category,
                    }
                    for p in otto_products
                ])

            if retailer in ['kaufland', 'all']:
                kaufland_products = list(
                    KauflandProduct.objects.order_by('-scraped_at').limit(limit)
                )
                all_products.extend([
                    {
                        'id': str(p.id),
                        'title': p.title,
                        'description': p.description,
                        'price': p.price,
                        'image': p.image,
                        'brand': p.brand,
                        'gtin': p.gtin,
                        'category': p.category,
                    }
                    for p in kaufland_products
                ])

            # Limit total products if needed
            all_products = all_products[:limit]

            if not all_products:
                return Response(
                    {
                        'message': 'No products found to sync',
                        'stats': {
                            'total': 0,
                            'success': 0,
                            'failed': 0
                        }
                    },
                    status=status.HTTP_200_OK
                )

            # Batch upload products to Google Merchant Center
            sync_stats = merchant_service.batch_insert_products(all_products)

            return Response(
                {
                    'message': f'Successfully synced products to Google Merchant Center',
                    'stats': sync_stats
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            import traceback
            logger.error(f"Google Merchant sync error: {traceback.format_exc()}")
            return Response(
                {
                    'error': 'Failed to sync products to Google Merchant Center',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

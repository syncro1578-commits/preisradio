from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.views.decorators.cache import cache_page
from django.views.decorators.http import condition
from django.utils.decorators import method_decorator
from django.http import HttpResponse
from mongoengine.queryset.visitor import Q
from .models import SaturnProduct, MediaMarktProduct, OttoProduct
from .serializers import (
    SaturnProductSerializer,
    MediaMarktProductSerializer,
    OttoProductSerializer,
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
    """ViewSet for retailers (Saturn, MediaMarkt, and Otto)"""

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
            }
        ]
        return Response({'results': retailers})

    def _safe_count(self, model):
        """Safely count documents, return 0 if connection fails"""
        try:
            return model.objects.count()
        except Exception as e:
            print(f"Warning: Could not count {model.__name__}: {e}")
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
            }
        }
        if pk in retailers:
            return Response(retailers[pk])
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class ProductViewSet(viewsets.ViewSet):
    """ViewSet for products from all retailers (Saturn, MediaMarkt, and Otto)"""

    def _calculate_search_relevance(self, product, search_term):
        """Calculate relevance score for a product based on search term match.

        Scoring:
        - Title exact match: 100
        - Title starts with: 80
        - Title contains: 60
        - Description exact match: 40
        - Description starts with: 30
        - Description contains: 20
        - Brand match: 50
        - GTIN match: 70
        """
        if not search_term:
            return 0

        search_lower = search_term.lower()
        score = 0

        # Check title (highest priority)
        if product.title:
            title_lower = product.title.lower()
            if title_lower == search_lower:
                score = max(score, 100)
            elif title_lower.startswith(search_lower):
                score = max(score, 80)
            elif search_lower in title_lower:
                score = max(score, 60)

        # Check GTIN (exact match important for products)
        if product.gtin and product.gtin.lower() == search_lower:
            score = max(score, 70)

        # Check brand (moderate priority)
        if product.brand and search_lower in product.brand.lower():
            score = max(score, 50)

        # Check description (lowest priority)
        if product.description:
            desc_lower = product.description.lower()
            if desc_lower == search_lower:
                score = max(score, 40)
            elif desc_lower.startswith(search_lower):
                score = max(score, 30)
            elif search_lower in desc_lower:
                score = max(score, 20)

        return score

    def list(self, request):
        """List products from both retailers with filtering and search"""
        search = request.query_params.get('search', '')
        category = request.query_params.get('category', '')
        brand = request.query_params.get('brand', '')
        retailer = request.query_params.get('retailer', 'all').lower()  # normalize to lowercase
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))

        # Build queries with filters
        saturn_query = None
        mediamarkt_query = None
        otto_query = None

        if retailer in ['all', 'saturn']:
            saturn_query = SaturnProduct.objects()
            if category:
                saturn_query = saturn_query.filter(category=category)
            if brand:
                saturn_query = saturn_query.filter(brand=brand)
            if search:
                saturn_query = saturn_query.filter(
                    Q(title__icontains=search) |
                    Q(gtin__icontains=search) |
                    Q(description__icontains=search) |
                    Q(brand__icontains=search)
                )

        if retailer in ['all', 'mediamarkt']:
            mediamarkt_query = MediaMarktProduct.objects()
            if category:
                mediamarkt_query = mediamarkt_query.filter(category=category)
            if brand:
                mediamarkt_query = mediamarkt_query.filter(brand=brand)
            if search:
                mediamarkt_query = mediamarkt_query.filter(
                    Q(title__icontains=search) |
                    Q(gtin__icontains=search) |
                    Q(description__icontains=search) |
                    Q(brand__icontains=search)
                )

        if retailer in ['all', 'otto']:
            otto_query = OttoProduct.objects()
            if category:
                otto_query = otto_query.filter(category=category)
            if brand:
                otto_query = otto_query.filter(brand=brand)
            if search:
                otto_query = otto_query.filter(
                    Q(title__icontains=search) |
                    Q(gtin__icontains=search) |
                    Q(description__icontains=search) |
                    Q(brand__icontains=search)
                )

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

        else:
            # For 'all' retailers - load from both and merge with relevance scoring
            saturn_count = saturn_query.count() if saturn_query else 0
            mediamarkt_count = mediamarkt_query.count() if mediamarkt_query else 0
            total_count = saturn_count + mediamarkt_count
            otto_count = otto_query.count() if otto_query else 0
            total_count = saturn_count + mediamarkt_count + otto_count

            # Load enough results to ensure good page results after sorting
            # Cap at 10000 to respect MAX_PAGE_SIZE setting
            load_size = min(max(page_size * 5, 250), 10000)

            saturn_results = list(saturn_query.order_by('-scraped_at').limit(load_size)) if saturn_query else []
            mediamarkt_results = list(mediamarkt_query.order_by('-scraped_at').limit(load_size)) if mediamarkt_query else []
            otto_results = list(otto_query.order_by('-scraped_at').limit(load_size)) if otto_query else []

            # Combine products with relevance scores
            products = [(p, 'saturn', self._calculate_search_relevance(p, search)) for p in saturn_results]
            products += [(p, 'mediamarkt', self._calculate_search_relevance(p, search)) for p in mediamarkt_results]
            products += [(p, 'otto', self._calculate_search_relevance(p, search)) for p in otto_results]

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
            else:
                continue  # Unknown retailer
            data = serializer.data
            data['retailer'] = source
            results.append(data)

        # Calculate pagination links
        has_next = (page * page_size) < total_count

        return Response({
            'count': total_count,
            'next': f'/api/products/?page={page + 1}' if has_next else None,
            'previous': f'/api/products/?page={page - 1}' if page > 1 else None,
            'results': results
        })

    def retrieve(self, request, pk=None):
        """Retrieve a product by ID"""
        # Try Saturn first
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
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all unique categories with pagination and search"""
        saturn_categories = set(SaturnProduct.objects.distinct('category'))
        mediamarkt_categories = set(MediaMarktProduct.objects.distinct('category'))
        otto_categories = set(OttoProduct.objects.distinct('category'))

        all_categories = sorted(list(saturn_categories | mediamarkt_categories | otto_categories))

        # Filter by search query
        search = request.query_params.get('search', '').lower()
        if search:
            all_categories = [c for c in all_categories if search in c.lower()]

        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 50))

        total_count = len(all_categories)
        start = (page - 1) * page_size
        end = start + page_size

        paginated_categories = all_categories[start:end]

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

        if not products:
            return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'results': products})

    @action(detail=True, methods=['get'])
    def similar(self, request, pk=None):
        """Get similar products based on category and brand"""
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

        # Find similar products in same category
        similar_products = []
        limit = 3

        if retailer == 'saturn':
            # Search in Saturn for similar products
            similar = SaturnProduct.objects.filter(
                category=product.category,
                id__ne=pk
            ).order_by('-scraped_at').limit(limit)

            for p in similar:
                serializer = SaturnProductSerializer(p)
                data = serializer.data
                data['retailer'] = 'saturn'
                similar_products.append(data)

            # If not enough results, try to find in MediaMarkt as well
            if len(similar_products) < limit:
                remaining = limit - len(similar_products)
                mediamarkt_similar = MediaMarktProduct.objects.filter(
                    category=product.category
                ).order_by('-scraped_at').limit(remaining)

                for p in mediamarkt_similar:
                    serializer = MediaMarktProductSerializer(p)
                    data = serializer.data
                    data['retailer'] = 'mediamarkt'
                    similar_products.append(data)
        else:
            # Search in MediaMarkt for similar products
            similar = MediaMarktProduct.objects.filter(
                category=product.category,
                id__ne=pk
            ).order_by('-scraped_at').limit(limit)

            for p in similar:
                serializer = MediaMarktProductSerializer(p)
                data = serializer.data
                data['retailer'] = 'mediamarkt'
                similar_products.append(data)

            # If not enough results, try to find in Saturn as well
            if len(similar_products) < limit:
                remaining = limit - len(similar_products)
                saturn_similar = SaturnProduct.objects.filter(
                    category=product.category
                ).order_by('-scraped_at').limit(remaining)

                for p in saturn_similar:
                    serializer = SaturnProductSerializer(p)
                    data = serializer.data
                    data['retailer'] = 'saturn'
                    similar_products.append(data)

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

            # Sort by date descending
            all_products.sort(key=lambda x: x['lastModified'], reverse=True)

            # Get total counts
            total_saturn = SaturnProduct.objects.count()
            total_mediamarkt = MediaMarktProduct.objects.count()
            total_otto = OttoProduct.objects.count()
            total_count = total_saturn + total_mediamarkt + total_otto

            return Response({
                'count': total_count,
                'returned': len(all_products),
                'limit': limit,
                'results': all_products[:limit]  # Return only up to limit
            })

        except Exception as e:
            import traceback
            print(f"Sitemap error: {traceback.format_exc()}")
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

            # Convert to pretty XML string
            xml_string = minidom.parseString(tostring(rss, encoding='utf-8')).toprettyxml(indent='  ', encoding='utf-8')

            # Return XML response with cache headers
            response = HttpResponse(xml_string, content_type='application/xml; charset=utf-8')
            response['Cache-Control'] = 'public, s-maxage=86400, stale-while-revalidate=43200'

            return response

        except Exception as e:
            import traceback
            print(f"Google Merchant Feed error: {traceback.format_exc()}")
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
            print(f"Google Merchant sync error: {traceback.format_exc()}")
            return Response(
                {
                    'error': 'Failed to sync products to Google Merchant Center',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

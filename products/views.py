from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.views.decorators.cache import cache_page
from django.views.decorators.http import condition
from django.utils.decorators import method_decorator
from mongoengine.queryset.visitor import Q
from .models import SaturnProduct, MediaMarktProduct
from .serializers import (
    SaturnProductSerializer,
    MediaMarktProductSerializer,
)
from datetime import datetime


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class RetailerViewSet(viewsets.ViewSet):
    """ViewSet for retailers (Saturn and MediaMarkt)"""

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
            }
        ]
        return Response({'results': retailers})

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
            }
        }
        if pk in retailers:
            return Response(retailers[pk])
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class ProductViewSet(viewsets.ViewSet):
    """ViewSet for products from both retailers"""

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

        # Apply pagination
        start = (page - 1) * page_size

        if retailer == 'saturn':
            # Single retailer pagination with relevance scoring
            saturn_results = list(saturn_query.order_by('-scraped_at').limit(1000)) if saturn_query else []
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
            mediamarkt_results = list(mediamarkt_query.order_by('-scraped_at').limit(1000)) if mediamarkt_query else []
            total_count = mediamarkt_query.count() if mediamarkt_query else 0

            # Add relevance scores and sort by score (descending), then by date
            mediamarkt_with_scores = [(p, 'mediamarkt', self._calculate_search_relevance(p, search)) for p in mediamarkt_results]
            mediamarkt_with_scores.sort(key=lambda x: (-x[2], -(x[0].scraped_at.timestamp() if x[0].scraped_at else 0)))

            # Apply pagination after sorting
            end = start + page_size
            page_products = mediamarkt_with_scores[start:end]
            page_products = [(p, source) for p, source, _ in page_products]

        else:
            # For 'all' retailers - load from both and merge with relevance scoring
            saturn_count = saturn_query.count() if saturn_query else 0
            mediamarkt_count = mediamarkt_query.count() if mediamarkt_query else 0
            total_count = saturn_count + mediamarkt_count

            # Load enough results to ensure good page results after sorting
            load_size = max(page_size * 5, 250)

            saturn_results = list(saturn_query.order_by('-scraped_at').limit(load_size)) if saturn_query else []
            mediamarkt_results = list(mediamarkt_query.order_by('-scraped_at').limit(load_size)) if mediamarkt_query else []

            # Combine products with relevance scores
            products = [(p, 'saturn', self._calculate_search_relevance(p, search)) for p in saturn_results]
            products += [(p, 'mediamarkt', self._calculate_search_relevance(p, search)) for p in mediamarkt_results]

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
            else:
                serializer = MediaMarktProductSerializer(product)
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
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all unique categories with pagination and search"""
        saturn_categories = set(SaturnProduct.objects.distinct('category'))
        mediamarkt_categories = set(MediaMarktProduct.objects.distinct('category'))

        all_categories = sorted(list(saturn_categories | mediamarkt_categories))

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

            # Sort by date descending
            all_products.sort(key=lambda x: x['lastModified'], reverse=True)

            # Get total counts
            total_saturn = SaturnProduct.objects.count()
            total_mediamarkt = MediaMarktProduct.objects.count()
            total_count = total_saturn + total_mediamarkt

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


@api_view(['POST'])
def contact_message(request):
    """Handle contact form submission"""
    from .models import ContactMessage
    from django.core.mail import send_mail
    from django.conf import settings

    try:
        # Get data from request
        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip()
        subject = request.data.get('subject', '').strip()
        message = request.data.get('message', '').strip()

        # Validate
        if not all([name, email, subject, message]):
            return Response(
                {'error': 'All fields are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save to database
        contact = ContactMessage(
            name=name,
            email=email,
            subject=subject,
            message=message
        )
        contact.save()

        # Send email to admin
        admin_message = f"""
Nouveau message de contact:

Nom: {name}
Email: {email}
Sujet: {subject}

Message:
{message}
"""
        send_mail(
            subject=f"Nouveau message: {subject}",
            message=admin_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['ghassengharbi191@gmail.com'],  # Admin email
            fail_silently=False,
        )

        # Send confirmation email to user
        send_mail(
            subject="Confirmation - Votre message a été reçu",
            message=f"""Bonjour {name},

Merci d'avoir nous contacté. Nous avons reçu votre message et nous vous répondrons dans les plus brefs délais.

Cordialement,
L'équipe Preisradio""",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response(
            {'message': 'Message envoyé avec succès', 'id': str(contact.id)},
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        print(f"Contact error: {str(e)}")
        return Response(
            {'error': f'Erreur lors de l\'envoi: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
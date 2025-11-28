from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from mongoengine.queryset.visitor import Q
from .models import SaturnProduct, MediaMarktProduct
from .serializers import (
    SaturnProductSerializer,
    MediaMarktProductSerializer,
)


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

    def list(self, request):
        """List products from both retailers with filtering and search"""
        search = request.query_params.get('search', '')
        category = request.query_params.get('category', '')
        retailer = request.query_params.get('retailer', 'all').lower()  # normalize to lowercase
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))

        # Get products from requested retailers
        products = []

        # If querying all retailers, limit to prevent loading entire database
        # For single retailer, use MongoDB pagination
        if retailer in ['all', 'saturn']:
            saturn_query = SaturnProduct.objects()
            if category:
                saturn_query = saturn_query.filter(category=category)
            if search:
                saturn_query = saturn_query.filter(
                    Q(title__icontains=search) |
                    Q(gtin__icontains=search) |
                    Q(description__icontains=search)
                )

            # Apply pagination at MongoDB level for single retailer
            if retailer == 'saturn':
                start = (page - 1) * page_size
                saturn_results = list(saturn_query.order_by('-scraped_at').skip(start).limit(page_size))
                products.extend([(p, 'saturn') for p in saturn_results])
            else:
                # For 'all', limit to avoid loading entire database
                saturn_results = list(saturn_query.order_by('-scraped_at').limit(1000))
                products.extend([(p, 'saturn') for p in saturn_results])

        if retailer in ['all', 'mediamarkt']:
            mediamarkt_query = MediaMarktProduct.objects()
            if category:
                mediamarkt_query = mediamarkt_query.filter(category=category)
            if search:
                mediamarkt_query = mediamarkt_query.filter(
                    Q(title__icontains=search) |
                    Q(gtin__icontains=search) |
                    Q(description__icontains=search)
                )

            # Apply pagination at MongoDB level for single retailer
            if retailer == 'mediamarkt':
                start = (page - 1) * page_size
                mediamarkt_results = list(mediamarkt_query.order_by('-scraped_at').skip(start).limit(page_size))
                products.extend([(p, 'mediamarkt') for p in mediamarkt_results])
            else:
                # For 'all', limit to avoid loading entire database
                mediamarkt_results = list(mediamarkt_query.order_by('-scraped_at').limit(1000))
                products.extend([(p, 'mediamarkt') for p in mediamarkt_results])

        # For 'all' retailer, sort combined results and paginate
        if retailer == 'all':
            products.sort(key=lambda x: x[0].scraped_at or '', reverse=True)
            total_count = len(products)
            start = (page - 1) * page_size
            end = start + page_size
            page_products = products[start:end]
        else:
            # For single retailer, already paginated
            page_products = products
            # Get accurate count for single retailer
            if retailer == 'saturn':
                total_count = SaturnProduct.objects.count() if not category and not search else saturn_query.count()
            else:
                total_count = MediaMarktProduct.objects.count() if not category and not search else mediamarkt_query.count()

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
        if retailer == 'all':
            has_next = end < total_count
        else:
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
        """Get all unique categories from both retailers"""
        saturn_categories = set(SaturnProduct.objects.distinct('category'))
        mediamarkt_categories = set(MediaMarktProduct.objects.distinct('category'))

        all_categories = sorted(list(saturn_categories | mediamarkt_categories))

        return Response({'results': all_categories})

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
        limit = 6

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
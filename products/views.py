from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
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
        retailer = request.query_params.get('retailer', 'all')  # all, saturn, mediamarkt
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))

        # Get products from requested retailers
        products = []

        if retailer in ['all', 'saturn']:
            saturn_query = SaturnProduct.objects()
            if category:
                saturn_query = saturn_query.filter(category=category)
            if search:
                saturn_query = saturn_query.filter(
                    title__icontains=search
                ) | saturn_query.filter(
                    gtin__icontains=search
                ) | saturn_query.filter(
                    description__icontains=search
                )
            products.extend([(p, 'saturn') for p in saturn_query.order_by('-scraped_at')])

        if retailer in ['all', 'mediamarkt']:
            mediamarkt_query = MediaMarktProduct.objects()
            if category:
                mediamarkt_query = mediamarkt_query.filter(category=category)
            if search:
                mediamarkt_query = mediamarkt_query.filter(
                    title__icontains=search
                ) | mediamarkt_query.filter(
                    gtin__icontains=search
                ) | mediamarkt_query.filter(
                    description__icontains=search
                )
            products.extend([(p, 'mediamarkt') for p in mediamarkt_query.order_by('-scraped_at')])

        # Sort combined results by scraped_at
        products.sort(key=lambda x: x[0].scraped_at or '', reverse=True)

        total_count = len(products)
        start = (page - 1) * page_size
        end = start + page_size
        page_products = products[start:end]

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

        return Response({
            'count': total_count,
            'next': f'/api/products/?page={page + 1}' if end < total_count else None,
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
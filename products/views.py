from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Retailer, Product
from .serializers import (
    RetailerSerializer,
    ProductListSerializer,
    ProductDetailSerializer,
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class RetailerViewSet(viewsets.ViewSet):
    """ViewSet pour les détaillants (MongoEngine)"""

    def list(self, request):
        """Lister tous les détaillants"""
        search = request.query_params.get('search', '')
        ordering = request.query_params.get('ordering', 'name')

        queryset = Retailer.objects()
        if search:
            queryset = queryset.filter(name__icontains=search)

        # Order by
        queryset = queryset.order_by(ordering)

        serializer = RetailerSerializer(queryset, many=True)
        return Response({'results': serializer.data})

    def retrieve(self, request, pk=None):
        """Récupérer un détaillant par ID"""
        try:
            retailer = Retailer.objects.get(id=pk)
            serializer = RetailerSerializer(retailer)
            return Response(serializer.data)
        except Retailer.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class ProductViewSet(viewsets.ViewSet):
    """ViewSet pour les produits (MongoEngine)"""

    def list(self, request):
        """Lister tous les produits avec filtrage et recherche"""
        search = request.query_params.get('search', '')
        category = request.query_params.get('category', '')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))

        queryset = Product.objects()

        # Filtrer par catégorie
        if category:
            queryset = queryset.filter(category=category)

        # Recherche
        if search:
            queryset = queryset.filter(
                name__icontains=search
            ) | queryset.filter(
                ean__icontains=search
            ) | queryset.filter(
                description__icontains=search
            )

        # Tri
        queryset = queryset.order_by('-created_at')

        # Paginer
        total_count = queryset.count()
        start = (page - 1) * page_size
        end = start + page_size
        products = queryset.skip(start).limit(page_size)

        serializer = ProductListSerializer(products, many=True)
        return Response({
            'count': total_count,
            'next': f'/api/products/?page={page + 1}' if end < total_count else None,
            'previous': f'/api/products/?page={page - 1}' if page > 1 else None,
            'results': serializer.data
        })

    def retrieve(self, request, pk=None):
        """Récupérer un produit par ID"""
        try:
            product = Product.objects.get(id=pk)
            serializer = ProductDetailSerializer(product)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def by_ean(self, request):
        """Récupérer un produit par code EAN"""
        ean = request.query_params.get('ean', '')
        if not ean:
            return Response({'detail': 'EAN parameter required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(ean=ean)
            serializer = ProductDetailSerializer(product)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

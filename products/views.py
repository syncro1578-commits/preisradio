from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Retailer, Product, Price
from .serializers import (
    RetailerSerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    PriceSerializer,
)


class RetailerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Retailer.objects.all()
    serializer_class = RetailerSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.prefetch_related('prices__retailer')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'ean', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    @action(detail=True, methods=['get'])
    def by_ean(self, request, pk=None):
        """Get product by EAN code"""
        try:
            product = Product.objects.get(ean=pk)
            serializer = ProductDetailSerializer(product)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response({'detail': 'Product not found'}, status=404)


class PriceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Price.objects.select_related('product', 'retailer').order_by('price')
    serializer_class = PriceSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['product', 'retailer', 'stock_status']
    ordering_fields = ['price', 'last_checked']
    ordering = ['price']

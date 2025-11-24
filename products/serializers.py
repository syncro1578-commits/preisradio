from rest_framework import serializers
from .models import Retailer, Product, Price


class RetailerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Retailer
        fields = ['id', 'name', 'slug', 'website', 'logo', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class PriceSerializer(serializers.ModelSerializer):
    retailer = RetailerSerializer(read_only=True)
    retailer_id = serializers.PrimaryKeyRelatedField(
        queryset=Retailer.objects.all(),
        write_only=True,
        source='retailer'
    )

    class Meta:
        model = Price
        fields = [
            'id', 'product', 'retailer', 'retailer_id', 'price', 'currency',
            'stock_status', 'url', 'last_checked', 'created_at'
        ]
        read_only_fields = ['last_checked', 'created_at']


class ProductListSerializer(serializers.ModelSerializer):
    min_price = serializers.SerializerMethodField()
    max_price = serializers.SerializerMethodField()
    price_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'ean', 'name', 'category', 'image', 'min_price', 'max_price', 'price_count']

    def get_min_price(self, obj):
        prices = obj.prices.all()
        if prices:
            return prices.first().price
        return None

    def get_max_price(self, obj):
        prices = obj.prices.all()
        if prices:
            return prices.last().price
        return None

    def get_price_count(self, obj):
        return obj.prices.count()


class ProductDetailSerializer(serializers.ModelSerializer):
    prices = PriceSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'ean', 'name', 'description', 'category', 'image', 'prices', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

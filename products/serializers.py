from rest_framework import serializers
from .models import Retailer, Product, Price


class RetailerSerializer(serializers.Serializer):
    """Serializer pour Retailer (MongoEngine)"""
    id = serializers.CharField(source='id', read_only=True)
    name = serializers.CharField(max_length=255)
    slug = serializers.CharField(max_length=255)
    website = serializers.URLField()
    logo = serializers.CharField(required=False, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        return Retailer.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class PriceSerializer(serializers.Serializer):
    """Serializer pour Price (EmbeddedDocument)"""
    retailer = serializers.SerializerMethodField()
    retailer_id = serializers.CharField(source='retailer.id', read_only=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField(max_length=3, default='EUR')
    stock_status = serializers.CharField(max_length=50)
    url = serializers.URLField(required=False, allow_null=True)
    last_checked = serializers.DateTimeField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    def get_retailer(self, obj):
        if obj.retailer:
            return RetailerSerializer(obj.retailer).data
        return None


class ProductListSerializer(serializers.Serializer):
    """Serializer pour Product (liste)"""
    id = serializers.CharField(source='id', read_only=True)
    ean = serializers.CharField(max_length=13)
    name = serializers.CharField(max_length=500)
    category = serializers.CharField(max_length=255)
    image = serializers.CharField(required=False, allow_null=True)
    min_price = serializers.SerializerMethodField()
    max_price = serializers.SerializerMethodField()
    price_count = serializers.SerializerMethodField()

    def get_min_price(self, obj):
        price_obj = obj.get_min_price()
        return float(price_obj.price) if price_obj else None

    def get_max_price(self, obj):
        price_obj = obj.get_max_price()
        return float(price_obj.price) if price_obj else None

    def get_price_count(self, obj):
        return len(obj.prices) if obj.prices else 0


class ProductDetailSerializer(serializers.Serializer):
    """Serializer pour Product (détail)"""
    id = serializers.CharField(source='id', read_only=True)
    ean = serializers.CharField(max_length=13)
    name = serializers.CharField(max_length=500)
    description = serializers.CharField(required=False, allow_null=True)
    category = serializers.CharField(max_length=255)
    image = serializers.CharField(required=False, allow_null=True)
    prices = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def get_prices(self, obj):
        if obj.prices:
            return PriceSerializer(obj.prices, many=True).data
        return []

    def create(self, validated_data):
        return Product.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            if attr != 'prices':
                setattr(instance, attr, value)
        instance.save()
        return instance

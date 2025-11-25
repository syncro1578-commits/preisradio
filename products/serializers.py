from rest_framework import serializers
from .models import SaturnProduct, MediaMarktProduct


class SaturnProductSerializer(serializers.Serializer):
    """Serializer for Saturn products"""
    id = serializers.CharField(source='id', read_only=True)
    sku = serializers.CharField(max_length=50, required=False)
    brand = serializers.CharField(max_length=255, required=False, allow_null=True)
    category = serializers.CharField(max_length=255)
    currency = serializers.CharField(max_length=3, default='EUR')
    description = serializers.CharField(required=False, allow_null=True)
    discount = serializers.CharField(max_length=10, required=False, allow_null=True)
    gtin = serializers.CharField(max_length=14, required=False, allow_null=True)
    image = serializers.URLField(required=False, allow_null=True)
    old_price = serializers.FloatField(required=False, allow_null=True)
    price = serializers.FloatField()
    scraped_at = serializers.DateTimeField(required=False, allow_null=True)
    title = serializers.CharField(max_length=500)
    url = serializers.URLField()


class MediaMarktProductSerializer(serializers.Serializer):
    """Serializer for MediaMarkt products"""
    id = serializers.CharField(source='id', read_only=True)
    sku = serializers.CharField(max_length=50, required=False)
    brand = serializers.CharField(max_length=255, required=False, allow_null=True)
    category = serializers.CharField(max_length=255)
    currency = serializers.CharField(max_length=3, default='EUR')
    description = serializers.CharField(required=False, allow_null=True)
    discount = serializers.CharField(max_length=10, required=False, allow_null=True)
    gtin = serializers.CharField(max_length=14, required=False, allow_null=True)
    image = serializers.URLField(required=False, allow_null=True)
    old_price = serializers.FloatField(required=False, allow_null=True)
    price = serializers.FloatField()
    scraped_at = serializers.DateTimeField(required=False, allow_null=True)
    title = serializers.CharField(max_length=500)
    url = serializers.URLField()
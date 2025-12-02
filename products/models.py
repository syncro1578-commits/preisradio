from mongoengine import (
    Document, StringField, URLField, DateTimeField,
    FloatField, IntField
)
from datetime import datetime


class SaturnProduct(Document):
    """Saturn.de product from MongoDB"""
    sku = StringField(max_length=50, unique=True, sparse=True)
    brand = StringField(max_length=255, null=True, blank=True)
    category = StringField(max_length=255, required=True)
    currency = StringField(max_length=3, default='EUR')
    description = StringField(null=True, blank=True)
    discount = StringField(max_length=10, null=True, blank=True)
    gtin = StringField(max_length=14, null=True, blank=True)
    image = URLField(null=True, blank=True)
    old_price = FloatField(null=True, blank=True)
    price = FloatField(required=True)
    scraped_at = DateTimeField(null=True, blank=True)
    title = StringField(max_length=500, required=True)
    url = URLField(required=True)

    meta = {
        'collection': 'Db',
        'db_alias': 'default',
        'indexes': [
            'sku',
            'gtin',
            'category',
            'brand',
            'scraped_at',
        ]
    }

    def __str__(self):
        return self.title


class MediaMarktProduct(Document):
    """MediaMarkt.de product from MongoDB"""
    sku = StringField(max_length=50, unique=True, sparse=True)
    brand = StringField(max_length=255, null=True, blank=True)
    category = StringField(max_length=255, required=True)
    currency = StringField(max_length=3, default='EUR')
    description = StringField(null=True, blank=True)
    discount = StringField(max_length=10, null=True, blank=True)
    gtin = StringField(max_length=14, null=True, blank=True)
    image = URLField(null=True, blank=True)
    old_price = FloatField(null=True, blank=True)
    price = FloatField(required=True)
    scraped_at = DateTimeField(null=True, blank=True)
    title = StringField(max_length=500, required=True)
    url = URLField(required=True)

    meta = {
        'collection': 'Db',
        'db_alias': 'mediamarkt',
        'indexes': [
            'sku',
            'gtin',
            'category',
            'brand',
            'scraped_at',
        ]
    }

    def __str__(self):
        return self.title


class ContactMessage(Document):
    """Contact form messages"""
    name = StringField(max_length=255, required=True)
    email = StringField(max_length=255, required=True)
    subject = StringField(max_length=255, required=True)
    message = StringField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)
    is_read = IntField(default=0)  # 0 = not read, 1 = read

    meta = {
        'collection': 'ContactMessages',
        'indexes': [
            'created_at',
            'email',
        ]
    }

    def __str__(self):
        return f"{self.name} - {self.subject}"
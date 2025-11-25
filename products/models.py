from mongoengine import (
    Document, StringField, URLField, ImageField, DateTimeField,
    ReferenceField, DecimalField, ListField, EmbeddedDocument,
    EmbeddedDocumentField
)
from datetime import datetime


class Retailer(Document):
    """Détaillant/magasin allemand"""
    name = StringField(max_length=255, required=True)
    slug = StringField(max_length=255, unique=True, required=True)
    website = URLField(required=True)
    logo = StringField(null=True, blank=True)  # URL or file path
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'retailers',
        'indexes': ['slug', 'name'],
        'ordering': ['name']
    }

    def __str__(self):
        return self.name


class Price(EmbeddedDocument):
    """Sous-document pour les prix"""
    retailer = ReferenceField(Retailer, required=True)
    price = DecimalField(min_value=0, required=True)
    currency = StringField(max_length=3, default='EUR')
    stock_status = StringField(
        max_length=50,
        choices=['in_stock', 'low_stock', 'out_of_stock', 'unknown'],
        default='unknown'
    )
    url = URLField(null=True, blank=True)
    last_checked = DateTimeField(default=datetime.utcnow)
    created_at = DateTimeField(default=datetime.utcnow)


class Product(Document):
    """Produit allemand à comparer"""
    ean = StringField(max_length=13, unique=True, required=True, sparse=True)
    name = StringField(max_length=500, required=True)
    description = StringField(null=True, blank=True)
    category = StringField(max_length=255, required=True)
    image = StringField(null=True, blank=True)  # URL or file path
    prices = ListField(EmbeddedDocumentField(Price))
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'products',
        'indexes': [
            'ean',
            'category',
            'created_at',
            ('ean', '-created_at'),
        ]
    }

    def __str__(self):
        return self.name

    def get_min_price(self):
        """Retourne le prix minimum"""
        if not self.prices:
            return None
        return min(self.prices, key=lambda p: float(p.price))

    def get_max_price(self):
        """Retourne le prix maximum"""
        if not self.prices:
            return None
        return max(self.prices, key=lambda p: float(p.price))

from django.db import models
from django.utils import timezone


class Retailer(models.Model):
    """Détaillant/magasin allemand"""
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    website = models.URLField()
    logo = models.ImageField(upload_to='retailers/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Retailer'
        verbose_name_plural = 'Retailers'
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    """Produit allemand à comparer"""
    ean = models.CharField(max_length=13, unique=True, db_index=True)
    name = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=255, db_index=True)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        indexes = [
            models.Index(fields=['ean']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return self.name


class Price(models.Model):
    """Prix d'un produit chez un détaillant"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='prices')
    retailer = models.ForeignKey(Retailer, on_delete=models.CASCADE, related_name='prices')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='EUR')
    stock_status = models.CharField(
        max_length=50,
        choices=[
            ('in_stock', 'In Stock'),
            ('low_stock', 'Low Stock'),
            ('out_of_stock', 'Out of Stock'),
            ('unknown', 'Unknown'),
        ],
        default='unknown'
    )
    url = models.URLField(null=True, blank=True)
    last_checked = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Price'
        verbose_name_plural = 'Prices'
        unique_together = ('product', 'retailer')
        indexes = [
            models.Index(fields=['product', 'retailer']),
            models.Index(fields=['last_checked']),
        ]
        ordering = ['price']

    def __str__(self):
        return f"{self.product.name} - {self.retailer.name}: €{self.price}"

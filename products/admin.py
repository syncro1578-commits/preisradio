from django.contrib import admin
from .models import Retailer, Product, Price


@admin.register(Retailer)
class RetailerAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'website', 'created_at']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['ean', 'name', 'category', 'created_at']
    search_fields = ['ean', 'name']
    list_filter = ['category', 'created_at']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Price)
class PriceAdmin(admin.ModelAdmin):
    list_display = ['product', 'retailer', 'price', 'currency', 'stock_status', 'last_checked']
    search_fields = ['product__name', 'retailer__name']
    list_filter = ['retailer', 'stock_status', 'currency', 'last_checked']
    readonly_fields = ['last_checked', 'created_at']

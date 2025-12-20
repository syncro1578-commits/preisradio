"""
Google Merchant Center API integration.

This module provides a service for uploading products to Google Merchant Center
using the Content API for Shopping.
"""

import os
import json
from typing import Dict, List, Optional
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from django.conf import settings


class GoogleMerchantService:
    """
    Service for interacting with Google Merchant Center API.

    Handles authentication and product operations (insert, update, delete).
    """

    # API scopes required for Content API for Shopping
    SCOPES = ['https://www.googleapis.com/auth/content']

    def __init__(self, merchant_id: str, credentials_path: str):
        """
        Initialize the Google Merchant Center service.

        Args:
            merchant_id: Your Google Merchant Center account ID
            credentials_path: Path to the service account JSON key file
        """
        self.merchant_id = merchant_id
        self.credentials_path = credentials_path
        self.service = None
        self._authenticate()

    def _authenticate(self):
        """Authenticate using service account credentials."""
        try:
            credentials = service_account.Credentials.from_service_account_file(
                self.credentials_path,
                scopes=self.SCOPES
            )
            self.service = build('content', 'v2.1', credentials=credentials)
            print(f"✓ Authenticated with Google Merchant Center (Merchant ID: {self.merchant_id})")
        except Exception as e:
            print(f"✗ Failed to authenticate with Google Merchant Center: {e}")
            raise

    def _format_product_for_google(self, product_data: Dict) -> Dict:
        """
        Format product data according to Google Merchant Center API schema.

        Args:
            product_data: Product data from your database

        Returns:
            Formatted product data for Google API
        """
        # Extract product info
        product_id = str(product_data.get('id', ''))
        title = product_data.get('title', '')[:150]
        description = product_data.get('description', title)[:5000]
        price = product_data.get('price')
        image_url = product_data.get('image')
        brand = product_data.get('brand', '')[:70]
        gtin = product_data.get('gtin', '')
        category = product_data.get('category', '')

        # Build Google Merchant product
        google_product = {
            'offerId': product_id,
            'title': title,
            'description': description,
            'link': f'https://preisradio.de/product/{product_id}',
            'contentLanguage': 'de',
            'targetCountry': 'DE',
            'channel': 'online',
            'availability': 'in stock',
            'condition': 'new',
        }

        # Add price if available
        if price:
            google_product['price'] = {
                'value': str(price),
                'currency': 'EUR'
            }

        # Add image if available
        if image_url:
            google_product['imageLink'] = image_url

        # Add brand if available
        if brand:
            google_product['brand'] = brand

        # Add GTIN if available
        if gtin:
            google_product['gtin'] = str(gtin)

        # Add product type (category) if available
        if category:
            google_product['productTypes'] = [category]

        return google_product

    def insert_product(self, product_data: Dict) -> Optional[Dict]:
        """
        Insert a single product into Google Merchant Center.

        Args:
            product_data: Product data from your database

        Returns:
            API response or None if failed
        """
        try:
            google_product = self._format_product_for_google(product_data)

            request = self.service.products().insert(
                merchantId=self.merchant_id,
                body=google_product
            )

            response = request.execute()
            print(f"✓ Inserted product: {product_data.get('title', 'Unknown')[:50]}")
            return response

        except HttpError as e:
            error_details = json.loads(e.content.decode('utf-8'))
            print(f"✗ Failed to insert product {product_data.get('id')}: {error_details}")
            return None
        except Exception as e:
            print(f"✗ Unexpected error inserting product: {e}")
            return None

    def update_product(self, product_data: Dict) -> Optional[Dict]:
        """
        Update an existing product in Google Merchant Center.

        Note: Google Merchant Center doesn't have a separate update method.
        Use insert() which will update if the product already exists.

        Args:
            product_data: Product data from your database

        Returns:
            API response or None if failed
        """
        return self.insert_product(product_data)

    def delete_product(self, product_id: str) -> bool:
        """
        Delete a product from Google Merchant Center.

        Args:
            product_id: Product ID to delete

        Returns:
            True if successful, False otherwise
        """
        try:
            request = self.service.products().delete(
                merchantId=self.merchant_id,
                productId=f'online:de:DE:{product_id}'
            )

            request.execute()
            print(f"✓ Deleted product: {product_id}")
            return True

        except HttpError as e:
            error_details = json.loads(e.content.decode('utf-8'))
            print(f"✗ Failed to delete product {product_id}: {error_details}")
            return False
        except Exception as e:
            print(f"✗ Unexpected error deleting product: {e}")
            return False

    def batch_insert_products(self, products_data: List[Dict], batch_size: int = 100) -> Dict:
        """
        Insert multiple products in batches.

        Args:
            products_data: List of product data from your database
            batch_size: Number of products to insert per batch (max 1000)

        Returns:
            Statistics about the batch operation
        """
        total = len(products_data)
        success_count = 0
        failed_count = 0
        failed_products = []

        print(f"Starting batch upload of {total} products...")

        for i in range(0, total, batch_size):
            batch = products_data[i:i + batch_size]
            print(f"Processing batch {i // batch_size + 1}/{(total + batch_size - 1) // batch_size}...")

            for product_data in batch:
                result = self.insert_product(product_data)
                if result:
                    success_count += 1
                else:
                    failed_count += 1
                    failed_products.append(product_data.get('id'))

        stats = {
            'total': total,
            'success': success_count,
            'failed': failed_count,
            'failed_products': failed_products
        }

        print(f"\n=== Batch Upload Complete ===")
        print(f"Total: {total}")
        print(f"Success: {success_count}")
        print(f"Failed: {failed_count}")

        return stats

    def get_product(self, product_id: str) -> Optional[Dict]:
        """
        Retrieve a product from Google Merchant Center.

        Args:
            product_id: Product ID to retrieve

        Returns:
            Product data or None if not found
        """
        try:
            request = self.service.products().get(
                merchantId=self.merchant_id,
                productId=f'online:de:DE:{product_id}'
            )

            response = request.execute()
            return response

        except HttpError as e:
            if e.resp.status == 404:
                print(f"Product {product_id} not found in Google Merchant Center")
            else:
                error_details = json.loads(e.content.decode('utf-8'))
                print(f"✗ Failed to get product {product_id}: {error_details}")
            return None
        except Exception as e:
            print(f"✗ Unexpected error getting product: {e}")
            return None

    def list_products(self, max_results: int = 100) -> List[Dict]:
        """
        List products from Google Merchant Center.

        Args:
            max_results: Maximum number of products to retrieve

        Returns:
            List of products
        """
        try:
            request = self.service.products().list(
                merchantId=self.merchant_id,
                maxResults=max_results
            )

            response = request.execute()
            return response.get('resources', [])

        except HttpError as e:
            error_details = json.loads(e.content.decode('utf-8'))
            print(f"✗ Failed to list products: {error_details}")
            return []
        except Exception as e:
            print(f"✗ Unexpected error listing products: {e}")
            return []


def get_merchant_service() -> GoogleMerchantService:
    """
    Factory function to create a GoogleMerchantService instance.

    Reads configuration from Django settings or environment variables.

    Returns:
        Configured GoogleMerchantService instance
    """
    # Get Merchant ID from settings or environment
    merchant_id = getattr(settings, 'GOOGLE_MERCHANT_ID', os.getenv('GOOGLE_MERCHANT_ID'))

    # Get credentials path from settings or use default
    credentials_path = getattr(
        settings,
        'GOOGLE_SERVICE_ACCOUNT_KEY',
        os.path.join(settings.BASE_DIR.parent, 'astute-pride-262723-7f9bd77e07a5.json')
    )

    if not merchant_id:
        raise ValueError(
            "GOOGLE_MERCHANT_ID not found in settings or environment. "
            "Please set it in settings.py or as an environment variable."
        )

    if not os.path.exists(credentials_path):
        raise FileNotFoundError(
            f"Google service account key file not found at {credentials_path}. "
            "Please ensure the file exists and the path is correct."
        )

    return GoogleMerchantService(merchant_id, credentials_path)

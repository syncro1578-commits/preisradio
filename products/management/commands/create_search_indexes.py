"""
Django management command to create MongoDB text indexes for improved search performance.

Usage:
    python manage.py create_search_indexes
"""

from django.core.management.base import BaseCommand
from products.models import SaturnProduct, MediaMarktProduct, OttoProduct, KauflandProduct
import pymongo


class Command(BaseCommand):
    help = 'Create MongoDB text indexes for product search optimization'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('Creating MongoDB text indexes for search...'))

        # Index configuration with weights
        # Higher weight = higher importance in text search
        text_index_config = [
            ('title', pymongo.TEXT),
            ('brand', pymongo.TEXT),
            ('description', pymongo.TEXT),
            ('gtin', pymongo.TEXT),
        ]

        index_weights = {
            'title': 10,      # Title is most important
            'brand': 5,       # Brand is moderately important
            'gtin': 3,        # GTIN for exact matching
            'description': 1  # Description is least important
        }

        try:
            # Create index for Saturn products
            self.stdout.write('Creating text index for SaturnProduct...')

            saturn_collection = SaturnProduct._get_collection()
            try:
                saturn_collection.create_index(
                    text_index_config,
                    name='search_text_index',
                    weights=index_weights,
                    default_language='german',
                    language_override='language'
                )
                self.stdout.write(self.style.SUCCESS('✓ SaturnProduct text index created'))
            except Exception as e:
                if 'already exists' in str(e):
                    self.stdout.write(self.style.WARNING('⚠ SaturnProduct text index already exists'))
                else:
                    raise

            # Create additional indexes for common queries
            saturn_collection.create_index([('category', 1)])
            saturn_collection.create_index([('brand', 1)])
            saturn_collection.create_index([('scraped_at', -1)])
            saturn_collection.create_index([('price', 1)])
            self.stdout.write(self.style.SUCCESS('✓ SaturnProduct additional indexes created'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Saturn index error: {str(e)}'))

        try:
            # Create index for MediaMarkt products
            self.stdout.write('Creating text index for MediaMarktProduct...')

            mediamarkt_collection = MediaMarktProduct._get_collection()
            try:
                mediamarkt_collection.create_index(
                    text_index_config,
                    name='search_text_index',
                    weights=index_weights,
                    default_language='german',
                    language_override='language'
                )
                self.stdout.write(self.style.SUCCESS('✓ MediaMarktProduct text index created'))
            except Exception as e:
                if 'already exists' in str(e):
                    self.stdout.write(self.style.WARNING('⚠ MediaMarktProduct text index already exists'))
                else:
                    raise

            mediamarkt_collection.create_index([('category', 1)])
            mediamarkt_collection.create_index([('brand', 1)])
            mediamarkt_collection.create_index([('scraped_at', -1)])
            mediamarkt_collection.create_index([('price', 1)])
            self.stdout.write(self.style.SUCCESS('✓ MediaMarktProduct additional indexes created'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ MediaMarkt index error: {str(e)}'))

        try:
            # Create index for Otto products
            self.stdout.write('Creating text index for OttoProduct...')

            otto_collection = OttoProduct._get_collection()
            try:
                otto_collection.create_index(
                    text_index_config,
                    name='search_text_index',
                    weights=index_weights,
                    default_language='german',
                    language_override='language'
                )
                self.stdout.write(self.style.SUCCESS('✓ OttoProduct text index created'))
            except Exception as e:
                if 'already exists' in str(e):
                    self.stdout.write(self.style.WARNING('⚠ OttoProduct text index already exists'))
                else:
                    raise

            otto_collection.create_index([('category', 1)])
            otto_collection.create_index([('brand', 1)])
            otto_collection.create_index([('scraped_at', -1)])
            otto_collection.create_index([('price', 1)])
            self.stdout.write(self.style.SUCCESS('✓ OttoProduct additional indexes created'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Otto index error: {str(e)}'))

        try:
            # Create index for Kaufland products
            self.stdout.write('Creating text index for KauflandProduct...')

            kaufland_collection = KauflandProduct._get_collection()
            try:
                kaufland_collection.create_index(
                    text_index_config,
                    name='search_text_index',
                    weights=index_weights,
                    default_language='german',
                    language_override='language'
                )
                self.stdout.write(self.style.SUCCESS('✓ KauflandProduct text index created'))
            except Exception as e:
                if 'already exists' in str(e):
                    self.stdout.write(self.style.WARNING('⚠ KauflandProduct text index already exists'))
                else:
                    raise

            kaufland_collection.create_index([('category', 1)])
            kaufland_collection.create_index([('brand', 1)])
            kaufland_collection.create_index([('scraped_at', -1)])
            kaufland_collection.create_index([('price', 1)])
            self.stdout.write(self.style.SUCCESS('✓ KauflandProduct additional indexes created'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Kaufland index error: {str(e)}'))

        self.stdout.write(self.style.SUCCESS('\n✓ All search indexes created successfully!'))
        self.stdout.write('\nIndexes created:')
        self.stdout.write('  - Text search index (title, brand, description, gtin) with German language support')
        self.stdout.write('  - Category index (for filtering)')
        self.stdout.write('  - Brand index (for filtering)')
        self.stdout.write('  - Scraped date index (for freshness sorting)')
        self.stdout.write('  - Price index (for price sorting)')
        self.stdout.write('\nThese indexes will significantly improve search performance!')

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
import json

# Health Check et Status endpoints
@api_view(['GET'])
def health_check(request):
    """
    Health check endpoint pour vérifier que le serveur est actif
    """
    return Response({
        'status': 'healthy',
        'message': 'PrixRadio API is running',
        'timestamp': str(__import__('datetime').datetime.utcnow()),
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def api_status(request):
    """
    Endpoint pour vérifier le statut de l'API et les dépendances
    """
    from products.models import SaturnProduct, MediaMarktProduct, OttoProduct, KauflandProduct
    import logging

    logger = logging.getLogger(__name__)

    try:
        # Test MongoDB connection for all retailers
        saturn_count = SaturnProduct.objects.count()
        mediamarkt_count = MediaMarktProduct.objects.count()
        otto_count = OttoProduct.objects.count()

        # Kaufland may have connection issues, handle gracefully
        try:
            kaufland_count = KauflandProduct.objects.count()
        except Exception as e:
            logger.warning(f"Could not count Kaufland products: {e}")
            kaufland_count = 0

        product_count = saturn_count + mediamarkt_count + otto_count + kaufland_count

        return Response({
            'status': 'operational',
            'version': '1.0.0',
            'api': {
                'products': {
                    'total': product_count,
                    'saturn': saturn_count,
                    'mediamarkt': mediamarkt_count,
                    'otto': otto_count,
                    'kaufland': kaufland_count,
                },
                'retailers': 4,  # Saturn, MediaMarkt, Otto, Kaufland
            },

            'dependencies': {
                'mongodb': 'connected',
            },
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'status': 'error',
            'error': str(e),
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


def health_check_simple(request):
    """
    Simple health check endpoint (without DRF) for load balancers
    """
    return JsonResponse({
        'status': 'ok',
        'service': 'preisradio-api'
    })

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
    from products.models import SaturnProduct, MediaMarktProduct

    try:
        # Test MongoDB connection
        saturn_count = SaturnProduct.objects.count()
        mediamarkt_count = MediaMarktProduct.objects.count()
        product_count = saturn_count + mediamarkt_count

        return Response({
            'status': 'operational',
            'version': '1.0.0',
            'api': {
                'products': {
                    'total': product_count,
                    'saturn': saturn_count,
                    'mediamarkt': mediamarkt_count,
                },
                'retailers': 2,  # Saturn et MediaMarkt
            }

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

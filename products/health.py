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
    from products.models import Product, Retailer

    try:
        # Test MongoDB connection
        product_count = Product.objects.count()
        retailer_count = Retailer.objects.count()

        return Response({
            'status': 'operational',
            'version': '1.0.0',
            'api': {
                'products': product_count,
                'retailers': retailer_count,
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

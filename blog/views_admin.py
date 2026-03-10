"""
AJAX endpoint for AI article generation inside the Wagtail page editor.
"""
import json

from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST

from blog.ai_generator import generate_article


@require_POST
@staff_member_required
def ai_generate_ajax(request):
    """AJAX: generate article fields from a topic string."""
    try:
        body = json.loads(request.body)
        topic = body.get('topic', '').strip()
        category = body.get('category', 'Kaufberatung')
    except (json.JSONDecodeError, AttributeError):
        topic = request.POST.get('topic', '').strip()
        category = request.POST.get('category', 'Kaufberatung')

    if not topic:
        return JsonResponse({'error': 'Kein Thema angegeben.'}, status=400)

    try:
        result = generate_article(topic, category)
        return JsonResponse(result)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

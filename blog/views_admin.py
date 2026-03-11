"""
AJAX endpoint for AI article generation.
Creates a draft BlogPage server-side and returns its edit URL.
"""
import json
import re

from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from blog.models import BlogPage, BlogIndexPage
from blog.ai_generator import generate_article


def _slugify_de(text):
    """Generate a URL-safe slug from German text."""
    slug = text.lower()
    for src, dst in [('ä', 'ae'), ('ö', 'oe'), ('ü', 'ue'), ('ß', 'ss')]:
        slug = slug.replace(src, dst)
    slug = re.sub(r'[^a-z0-9]+', '-', slug).strip('-')
    return slug[:80]


@csrf_exempt
@require_POST
@staff_member_required
def ai_generate_ajax(request):
    """AJAX: generate article, create draft BlogPage, return edit URL."""
    try:
        body = json.loads(request.body)
        topic = body.get('topic', '').strip()
        category = body.get('category', 'Kaufberatung')
    except (json.JSONDecodeError, AttributeError):
        topic = request.POST.get('topic', '').strip()
        category = request.POST.get('category', 'Kaufberatung')

    if not topic:
        return JsonResponse({'error': 'Kein Thema angegeben.'}, status=400)

    parent = BlogIndexPage.objects.first()
    if not parent:
        return JsonResponse({'error': 'BlogIndexPage nicht gefunden.'}, status=500)

    try:
        result = generate_article(topic, category)

        page = BlogPage(
            title=result['title'],
            slug=_slugify_de(result['title']),
            excerpt=result['excerpt'][:500],
            content=result['content'],
            category=category,
            amazon_keywords=result.get('amazon_keywords', ''),
            read_time=int(result.get('read_time', 5)),
            seo_title=result.get('seo_title', result['title'])[:255],
            search_description=result.get('meta_description', result['excerpt'])[:255],
        )
        parent.add_child(instance=page)
        page.save_revision()

        return JsonResponse({
            'success': True,
            'title': result['title'],
            'edit_url': f'/wagtail-admin/pages/{page.pk}/edit/',
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

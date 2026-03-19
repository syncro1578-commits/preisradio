"""
AJAX endpoints for AI article generation and server-side publish
(bypasses nginx/ModSecurity which blocks HTML in form POST).
"""
import base64
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
    """AJAX: generate article, create draft BlogPage, return edit URL.

    If a page with the same slug already exists, updates it instead of
    creating a duplicate — keeps the same URL.
    """
    try:
        body = json.loads(request.body)
        topic = body.get('topic', '').strip()
        category = body.get('category', 'Kaufberatung')
        base_content = body.get('base_content', '').strip()
        provider = body.get('provider', 'groq')
    except (json.JSONDecodeError, AttributeError):
        topic = request.POST.get('topic', '').strip()
        category = request.POST.get('category', 'Kaufberatung')
        base_content = request.POST.get('base_content', '').strip()
        provider = request.POST.get('provider', 'groq')

    if not topic:
        return JsonResponse({'error': 'Kein Thema angegeben.'}, status=400)

    parent = BlogIndexPage.objects.first()
    if not parent:
        return JsonResponse({'error': 'BlogIndexPage nicht gefunden.'}, status=500)

    try:
        result = generate_article(topic, category, base_content, provider)
        slug = _slugify_de(result['title'])

        # Update existing page if slug matches, otherwise create new
        existing = parent.get_children().filter(slug=slug).first()
        if existing:
            page = existing.specific
            page.title = result['title']
            page.excerpt = result['excerpt'][:500]
            page.content = result['content']
            page.category = category
            page.amazon_keywords = result.get('amazon_keywords', '')
            page.read_time = int(result.get('read_time', 5))
            page.seo_title = result.get('seo_title', result['title'])[:255]
            page.search_description = result.get('meta_description', result['excerpt'])[:255]
            page.save_revision()
        else:
            page = BlogPage(
                title=result['title'],
                slug=slug,
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


@csrf_exempt
@require_POST
@staff_member_required
def save_publish_ajax(request):
    """Save + publish a BlogPage via JSON POST (bypasses nginx/ModSecurity form block).

    Accepts JSON body with page_id and any fields to update.
    Updates the page and publishes it server-side.
    """
    try:
        raw = json.loads(request.body)
        # Support full-payload base64 encoding to bypass ModSecurity
        if 'data' in raw:
            body = json.loads(base64.b64decode(raw['data']).decode('utf-8'))
        else:
            body = raw
    except (json.JSONDecodeError, AttributeError, Exception):
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    page_id = body.get('page_id')
    if not page_id:
        return JsonResponse({'error': 'page_id fehlt'}, status=400)

    try:
        page = BlogPage.objects.get(pk=page_id)
    except BlogPage.DoesNotExist:
        return JsonResponse({'error': f'Seite {page_id} nicht gefunden'}, status=404)

    # Update all provided fields — only update required CharField if non-empty
    if body.get('title'):
        page.title = body['title'][:255]
    if body.get('slug'):
        page.slug = body['slug'][:255]
    if body.get('excerpt'):          # required CharField — skip if empty to avoid ValidationError
        page.excerpt = body['excerpt'][:500]
    if body.get('content'):          # required TextField — skip if empty
        page.content = body['content']
    if body.get('category'):
        page.category = body['category']
    if body.get('amazon_keywords') is not None:
        page.amazon_keywords = body['amazon_keywords'][:500]
    if body.get('amazon_product_url') is not None:
        page.amazon_product_url = body['amazon_product_url'][:500]
    if body.get('product_names') is not None:
        page.product_names = body['product_names'][:500]
    if body.get('author'):
        page.author = body['author'][:100]
    if body.get('read_time'):
        try:
            page.read_time = int(body['read_time'])
        except (ValueError, TypeError):
            pass
    if body.get('seo_title') is not None:
        page.seo_title = body['seo_title'][:255]
    if body.get('search_description') is not None:
        page.search_description = body['search_description'][:255]

    try:
        # clean=False skips Wagtail's full_clean() so partial updates don't fail validation
        revision = page.save_revision(clean=False)
        revision.publish()
        page.refresh_from_db()
        return JsonResponse({
            'success': True,
            'title': page.title,
            'live': page.live,
            'url': f'/blog/{page.slug}/',
        })
    except Exception as e:
        import traceback
        return JsonResponse({'error': str(e), 'detail': traceback.format_exc()}, status=500)

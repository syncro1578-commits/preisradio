"""
Wagtail admin view for AI article generation.
"""
import re

from django.contrib.admin.views.decorators import staff_member_required
from django.contrib import messages
from django.shortcuts import render, redirect

from blog.models import BlogPage, BlogIndexPage, CATEGORY_CHOICES
from blog.ai_generator import generate_article


def _slugify_de(text):
    """Generate a URL-safe slug from German text."""
    slug = text.lower()
    # Replace umlauts
    for src, dst in [('ä', 'ae'), ('ö', 'oe'), ('ü', 'ue'), ('ß', 'ss')]:
        slug = slug.replace(src, dst)
    slug = re.sub(r'[^a-z0-9]+', '-', slug).strip('-')
    return slug[:80]


@staff_member_required
def ai_generate_view(request):
    """Admin page: enter a topic → Grok generates a draft BlogPage."""
    categories = [c[0] for c in CATEGORY_CHOICES]

    if request.method == 'POST':
        topic = request.POST.get('topic', '').strip()
        category = request.POST.get('category', 'Kaufberatung')

        if not topic:
            messages.error(request, 'Bitte ein Thema eingeben.')
            return render(request, 'blog/ai_generate.html', {
                'categories': categories,
            })

        try:
            result = generate_article(topic, category)

            parent = BlogIndexPage.objects.first()
            if not parent:
                messages.error(request, 'BlogIndexPage nicht gefunden. Erstelle zuerst eine Blog-Übersichtsseite.')
                return render(request, 'blog/ai_generate.html', {
                    'categories': categories,
                })

            slug = _slugify_de(result['title'])

            page = BlogPage(
                title=result['title'],
                slug=slug,
                excerpt=result['excerpt'][:500],
                content=result['content'],
                category=category,
                amazon_keywords=result.get('amazon_keywords', ''),
                read_time=int(result.get('read_time', 5)),
            )
            parent.add_child(instance=page)
            page.save_revision()

            messages.success(
                request,
                f'Artikel "{result["title"]}" als Entwurf erstellt. Du kannst ihn jetzt bearbeiten und veröffentlichen.'
            )
            return redirect(f'/wagtail-admin/pages/{page.pk}/edit/')

        except Exception as e:
            messages.error(request, f'Fehler bei der Generierung: {e}')

    return render(request, 'blog/ai_generate.html', {
        'categories': categories,
    })

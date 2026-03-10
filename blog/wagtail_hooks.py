"""
Wagtail hooks: register AI article generator in the admin sidebar.
"""
from django.urls import path
from wagtail import hooks
from wagtail.admin.menu import MenuItem

from blog.views_admin import ai_generate_view


@hooks.register('register_admin_urls')
def register_ai_urls():
    return [
        path('ai-generate/', ai_generate_view, name='ai-generate'),
    ]


@hooks.register('register_admin_menu_item')
def register_ai_menu():
    return MenuItem(
        'AI Artikel',
        '/wagtail-admin/ai-generate/',
        icon_name='edit',
        order=900,
    )

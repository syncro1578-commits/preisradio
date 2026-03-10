from django.urls import path
from . import views

urlpatterns = [
    path('articles/', views.article_list, name='blog-article-list'),
    path('articles/<slug:slug>/', views.article_detail, name='blog-article-detail'),
    path('slugs/', views.article_slugs, name='blog-article-slugs'),
]

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ArticleEditor from '../ArticleEditor';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pw = sessionStorage.getItem('admin_pw') || '';
    fetch(`/api/admin/articles/${id}`, {
      headers: { Authorization: `Bearer ${pw}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setArticle({
          ...data,
          amazonKeywords: Array.isArray(data.amazonKeywords)
            ? data.amazonKeywords.join(', ')
            : data.amazonKeywords || '',
        });
        setLoading(false);
      })
      .catch(() => {
        router.push('/admin/blog');
      });
  }, [id, router]);

  async function handleSave(data: { title: string; slug: string; excerpt: string; content: string; category: string; image: string; amazonKeywords: string; status: 'draft' | 'published' }) {
    setSaving(true);
    const pw = sessionStorage.getItem('admin_pw') || '';

    const body = {
      ...data,
      amazonKeywords: data.amazonKeywords
        ? data.amazonKeywords.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
    };

    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pw}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Fehler beim Speichern');
      router.push('/admin/blog');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fehler beim Speichern');
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-gray-400">Laden...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Artikel bearbeiten</h1>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
          {article && <ArticleEditor initial={article as Partial<{ title: string; slug: string; excerpt: string; content: string; category: string; image: string; amazonKeywords: string; status: 'draft' | 'published' }>} onSave={handleSave} saving={saving} />}
        </div>
      </div>
    </div>
  );
}

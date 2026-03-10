'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ArticleEditor from '../ArticleEditor';

export default function NewArticlePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

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
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pw}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Fehler beim Speichern');
      }

      router.push('/cms-865x/blog');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fehler beim Speichern');
    }
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Neuer Artikel</h1>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
          <ArticleEditor onSave={handleSave} saving={saving} />
        </div>
      </div>
    </div>
  );
}

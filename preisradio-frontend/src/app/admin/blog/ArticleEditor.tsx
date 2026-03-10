'use client';

import { useState, useRef } from 'react';

interface ArticleData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  amazonKeywords: string;
  status: 'draft' | 'published';
}

const CATEGORIES = ['Kaufberatung', 'Spartipps', 'Technik', 'News'];

export default function ArticleEditor({
  initial,
  onSave,
  saving,
}: {
  initial?: Partial<ArticleData>;
  onSave: (data: ArticleData) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<ArticleData>({
    title: initial?.title || '',
    slug: initial?.slug || '',
    excerpt: initial?.excerpt || '',
    content: initial?.content || '',
    category: initial?.category || 'Kaufberatung',
    image: initial?.image || '',
    amazonKeywords: initial?.amazonKeywords || '',
    status: initial?.status || 'draft',
  });
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const fileRef = useRef<HTMLInputElement>(null);

  function update(key: keyof ArticleData, value: string) {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      // Auto-generate slug from title
      if (key === 'title' && !initial?.slug) {
        updated.slug = value
          .toLowerCase()
          .replace(/[äÄ]/g, 'ae')
          .replace(/[öÖ]/g, 'oe')
          .replace(/[üÜ]/g, 'ue')
          .replace(/ß/g, 'ss')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }
      return updated;
    });
  }

  async function uploadImage() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    const pw = sessionStorage.getItem('admin_pw') || '';
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${pw}` },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setForm((prev) => ({ ...prev, image: data.url }));
      } else {
        alert(data.error || 'Upload fehlgeschlagen');
      }
    } catch {
      alert('Upload fehlgeschlagen');
    }
    setUploading(false);
  }

  async function insertImage() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      fileRef.current?.click();
      return;
    }

    setUploading(true);
    const pw = sessionStorage.getItem('admin_pw') || '';
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${pw}` },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        const figureHtml = `\n<figure>\n  <img src="${data.url}" alt="" />\n  <figcaption></figcaption>\n</figure>\n`;
        setForm((prev) => ({ ...prev, content: prev.content + figureHtml }));
      }
    } catch {
      alert('Upload fehlgeschlagen');
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="space-y-6">
      {/* Title + Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titel</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Artikel-Titel"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => update('slug', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
            placeholder="artikel-slug"
          />
        </div>
      </div>

      {/* Category + Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategorie</label>
          <select
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => update('status', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="draft">Entwurf</option>
            <option value="published">Veröffentlicht</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amazon Keywords</label>
          <input
            type="text"
            value={form.amazonKeywords}
            onChange={(e) => update('amazonKeywords', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            placeholder="Keyword 1, Keyword 2, Keyword 3"
          />
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beschreibung (Excerpt)</label>
        <textarea
          value={form.excerpt}
          onChange={(e) => update('excerpt', e.target.value)}
          rows={2}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          placeholder="Kurzbeschreibung für die Artikelliste"
        />
      </div>

      {/* Hero Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titelbild</label>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={form.image}
            onChange={(e) => update('image', e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            placeholder="Bild-URL oder hochladen"
          />
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadImage} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {uploading ? 'Laden...' : 'Upload'}
          </button>
        </div>
        {form.image && (
          <img src={form.image} alt="Preview" className="mt-3 rounded-lg max-h-48 object-cover" />
        )}
      </div>

      {/* Content Editor */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Inhalt (HTML)</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                fileRef.current?.click();
                // Use a timeout to handle the file selection
                const handler = () => {
                  insertImage();
                  fileRef.current?.removeEventListener('change', handler);
                };
                fileRef.current?.addEventListener('change', handler);
              }}
              disabled={uploading}
              className="text-xs px-3 py-1 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              + Bild einfügen
            </button>
            <button
              type="button"
              onClick={() => setTab(tab === 'edit' ? 'preview' : 'edit')}
              className="text-xs px-3 py-1 rounded-md bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
            >
              {tab === 'edit' ? 'Vorschau' : 'Bearbeiten'}
            </button>
          </div>
        </div>

        {tab === 'edit' ? (
          <textarea
            value={form.content}
            onChange={(e) => update('content', e.target.value)}
            rows={20}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm leading-relaxed resize-y"
            placeholder="<p>Artikel-Inhalt als HTML...</p>"
          />
        ) : (
          <div
            className="prose prose-lg max-w-none p-4 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 min-h-[300px]"
            dangerouslySetInnerHTML={{ __html: form.content }}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-zinc-800">
        <a
          href="/admin/blog"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        >
          Abbrechen
        </a>
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={saving || !form.title || !form.content}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Speichern...' : 'Speichern'}
        </button>
      </div>
    </div>
  );
}

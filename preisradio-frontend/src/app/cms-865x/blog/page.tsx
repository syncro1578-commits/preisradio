'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Article {
  _id: string;
  title: string;
  slug: string;
  category: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export default function AdminBlogPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const authHeader = `Bearer ${password}`;

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/articles', {
        headers: { Authorization: authHeader },
      });
      if (!res.ok) throw new Error('Falsches Passwort');
      const data = await res.json();
      setArticles(data);
      setAuthenticated(true);
      sessionStorage.setItem('admin_pw', password);
    } catch {
      setError('Falsches Passwort');
    }
    setLoading(false);
  }

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_pw');
    if (saved) {
      setPassword(saved);
      fetch('/api/admin/articles', {
        headers: { Authorization: `Bearer ${saved}` },
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) => {
          setArticles(data);
          setAuthenticated(true);
        })
        .catch(() => sessionStorage.removeItem('admin_pw'));
    }
  }, []);

  async function deleteArticle(id: string) {
    if (!confirm('Artikel wirklich löschen?')) return;
    await fetch(`/api/admin/articles/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${password}` },
    });
    setArticles((prev) => prev.filter((a) => a._id !== id));
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <form onSubmit={login} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Blog Admin</h1>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passwort"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Laden...' : 'Anmelden'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Verwaltung</h1>
            <p className="text-sm text-gray-500 mt-1">{articles.length} Artikel</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/blog"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Blog ansehen
            </Link>
            <Link
              href="/cms-865x/blog/new"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              + Neuer Artikel
            </Link>
          </div>
        </div>

        {/* Article List */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
          {articles.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 dark:text-gray-500 mb-4">Noch keine Artikel vorhanden</p>
              <Link
                href="/cms-865x/blog/new"
                className="inline-flex px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Ersten Artikel erstellen
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Titel</th>
                  <th className="px-6 py-3">Kategorie</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Datum</th>
                  <th className="px-6 py-3 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr
                    key={article._id}
                    className="border-b border-gray-50 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/cms-865x/blog/${article._id}`}
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {article.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          article.status === 'published'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                      >
                        {article.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(article.createdAt).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/cms-865x/blog/${article._id}`}
                          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                        >
                          Bearbeiten
                        </Link>
                        <button
                          onClick={() => deleteArticle(article._id)}
                          className="text-xs text-red-500 hover:text-red-600 font-medium"
                        >
                          Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

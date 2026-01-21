'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Retailer } from '@/lib/types';
import api from '@/lib/api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function HaendlerPage() {
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ shopName: '', website: '', email: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const retailersResponse = await api.getRetailers();
      setRetailers(retailersResponse.results);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');

    try {
      const response = await fetch('/api/shop-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormStatus('success');
        setFormData({ shopName: '', website: '', email: '' });
      } else {
        setFormStatus('error');
      }
    } catch {
      setFormStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Navigation />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header with Back Button */}
        <div className="mb-8 md:mb-12">
          <Link
            href="/"
            className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Zurück zur Startseite
          </Link>

          <div className="text-center">
            <h1 className="mb-3 text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Unsere Händler-Partner
            </h1>
            <p className="mx-auto max-w-2xl text-base md:text-lg text-gray-600 dark:text-gray-400">
              Wir vergleichen Preise der führenden Online-Händler in Deutschland
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Händler werden geladen...
              </p>
            </div>
          </div>
        ) : retailers.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-12 text-center dark:bg-zinc-900">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Keine Händler gefunden
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Fügen Sie Händler zur Datenbank hinzu
            </p>
          </div>
        ) : (
          <>
            {/* Retailers Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {retailers.map((retailer) => (
                  <div
                    key={retailer.id}
                    className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all hover:scale-105 hover:shadow-2xl dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800"
                  >
                    {/* Logo/Name */}
                    <div className="mb-6">
                      <div className="relative h-32 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:from-zinc-800 dark:to-zinc-900 shadow-inner overflow-hidden">
                        {retailer.logo ? (
                          <Image
                            src={retailer.logo}
                            alt={retailer.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                            unoptimized={retailer.logo.startsWith('http')}
                          />
                        ) : (
                          <span className="flex items-center justify-center h-full text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            {retailer.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Retailer Name */}
                    <h3 className="mb-6 text-center text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                      {retailer.name}
                    </h3>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/search?retailer=${retailer.id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-100 dark:bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-200 dark:hover:bg-zinc-700"
                      >
                        Produkte
                      </Link>
                      <a
                        href={retailer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                      >
                        Website
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
            </div>

            {/* Trust Section */}
            <div className="mt-12 md:mt-16 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 md:p-12 text-center text-white shadow-2xl">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                  <svg className="h-10 w-10 md:h-12 md:w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <h2 className="mb-4 text-2xl md:text-3xl font-bold">
                Vertrauen Sie auf Qualität
              </h2>
              <p className="mx-auto max-w-2xl text-base md:text-lg opacity-95">
                Wir arbeiten nur mit vertrauenswürdigen und etablierten Händlern zusammen.
                Alle Partner werden sorgfältig ausgewählt, um Ihnen das beste
                Einkaufserlebnis zu garantieren.
              </p>
            </div>

            {/* Shop Request Form */}
            <div className="mt-12 md:mt-16 rounded-2xl bg-white dark:bg-zinc-900 p-8 md:p-12 shadow-lg border border-gray-100 dark:border-zinc-800">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Händler werden
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Möchten Sie Ihre Produkte auf Preisradio listen? Kontaktieren Sie uns!
                </p>
              </div>

              <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Shop-Name"
                    required
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <input
                    type="url"
                    placeholder="Website-URL"
                    required
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="E-Mail-Adresse"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={formStatus === 'sending'}
                  className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white transition-all hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  {formStatus === 'sending' ? 'Wird gesendet...' : 'Anfrage senden'}
                </button>

                {formStatus === 'success' && (
                  <p className="text-center text-green-600 dark:text-green-400 font-medium">
                    Vielen Dank! Wir melden uns bei Ihnen.
                  </p>
                )}
                {formStatus === 'error' && (
                  <p className="text-center text-red-600 dark:text-red-400 font-medium">
                    Fehler beim Senden. Bitte versuchen Sie es erneut.
                  </p>
                )}
              </form>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

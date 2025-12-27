'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ConsentBanner() {
  const [showConsent, setShowConsent] = useState(false);
  const [consent, setConsent] = useState<{
    analytics?: boolean;
    marketing?: boolean;
  }>({});

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà accepté/rejeté les cookies
    const savedConsent = localStorage.getItem('consent');
    if (!savedConsent) {
      setShowConsent(true);
    } else {
      setConsent(JSON.parse(savedConsent));
      updateConsentMode(JSON.parse(savedConsent));
    }
  }, []);

  const updateConsentMode = (consentData: { analytics?: boolean; marketing?: boolean }) => {
    // Google Consent Mode
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': consentData.analytics ? 'granted' : 'denied',
        'marketing_storage': consentData.marketing ? 'granted' : 'denied',
      });
    }
  };

  const handleAcceptAll = () => {
    const allConsent = { analytics: true, marketing: true };
    localStorage.setItem('consent', JSON.stringify(allConsent));
    setConsent(allConsent);
    updateConsentMode(allConsent);
    setShowConsent(false);
  };

  const handleRejectAll = () => {
    const noConsent = { analytics: false, marketing: false };
    localStorage.setItem('consent', JSON.stringify(noConsent));
    setConsent(noConsent);
    updateConsentMode(noConsent);
    setShowConsent(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('consent', JSON.stringify(consent));
    updateConsentMode(consent);
    setShowConsent(false);
  };

  const toggleAnalytics = () => {
    setConsent((prev: { analytics?: boolean; marketing?: boolean }) => ({ ...prev, analytics: !prev.analytics }));
  };

  const toggleMarketing = () => {
    setConsent((prev: { analytics?: boolean; marketing?: boolean }) => ({ ...prev, marketing: !prev.marketing }));
  };

  const [isExpanded, setIsExpanded] = useState(false);

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="rounded-xl bg-white dark:bg-zinc-900 shadow-2xl border border-gray-200 dark:border-zinc-800 animate-slideUp">
          {!isExpanded ? (
            // Minimized view
            <div className="p-4 md:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-1">
                    🍪 Wir nutzen Cookies
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    Wir verwenden Cookies, um Ihre Erfahrung zu verbessern.{' '}
                    <button
                      onClick={() => setIsExpanded(true)}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Einstellungen anpassen
                    </button>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleRejectAll}
                    className="flex-1 sm:flex-none rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-xs md:text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Ablehnen
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 sm:flex-none rounded-lg bg-blue-600 px-4 py-2 text-xs md:text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    Akzeptieren
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Expanded view
            <div className="p-5 md:p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1">
                    🍪 Datenschutz & Cookies
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Wir nutzen Cookies und andere Technologien, um Ihre Erfahrung zu verbessern.
                  </p>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="ml-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Schließen"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="space-y-3 mb-5">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                    Erforderliche Cookies
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Diese Cookies sind notwendig für die grundlegende Funktionalität unserer Website.
                  </p>
                </div>

                {/* Analytics */}
                <div className="rounded-lg bg-gray-50 dark:bg-zinc-800 p-3 border border-gray-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                      📊 Analyse & Leistung
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={consent.analytics || false}
                        onChange={toggleAnalytics}
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Helfen Sie uns, unsere Website zu verbessern, indem Sie uns erlauben, anonyme Nutzungsdaten zu erfassen.
                  </p>
                </div>

                {/* Marketing */}
                <div className="rounded-lg bg-gray-50 dark:bg-zinc-800 p-3 border border-gray-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                      📢 Marketing & Personalisierung
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={consent.marketing || false}
                        onChange={toggleMarketing}
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Mit Ihrem Einverständnis zeigen wir Ihnen relevante Werbung basierend auf Ihren Interessen.
                  </p>
                </div>
              </div>

              {/* Info Links */}
              <div className="mb-4 flex flex-wrap gap-3 text-xs">
                <Link
                  href="/datenschutz"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  Datenschutzerklärung
                </Link>
                <Link
                  href="/impressum"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  Impressum
                </Link>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={handleRejectAll}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Alles ablehnen
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="rounded-lg border border-blue-600 bg-blue-50 dark:bg-blue-950/30 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors"
                >
                  Einstellungen speichern
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  Alles akzeptieren
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

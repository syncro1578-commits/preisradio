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
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
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
    setConsent(prev => ({ ...prev, analytics: !prev.analytics }));
  };

  const toggleMarketing = () => {
    setConsent(prev => ({ ...prev, marketing: !prev.marketing }));
  };

  if (!showConsent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl animate-slideUp">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🍪 Datenschutz & Cookies
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Wir nutzen Cookies und andere Technologien, um Ihre Erfahrung zu verbessern und unsere Dienste zu optimieren.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-4 mb-6">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Erforderliche Cookies
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Diese Cookies sind notwendig für die grundlegende Funktionalität unserer Website.
              </p>
            </div>

            {/* Analytics */}
            <div className="rounded-lg bg-gray-50 dark:bg-zinc-800 p-4 border border-gray-200 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
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
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Helfen Sie uns, unsere Website zu verbessern, indem Sie uns erlauben, anonyme Nutzungsdaten zu erfassen.
              </p>
            </div>

            {/* Marketing */}
            <div className="rounded-lg bg-gray-50 dark:bg-zinc-800 p-4 border border-gray-200 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
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
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mit Ihrem Einverständnis zeigen wir Ihnen relevante Werbung basierend auf Ihren Interessen.
              </p>
            </div>
          </div>

          {/* Info Links */}
          <div className="mb-6 flex flex-wrap gap-4 text-sm">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleRejectAll}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Alles ablehnen
            </button>
            <button
              onClick={handleSavePreferences}
              className="rounded-lg border border-blue-600 bg-blue-50 dark:bg-blue-950/30 px-6 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors"
            >
              Einstellungen speichern
            </button>
            <button
              onClick={handleAcceptAll}
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Alles akzeptieren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

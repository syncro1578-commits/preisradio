'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [consent, setConsent] = useState({ analytics: true, marketing: true });

  useEffect(() => {
    const saved = localStorage.getItem('consent');
    if (!saved) {
      setVisible(true);
    } else {
      try {
        const parsed = JSON.parse(saved);
        const c = typeof parsed === 'object' ? parsed : { analytics: parsed === 'true', marketing: parsed === 'true' };
        setConsent(c);
        updateConsentMode(c);
      } catch {
        setVisible(true);
      }
    }
  }, []);

  const updateConsentMode = (c: { analytics: boolean; marketing: boolean }) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: c.analytics ? 'granted' : 'denied',
        ad_storage: c.marketing ? 'granted' : 'denied',
        ad_personalization: c.marketing ? 'granted' : 'denied',
        ad_user_data: c.marketing ? 'granted' : 'denied',
      });
    }
  };

  const accept = () => {
    localStorage.setItem('consent', JSON.stringify(consent));
    updateConsentMode(consent);
    setVisible(false);
  };

  const reject = () => {
    const denied = { analytics: false, marketing: false };
    localStorage.setItem('consent', JSON.stringify(denied));
    updateConsentMode(denied);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-700 shadow-lg">
      <div className="container mx-auto flex flex-col sm:flex-row items-center gap-3 px-4 py-3">
        <p className="flex-1 text-xs text-gray-600 dark:text-gray-400 text-center sm:text-left">
          Wir verwenden Cookies fur Analyse und personalisierte Werbung.{' '}
          <Link href="/datenschutz" className="underline hover:text-gray-900 dark:hover:text-white">
            Mehr erfahren
          </Link>
        </p>
        <div className="flex items-center gap-4 flex-shrink-0">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked disabled className="h-3.5 w-3.5 rounded accent-blue-600" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Notwendig</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer" onClick={() => setConsent(c => ({ ...c, analytics: !c.analytics }))}>
            <input type="checkbox" checked={consent.analytics} readOnly className="h-3.5 w-3.5 rounded accent-blue-600 cursor-pointer" />
            <span className="text-xs text-gray-700 dark:text-gray-300">Analyse</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer" onClick={() => setConsent(c => ({ ...c, marketing: !c.marketing }))}>
            <input type="checkbox" checked={consent.marketing} readOnly className="h-3.5 w-3.5 rounded accent-blue-600 cursor-pointer" />
            <span className="text-xs text-gray-700 dark:text-gray-300">Marketing</span>
          </label>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={reject}
            className="rounded-md border border-gray-300 dark:border-zinc-600 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Ablehnen
          </button>
          <button
            onClick={accept}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useRef } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    // Already installed or dismissed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSInstalled = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone || isIOSInstalled || localStorage.getItem('pwa-dismiss')) return;

    // Mobile only
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) return;

    const show = () => {
      setVisible(true);
      hideTimer.current = setTimeout(() => setVisible(false), 3000);
    };

    // Android
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(show, 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS (no beforeinstallprompt)
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      setTimeout(show, 3000);
    }

    window.addEventListener('appinstalled', () => setVisible(false));

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
    setVisible(false);
    localStorage.setItem('pwa-dismiss', '1');
  };

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem('pwa-dismiss', '1');
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 animate-slideUp">
      <div className="bg-gray-900 px-4 py-2.5 flex items-center justify-between gap-3">
        <p className="text-xs text-white">
          Preisradio als App installieren
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={dismiss} className="text-xs text-gray-400 hover:text-white transition-colors">
            Nein
          </button>
          <button onClick={install} className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 transition-colors">
            Installieren
          </button>
        </div>
      </div>
    </div>
  );
}

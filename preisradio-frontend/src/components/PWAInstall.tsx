'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if already installed (works for Android/Desktop)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if Android
    const isAndroid = /Android/.test(navigator.userAgent);

    // Detect if mobile device (only show install prompt on mobile)
    const mobile = iOS || isAndroid;
    setIsMobile(mobile);

    // Check if installed on iOS (navigator.standalone)
    const isIOSInstalled = iOS && (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone || isIOSInstalled) {
      setIsInstalled(true);
      return;
    }

    // Only show install prompt on mobile devices
    if (!mobile) {
      return;
    }

    // For iOS: show prompt after delay (no beforeinstallprompt event on iOS)
    if (iOS) {
      setTimeout(() => {
        const hasSeenPrompt = localStorage.getItem('pwa-install-dismissed');
        if (!hasSeenPrompt) {
          setShowInstallPrompt(true);
        }
      }, 3000);
      return;
    }

    // Listen for the beforeinstallprompt event (Android only, not desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Don't show immediately - wait a bit or show based on user engagement
      setTimeout(() => {
        const hasSeenPrompt = localStorage.getItem('pwa-install-dismissed');
        if (!hasSeenPrompt) {
          setShowInstallPrompt(true);
        }
      }, 3000); // Show after 3 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      console.log('PWA installed successfully');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
      localStorage.setItem('pwa-install-dismissed', 'true');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if installed, not mobile, or no prompt available
  if (isInstalled || !isMobile || (!showInstallPrompt && !isIOS)) {
    return null;
  }

  // iOS Install Instructions - Compact banner
  if (isIOS && showInstallPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
        <div className="bg-white dark:bg-zinc-900 px-4 py-3 shadow-lg border-t border-gray-200 dark:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-lg">📻</span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                App installieren
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <svg className="h-3.5 w-3.5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Teilen → Zum Home-Bildschirm
              </p>
            </div>

            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Schließen"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Android Install Prompt - Compact banner
  if (showInstallPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-lg">📻</span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                Preisradio als App
              </p>
              <p className="text-xs text-white/70">
                Schneller Zugriff auf Angebote
              </p>
            </div>

            <button
              onClick={handleInstallClick}
              className="flex-shrink-0 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-blue-600 hover:bg-white/90 transition-colors"
            >
              Installieren
            </button>

            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1.5 text-white/70 hover:text-white"
              aria-label="Schließen"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

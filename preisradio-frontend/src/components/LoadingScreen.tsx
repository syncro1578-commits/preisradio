'use client';

import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Fade in animation
    setTimeout(() => setShowContent(true), 100);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Smooth progression
        const remaining = 100 - prev;
        const increment = Math.max(remaining * 0.15, 2);
        return Math.min(prev + increment, 100);
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div
        className={`text-center px-6 transition-all duration-500 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Preis<span className="text-blue-500">radio</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2">Preisvergleich leicht gemacht</p>
        </div>

        {/* Progress bar */}
        <div className="w-64 mx-auto">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Loading text */}
          <div className="mt-4 text-gray-500 text-xs">
            {progress < 30 && 'Initialisierung...'}
            {progress >= 30 && progress < 60 && 'Verbindung wird hergestellt...'}
            {progress >= 60 && progress < 90 && 'Daten werden geladen...'}
            {progress >= 90 && 'Gleich bereit...'}
          </div>
        </div>
      </div>
    </div>
  );
}

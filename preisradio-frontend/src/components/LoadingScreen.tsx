'use client';

import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Accélération progressive pour une UX plus fluide
        return prev + Math.random() * 15 + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
      <div className="text-center px-6">
        {/* Barre de progression */}
        <div className="w-full max-w-md mx-auto">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-white via-blue-100 to-white rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${Math.min(progress, 100)}%`,
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)'
              }}
            />
          </div>

          {/* Texte de chargement */}
          <div className="mt-4 text-white/80 text-sm animate-pulse">
            {progress < 30 && 'Lädt...'}
            {progress >= 30 && progress < 60 && 'Verbindung zur API...'}
            {progress >= 60 && progress < 90 && 'Daten werden geladen...'}
            {progress >= 90 && 'Fast fertig...'}
          </div>
        </div>

        {/* Icône de chargement animée */}
        <div className="mt-8 flex justify-center">
          <svg
            className="animate-spin h-8 w-8 text-white/60"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

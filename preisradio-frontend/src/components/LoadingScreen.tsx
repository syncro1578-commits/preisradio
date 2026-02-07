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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      <div
        className={`text-center px-6 transition-all duration-500 ${
          showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Animated Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Pulsing background */}
            <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse"></div>

            {/* Main icon container */}
            <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-8 border-2 border-white/20">
              {/* Shopping cart icon with gradient */}
              <svg
                className="h-16 w-16 text-white animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
          Preisvergleich
        </h1>
        <p className="text-white/80 text-sm mb-8">Die besten Angebote werden geladen</p>

        {/* Progress bar */}
        <div className="w-64 mx-auto">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-white via-blue-100 to-white rounded-full transition-all duration-200 ease-out shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Loading text */}
          <div className="mt-4 text-white/70 text-xs font-medium">
            {progress < 100 ? `${Math.round(progress)}%` : 'Fertig!'}
          </div>
        </div>
      </div>
    </div>
  );
}

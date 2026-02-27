'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Slide {
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  gradient: string;
  image: string;
}

const SLIDES: Slide[] = [
  {
    title: 'Smartwatches im Vergleich',
    subtitle: 'Apple Watch, Samsung Galaxy Watch, Garmin & mehr — zum besten Preis',
    cta: 'Smartwatches entdecken',
    href: '/kategorien/smartwatches',
    gradient: 'from-blue-600 via-blue-700 to-indigo-800',
    image: '/banners/smartwatches.webp',
  },
  {
    title: 'Monitore gunstig kaufen',
    subtitle: 'Gaming, Office & 4K Monitore von Samsung, LG, Dell und mehr',
    cta: 'Monitore vergleichen',
    href: '/kategorien/monitore',
    gradient: 'from-purple-600 via-purple-700 to-fuchsia-800',
    image: '/banners/monitore.webp',
  },
  {
    title: 'Staubsauger Angebote',
    subtitle: 'Roboter, kabellose & Bodenstaubsauger — Dyson, Bosch, iRobot',
    cta: 'Staubsauger ansehen',
    href: '/kategorien/staubsauger',
    gradient: 'from-emerald-600 via-teal-700 to-cyan-800',
    image: '/banners/staubsauger.webp',
  },
];

const INTERVAL = 5000;

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-play
  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [paused, next]);

  // Touch / swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((slide, i) => (
          <Link
            key={i}
            href={slide.href}
            className={`w-full flex-none bg-gradient-to-r ${slide.gradient} relative`}
          >
            {/* Background image */}
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              sizes="(max-width: 768px) 100vw, 1280px"
              className="object-cover opacity-30 mix-blend-luminosity"
              priority={i === 0}
            />

            {/* Overlay gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

            <div className="relative flex items-center gap-4 sm:gap-8 px-5 sm:px-10 py-8 sm:py-12">
              {/* Text */}
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-xl md:text-2xl font-bold text-white leading-tight drop-shadow-md">
                  {slide.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-white/80 line-clamp-2 drop-shadow-sm">
                  {slide.subtitle}
                </p>
                <span className="mt-2 sm:mt-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-white backdrop-blur-sm">
                  {slide.cta}
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Prev / Next arrows — desktop only */}
      <button
        onClick={(e) => { e.preventDefault(); prev(); }}
        className="absolute left-2 top-1/2 -translate-y-1/2 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white/80 backdrop-blur-sm hover:bg-black/40 transition-colors"
        aria-label="Vorheriges Slide"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={(e) => { e.preventDefault(); next(); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white/80 backdrop-blur-sm hover:bg-black/40 transition-colors"
        aria-label="Nächstes Slide"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current
                ? 'w-6 bg-white'
                : 'w-1.5 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

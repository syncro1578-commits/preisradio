'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

interface Slide {
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  gradient: string;
  icon: React.ReactNode;
}

const SLIDES: Slide[] = [
  {
    title: 'Die besten Preise finden',
    subtitle: 'Vergleichen Sie Elektronik von Saturn, MediaMarkt, Otto & Kaufland',
    cta: 'Jetzt vergleichen',
    href: '/kategorien',
    gradient: 'from-blue-600 via-blue-700 to-indigo-800',
    icon: (
      <svg className="h-10 w-10 sm:h-14 sm:w-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    title: 'Top Marken im Vergleich',
    subtitle: 'Samsung, Apple, Sony, Bosch und viele mehr — immer zum besten Preis',
    cta: 'Marken entdecken',
    href: '/marken',
    gradient: 'from-purple-600 via-purple-700 to-fuchsia-800',
    icon: (
      <svg className="h-10 w-10 sm:h-14 sm:w-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 7h.01M2 2h8.5L21 12.5a2 2 0 010 2.83l-6.17 6.17a2 2 0 01-2.83 0L2 11.5V2z" />
      </svg>
    ),
  },
  {
    title: 'Täglich neue Deals',
    subtitle: 'Verpassen Sie keine Rabatte — die besten Angebote auf einen Blick',
    cta: 'Deals ansehen',
    href: '/search?sort=discount',
    gradient: 'from-emerald-600 via-teal-700 to-cyan-800',
    icon: (
      <svg className="h-10 w-10 sm:h-14 sm:w-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
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
            {/* Decorative circles */}
            <div className="absolute right-[-40px] top-[-40px] h-48 w-48 rounded-full bg-white/5" />
            <div className="absolute right-20 bottom-[-30px] h-32 w-32 rounded-full bg-white/5" />

            <div className="flex items-center gap-4 sm:gap-8 px-5 sm:px-10 py-6 sm:py-10">
              {/* Icon */}
              <div className="flex-none rounded-2xl bg-white/15 p-3 sm:p-5 text-white/90">
                {slide.icon}
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-xl md:text-2xl font-bold text-white leading-tight">
                  {slide.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-white/75 line-clamp-2">
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

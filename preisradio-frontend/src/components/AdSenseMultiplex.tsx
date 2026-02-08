'use client';

import { useEffect } from 'react';

interface AdSenseMultiplexProps {
  adSlot?: string;
  className?: string;
}

export default function AdSenseMultiplex({
  adSlot = '4012926140',
  className = '',
}: AdSenseMultiplexProps) {
  useEffect(() => {
    // Only push ads in production
    if (process.env.NODE_ENV === 'production') {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense Multiplex error:', err);
      }
    }
  }, []);

  // Don't render ads in development
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div className={`border-2 border-dashed border-green-300 bg-green-50 dark:bg-green-900/20 p-6 rounded-xl text-center my-8 ${className}`}>
        <p className="text-sm text-green-600 dark:text-green-400 font-semibold">AdSense Multiplex Ad</p>
        <p className="text-xs text-green-500 dark:text-green-500 mt-1">Slot: {adSlot}</p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-green-200 dark:bg-green-800/30 rounded h-16 flex items-center justify-center">
              <span className="text-xs text-green-600 dark:text-green-400">Ad {i}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-green-400 mt-3">Visible only in production</p>
      </div>
    );
  }

  return (
    <div className={`my-8 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-format="autorelaxed"
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
        data-ad-slot={adSlot}
      />
    </div>
  );
}

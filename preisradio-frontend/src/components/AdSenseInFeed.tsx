'use client';

import { useEffect } from 'react';

interface AdSenseInFeedProps {
  adSlot: string;
  layoutKey: string;
  className?: string;
}

export default function AdSenseInFeed({
  adSlot,
  layoutKey,
  className = '',
}: AdSenseInFeedProps) {
  useEffect(() => {
    // Only push ads in production
    if (process.env.NODE_ENV === 'production') {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense In-Feed error:', err);
      }
    }
  }, []);

  // Don't render ads in development
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div className={`border-2 border-dashed border-blue-300 bg-blue-50 p-4 rounded-xl text-center ${className}`}>
        <p className="text-sm text-blue-600 font-semibold">AdSense In-Feed Ad</p>
        <p className="text-xs text-blue-500 mt-1">Slot: {adSlot}</p>
        <p className="text-xs text-blue-400 mt-1">Visible only in production</p>
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'inline-block', width: '100%', minHeight: '250px' }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
      data-ad-slot={adSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

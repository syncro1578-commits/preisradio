'use client';

import { useEffect } from 'react';

interface AdSenseInArticleProps {
  adSlot?: string;
  className?: string;
}

export default function AdSenseInArticle({
  adSlot = '2891416164',
  className = '',
}: AdSenseInArticleProps) {
  useEffect(() => {
    // Only push ads in production
    if (process.env.NODE_ENV === 'production') {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense In-Article error:', err);
      }
    }
  }, []);

  // Don't render ads in development
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div className={`border-2 border-dashed border-purple-300 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl text-center my-6 ${className}`}>
        <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold">AdSense In-Article Ad</p>
        <p className="text-xs text-purple-500 dark:text-purple-500 mt-1">Slot: {adSlot}</p>
        <p className="text-xs text-purple-400 mt-1">Visible only in production</p>
      </div>
    );
  }

  return (
    <div className={`my-6 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
        data-ad-slot={adSlot}
      />
    </div>
  );
}

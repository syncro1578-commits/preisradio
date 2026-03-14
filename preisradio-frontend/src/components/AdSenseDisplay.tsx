'use client';

import { useEffect } from 'react';

interface AdSenseDisplayProps {
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function AdSenseDisplay({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = { display: 'block' },
  className = '',
}: AdSenseDisplayProps) {
  useEffect(() => {
    // Only push ads in production
    if (process.env.NODE_ENV === 'production') {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, []);

  // Don't render ads in development
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div className={`border-2 border-dashed border-gray-300 p-4 text-center ${className}`}>
        <p className="text-sm text-gray-500">AdSense Display Ad (Slot: {adSlot})</p>
        <p className="text-xs text-gray-400 mt-1">Visible only in production</p>
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
      data-ad-slot={adSlot}
      {...(adFormat ? { 'data-ad-format': adFormat } : {})}
      {...(!fullWidthResponsive ? {} : { 'data-full-width-responsive': 'true' })}
    />
  );
}

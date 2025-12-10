'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export default function HrefLangTags() {
  const pathname = usePathname();

  useEffect(() => {
    const currentUrl = `${baseUrl}${pathname}`;

    // Supprimer les anciens hreflang tags
    const oldHrefLangs = document.querySelectorAll('link[hreflang]');
    oldHrefLangs.forEach(link => link.remove());

    // Supprimer l'ancien canonical
    const oldCanonical = document.querySelector('link[rel="canonical"]');
    if (oldCanonical) {
      oldCanonical.remove();
    }

    // Ajouter le canonical
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = currentUrl;
    document.head.appendChild(canonical);

    // Ajouter hreflang de-DE (self-referencing)
    const hrefLangDE = document.createElement('link');
    hrefLangDE.rel = 'alternate';
    hrefLangDE.setAttribute('hreflang', 'de-DE');
    hrefLangDE.href = currentUrl;
    document.head.appendChild(hrefLangDE);

    // Ajouter hreflang x-default (reciprocal)
    const hrefLangDefault = document.createElement('link');
    hrefLangDefault.rel = 'alternate';
    hrefLangDefault.setAttribute('hreflang', 'x-default');
    hrefLangDefault.href = currentUrl;
    document.head.appendChild(hrefLangDefault);

  }, [pathname]);

  return null;
}

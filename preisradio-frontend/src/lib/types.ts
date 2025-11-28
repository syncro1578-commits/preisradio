// Types TypeScript pour l'API PrixRadio

export interface Retailer {
  id: string;
  name: string;
  slug: string;
  website: string;
  logo?: string;
}

export interface Price {
  retailer: Retailer;
  price: number;
  currency: string;
  stock_status: 'in_stock' | 'out_of_stock' | 'preorder' | 'discontinued';
  url: string;
  last_checked: string;
}

// Product interface qui correspond à la structure réelle du backend (Saturn/MediaMarkt)
export interface Product {
  id: string;
  sku?: string;
  brand?: string;
  category: string;
  currency: string;
  description?: string;
  discount?: string;
  gtin?: string;  // EAN/GTIN code
  image?: string;
  old_price?: number;
  price: number;  // Prix unique (pas un tableau)
  scraped_at?: string;
  title: string;  // Nom du produit
  url: string;  // URL vers le produit sur le site du retailer
  retailer?: string;  // Retailer source: 'saturn' ou 'mediamarkt'
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
}

export interface StatusResponse {
  status: string;
  version: string;
  api: {
    products: number;
    retailers: number;
  };
  database: {
    status: string;
    collections: string[];
  };
}

export interface Brand {
  name: string;
  slug: string;
  productsCount: number;
  retailers: string[];
  categories: string[];
  averagePrice?: number;
  minPrice?: number;
  maxPrice?: number;
}

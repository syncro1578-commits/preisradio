// Client API pour communiquer avec le backend Django

import { Product, Retailer, ApiResponse, HealthResponse, StatusResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://preisradio.de';
const API_PATH = process.env.NEXT_PUBLIC_API_BASE || '/api';

const API_URL = `${API_BASE_URL}${API_PATH}`;

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health & Status
  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health/');
  }

  async getStatus(): Promise<StatusResponse> {
    return this.request<StatusResponse>('/status/');
  }

  // Products
  async getProducts(params?: {
    search?: string;
    category?: string;
    brand?: string;
    page?: number;
    page_size?: number;
    retailer?: string;
  }): Promise<ApiResponse<Product>> {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.brand) queryParams.append('brand', params.brand);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.retailer) queryParams.append('retailer', params.retailer);

    const query = queryParams.toString();
    const endpoint = query ? `/products/?${query}` : '/products/';

    return this.request<ApiResponse<Product>>(endpoint);
  }

  // Charger les produits des deux retailers et les mélanger
  async getProductsFromBothRetailers(params?: {
    search?: string;
    category?: string;
    brand?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<Product>> {
    const pageSize = params?.page_size || 20;
    const page = params?.page || 1;

    try {
      // Charger en parallèle depuis Saturn et MediaMarkt
      const [saturnResponse, mediamarktResponse] = await Promise.all([
        this.getProducts({
          search: params?.search,
          category: params?.category,
          brand: params?.brand,
          retailer: 'saturn',
          page: page,
          page_size: pageSize,
        }),
        this.getProducts({
          search: params?.search,
          category: params?.category,
          brand: params?.brand,
          retailer: 'mediamarkt',
          page: page,
          page_size: pageSize,
        }),
      ]);

      // Mélanger les résultats de manière alternée
      const mixedResults: Product[] = [];
      const maxLength = Math.max(saturnResponse.results.length, mediamarktResponse.results.length);

      for (let i = 0; i < maxLength; i++) {
        if (i < saturnResponse.results.length) {
          mixedResults.push(saturnResponse.results[i]);
        }
        if (i < mediamarktResponse.results.length) {
          mixedResults.push(mediamarktResponse.results[i]);
        }
      }

      // Check if there are more results on the next page
      const hasNextPage = saturnResponse.next !== null || mediamarktResponse.next !== null;

      return {
        count: saturnResponse.count + mediamarktResponse.count,
        next: hasNextPage ? `?page=${page + 1}` : null,
        previous: page > 1 ? `?page=${page - 1}` : null,
        results: mixedResults,
      };
    } catch (error) {
      console.error('Error loading products from both retailers:', error);
      // Fallback : charger sans filtre retailer
      return this.getProducts({ ...params, page_size: pageSize, page });
    }
  }

  async getCategories(): Promise<{ results: string[] }> {
    return this.request<{ results: string[] }>('/products/categories/');
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}/`);
  }

  async getProductByEan(ean: string): Promise<Product> {
    return this.request<Product>(`/products/${ean}/by_ean/`);
  }

  // Chercher tous les produits avec le même GTIN (pour comparer les prix entre retailers)
  async getProductsByGtin(gtin: string): Promise<ApiResponse<Product>> {
    return this.getProducts({ search: gtin, page_size: 10 });
  }

  // Retailers
  async getRetailers(): Promise<ApiResponse<Retailer>> {
    return this.request<ApiResponse<Retailer>>('/retailers/');
  }

  async getRetailer(id: string): Promise<Retailer> {
    return this.request<Retailer>(`/retailers/${id}/`);
  }
}

export const api = new ApiClient(API_URL);
export default api;

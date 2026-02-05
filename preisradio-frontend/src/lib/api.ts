// Client API pour communiquer avec le backend Django

import { Product, Retailer, ApiResponse, HealthResponse, StatusResponse, CategoriesResponse } from './types';

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

  // Charger les produits (le backend gère le mélange des retailers)
  async getProductsFromBothRetailers(params?: {
    search?: string;
    category?: string;
    brand?: string;
    retailer?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<Product>> {
    // Le backend gère maintenant le mélange des retailers et le cache
    // Un seul appel API au lieu de 4
    return this.getProducts({
      search: params?.search,
      category: params?.category,
      brand: params?.brand,
      retailer: params?.retailer, // Si undefined, le backend charge tous les retailers
      page: params?.page || 1,
      page_size: params?.page_size || 20,
    });
  }

  async getCategories(params?: {
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<CategoriesResponse> {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

    const query = queryParams.toString();
    const endpoint = query ? `/products/categories/?${query}` : '/products/categories/';

    return this.request<CategoriesResponse>(endpoint);
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}/`);
  }

  async getSimilarProducts(productId: string): Promise<ApiResponse<Product>> {
    // First get the product to know its category
    const product = await this.getProduct(productId);

    // Then get products from the same category, excluding the current product
    const response = await this.getProductsFromBothRetailers({
      category: product.category,
      page_size: 12,
    });

    // Filter out the current product
    const filteredResults = response.results.filter(p => p.id !== productId);

    return {
      ...response,
      results: filteredResults.slice(0, 3), // Return only 3 similar products
    };
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

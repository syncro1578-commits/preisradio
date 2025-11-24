import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Product API calls
export const productsApi = {
  getAll: (params?: Record<string, any>) =>
    apiClient.get('/products/', { params }),

  getById: (id: number) =>
    apiClient.get(`/products/${id}/`),

  getByEan: (ean: string) =>
    apiClient.get(`/products/${ean}/by_ean/`),

  search: (query: string) =>
    apiClient.get('/products/', { params: { search: query } }),

  getByCategory: (category: string) =>
    apiClient.get('/products/', { params: { category } }),
}

// Retailer API calls
export const retailersApi = {
  getAll: (params?: Record<string, any>) =>
    apiClient.get('/retailers/', { params }),

  getById: (id: number) =>
    apiClient.get(`/retailers/${id}/`),
}

// Price API calls
export const pricesApi = {
  getAll: (params?: Record<string, any>) =>
    apiClient.get('/prices/', { params }),

  getByProduct: (productId: number) =>
    apiClient.get('/prices/', { params: { product: productId } }),

  getByRetailer: (retailerId: number) =>
    apiClient.get('/prices/', { params: { retailer: retailerId } }),
}

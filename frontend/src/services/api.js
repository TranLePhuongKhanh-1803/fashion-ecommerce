/**
 * API Service - Axios Configuration
 */
import axios from 'axios';

const API_BASE_URL = 'https://pkfashion.site.je/backend/public/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For session cookies
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Attach JWT token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      return Promise.reject(error.response.data || { message: 'Server error occurred' });
    } else if (error.request) {
      // Request was made but no response received
      // This usually means backend server is not running
      return Promise.reject({
        message: 'Không thể kết nối đến server. Vui lòng kiểm tra xem backend server đã được khởi động chưa (php -S localhost:8000)',
        originalError: error.message
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'Network error',
        originalError: error
      });
    }
  }
);

// Product APIs
export const productAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getFeatured: (limit = 8) => api.get('/products/featured', { params: { limit } }),
  getByCategory: (category) => api.get(`/products/category/${category}`),
};

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// User Profile APIs
export const userAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
};

// Cart APIs
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (data) => api.post('/cart', data),
  updateItem: (id, data) => api.put(`/cart/${id}`, data),
  removeItem: (productId, variantId = null) => {
    let url = `/cart/${productId}`;
    if (variantId) url += `?variant_id=${variantId}`;
    return api.delete(url);
  },
  clearCart: () => api.delete('/cart'),
};

// Coupon APIs
export const couponAPI = {
  getAll: () => api.get('/admin/coupons'),
  getById: (id) => api.get(`/admin/coupons/${id}`),
  create: (data) => api.post('/admin/coupons', data),
  update: (id, data) => api.put(`/admin/coupons/${id}`, data),
  delete: (id) => api.delete(`/admin/coupons/${id}`),
  applyCoupon: (code, cartTotal) => api.post('/coupons/apply', { code, cartTotal }),
};

// Order APIs
export const orderAPI = {
  getOrders: () => api.get('/user/orders'),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
};

// Inventory APIs
export const inventoryAPI = {
  getInventory: (params) => api.get('/admin/inventory', { params }),
  importStock: (data) => api.post('/admin/inventory/import', data),
  getLogs: (params) => api.get('/admin/inventory/logs', { params }),
};

// Review APIs
export const reviewAPI = {
  getByProduct: (productId) => api.get(`/products/${productId}/reviews`),
  create: (productId, data) => api.post(`/products/${productId}/reviews`, data),
  update: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

// Wishlist APIs
export const wishlistAPI = {
  getAll: () => api.get('/wishlist'),
  getIds: () => api.get('/wishlist/ids'),
  add: (productId) => api.post('/wishlist', { product_id: productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};

// Address APIs
export const addressAPI = {
  getAll: () => api.get('/addresses'),
  getById: (id) => api.get(`/addresses/${id}`),
  create: (data) => api.post('/addresses', data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  delete: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.put(`/addresses/${id}/default`),
};

export default api;

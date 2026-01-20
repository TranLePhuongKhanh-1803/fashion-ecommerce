/**
 * API Service - Axios Configuration
 */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

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

// Cart APIs
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (data) => api.post('/cart', data),
  updateItem: (id, data) => api.put(`/cart/${id}`, data),
  removeItem: (productId) => api.delete(`/cart/${productId}`),
  clearCart: () => api.delete('/cart'),
};

export default api;

import {
  User,
  Category,
  Product,
  Order,
  AdminStats,
  ProductFilterParams,
  PaginatedProducts,
  PaymentConfig,
  RazorpayOrderResult
} from '../types';
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '../data/fallbackData';

const DEFAULT_RENDER_BACKEND = 'https://auramart-ecommerce.onrender.com';

const getApiBase = (): string => {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('auramart_api_url');
    if (customUrl) return `${customUrl.replace(/\/$/, '')}/api`;
  }
  if ((import.meta as any).env?.VITE_API_URL) {
    return `${(import.meta as any).env.VITE_API_URL.replace(/\/$/, '')}/api`;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8000/api';
  }
  return `${DEFAULT_RENDER_BACKEND}/api`;
};

const API_BASE = getApiBase();

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    try {
      const errData = await response.json();
      if (errData && errData.detail) {
        errorMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ access_token: string; token_type: string; user: User }> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(name: string, email: string, password: string, role?: string): Promise<{ access_token: string; token_type: string; user: User }> {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  },

  async getMe(): Promise<User> {
    return request('/auth/me');
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      return await request('/categories');
    } catch (err) {
      console.warn('Backend unavailable, using fallback categories:', err);
      return FALLBACK_CATEGORIES;
    }
  },

  // Products
  async getProducts(params: ProductFilterParams = {}): Promise<PaginatedProducts> {
    try {
      const query = new URLSearchParams();
      if (params.category_slug) query.set('category_slug', params.category_slug);
      if (params.search) query.set('search', params.search);
      if (params.min_price !== undefined) query.set('min_price', params.min_price.toString());
      if (params.max_price !== undefined) query.set('max_price', params.max_price.toString());
      if (params.sort_by) query.set('sort_by', params.sort_by);
      if (params.featured_only) query.set('featured_only', 'true');
      if (params.in_stock_only) query.set('in_stock_only', 'true');
      if (params.page) query.set('page', params.page.toString());
      if (params.limit) query.set('limit', params.limit.toString());

      const qs = query.toString();
      return await request(`/products${qs ? `?${qs}` : ''}`);
    } catch (err) {
      console.warn('Backend unavailable, serving filtered fallback products:', err);
      let list = [...FALLBACK_PRODUCTS];
      if (params.category_slug) {
        list = list.filter(p => p.category?.slug === params.category_slug);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
      }
      if (params.min_price !== undefined) {
        list = list.filter(p => p.price >= params.min_price!);
      }
      if (params.max_price !== undefined) {
        list = list.filter(p => p.price <= params.max_price!);
      }
      if (params.featured_only) {
        list = list.filter(p => p.is_featured);
      }
      if (params.in_stock_only) {
        list = list.filter(p => p.stock > 0);
      }
      if (params.sort_by === 'price_asc') {
        list.sort((a, b) => a.price - b.price);
      } else if (params.sort_by === 'price_desc') {
        list.sort((a, b) => b.price - a.price);
      } else if (params.sort_by === 'rating') {
        list.sort((a, b) => b.rating - a.rating);
      }
      const page = params.page || 1;
      const limit = params.limit || 40;
      const start = (page - 1) * limit;
      const paginated = list.slice(start, start + limit);
      return {
        products: paginated,
        total: list.length,
        page,
        limit,
        total_pages: Math.max(1, Math.ceil(list.length / limit))
      };
    }
  },

  async getProduct(idOrSlug: string | number): Promise<Product> {
    try {
      return await request(`/products/${idOrSlug}`);
    } catch {
      const match = FALLBACK_PRODUCTS.find(p => p.id === Number(idOrSlug) || p.slug === idOrSlug);
      if (match) return match;
      throw new Error('Product not found');
    }
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  async updateProduct(id: number, productData: Partial<Product>): Promise<Product> {
    return request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  async updateStock(id: number, stock: number): Promise<Product> {
    return request(`/products/${id}/stock?stock=${stock}`, {
      method: 'PATCH',
    });
  },

  async deleteProduct(id: number): Promise<void> {
    return request(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Orders
  async createOrder(orderData: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    city: string;
    postal_code: string;
    payment_method: string;
    items: { product_id: number; quantity: number }[];
    notes?: string;
  }): Promise<Order> {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async getMyOrders(): Promise<Order[]> {
    return request('/orders/my-orders');
  },

  async getAllOrders(statusFilter?: string, search?: string): Promise<Order[]> {
    const query = new URLSearchParams();
    if (statusFilter && statusFilter !== 'all') query.set('status_filter', statusFilter);
    if (search) query.set('search', search);
    const qs = query.toString();
    return request(`/orders${qs ? `?${qs}` : ''}`);
  },

  async getOrder(idOrNumber: string | number): Promise<Order> {
    return request(`/orders/${idOrNumber}`);
  },

  async updateOrderStatus(id: number, status: string, payment_status?: string): Promise<Order> {
    return request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, payment_status }),
    });
  },

  // Payments & Checkout Integration
  async getPaymentConfig(): Promise<PaymentConfig> {
    try {
      return await request('/payments/config');
    } catch {
      return {
        razorpay_key_id: 'rzp_live_U1EINZEYZdW4j8',
        upi_id: '8639866865@ybl',
        merchant_name: 'AuraMart Modern Commerce'
      };
    }
  },

  async createRazorpayOrder(payload: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    city: string;
    postal_code: string;
    items: { product_id: number; quantity: number }[];
    notes?: string;
  }): Promise<RazorpayOrderResult> {
    return request('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async verifyRazorpayPayment(payload: {
    order_id: number;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<Order> {
    return request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async createDirectUPIOrder(payload: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    city: string;
    postal_code: string;
    items: { product_id: number; quantity: number }[];
    notes?: string;
  }): Promise<Order> {
    return request('/payments/create-direct-upi-order', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async submitDirectUPI(payload: {
    order_id: number;
    upi_reference: string;
  }): Promise<Order> {
    return request('/payments/submit-direct-upi', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async createCODOrder(payload: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    city: string;
    postal_code: string;
    items: { product_id: number; quantity: number }[];
    notes?: string;
  }): Promise<Order> {
    return request('/orders/create-cod', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getAdminPayments(): Promise<Order[]> {
    return request('/payments/admin/payments');
  },

  async verifyUPIPayment(orderId: number): Promise<Order> {
    return request(`/payments/admin/payments/${orderId}/verify-upi`, {
      method: 'PATCH',
    });
  },

  async confirmCODCash(orderId: number): Promise<Order> {
    return request(`/payments/admin/payments/${orderId}/confirm-cod`, {
      method: 'PATCH',
    });
  },

  async refundPayment(orderId: number, amount?: number, reason?: string): Promise<Order> {
    return request(`/payments/admin/payments/${orderId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  },

  // Cancel / Fail Payment (restores inventory on backend)
  async cancelPayment(payload: { order_id: number; reason?: string; status?: string }): Promise<Order> {
    return request('/payments/cancel', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Admin Analytics
  async getAdminStats(): Promise<AdminStats> {
    return request('/analytics/dashboard');
  },
};

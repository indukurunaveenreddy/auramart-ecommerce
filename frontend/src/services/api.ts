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

const API_BASE = (import.meta as any).env?.VITE_API_URL 
  ? `${(import.meta as any).env.VITE_API_URL}/api`
  : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:8000/api'
      : '/api');

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
    return request('/categories');
  },

  // Products
  async getProducts(params: ProductFilterParams = {}): Promise<PaginatedProducts> {
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
    return request(`/products${qs ? `?${qs}` : ''}`);
  },

  async getProduct(idOrSlug: string | number): Promise<Product> {
    return request(`/products/${idOrSlug}`);
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
    return request('/payments/config');
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

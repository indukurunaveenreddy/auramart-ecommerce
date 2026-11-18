export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number;
  cost_price?: number;
  stock: number;
  sku: string;
  category_id?: number;
  category?: Category;
  image_url: string;
  is_featured: boolean;
  is_active: boolean;
  rating: number;
  reviews_count: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product_id?: number;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  postal_code: string;
  subtotal: number;
  shipping_fee: number;
  tax_amount: number;
  total_amount: number;
  discount_amount?: number;
  status: 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | string;
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | string;
  payment_method: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  upi_reference?: string;
  transaction_time?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface PaymentConfig {
  razorpay_key_id: string;
  upi_id: string;
  merchant_name: string;
}

export interface RazorpayOrderResult {
  order_id: number;
  order_number: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subtotal: number;
  shipping_fee: number;
  tax_amount: number;
  total_amount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SalesByDay {
  date: string;
  sales: number;
  orders_count: number;
}

export interface CategorySales {
  category: string;
  total_sales: number;
  items_sold: number;
}

export interface AdminStats {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  low_stock_count: number;
  total_customers: number;
  recent_sales: SalesByDay[];
  category_distribution: CategorySales[];
  popular_products: Product[];
  recent_orders: Order[];
}

export interface ProductFilterParams {
  category_slug?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
  featured_only?: boolean;
  in_stock_only?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

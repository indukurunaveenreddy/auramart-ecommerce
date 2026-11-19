from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

# User Schemas
class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "customer"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    slug: str
    description: str
    price: float = Field(..., gt=0)
    compare_at_price: Optional[float] = None
    cost_price: Optional[float] = 0.0
    stock: int = Field(..., ge=0)
    sku: str
    category_id: Optional[int] = None
    image_url: str
    is_featured: Optional[bool] = False
    is_active: Optional[bool] = True
    rating: Optional[float] = 4.5
    reviews_count: Optional[int] = 0
    asin: Optional[str] = None
    is_amazon_product: Optional[bool] = False
    amazon_affiliate_url: Optional[str] = None
    brand: Optional[str] = None
    features: Optional[str] = None
    last_synced_at: Optional[datetime] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    compare_at_price: Optional[float] = None
    cost_price: Optional[float] = None
    stock: Optional[int] = None
    sku: Optional[str] = None
    category_id: Optional[int] = None
    image_url: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    asin: Optional[str] = None
    is_amazon_product: Optional[bool] = None
    amazon_affiliate_url: Optional[str] = None
    brand: Optional[str] = None
    features: Optional[str] = None

class ProductResponse(ProductBase):
    id: int
    category: Optional[CategoryResponse] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Order Item Schemas
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderItemResponse(BaseModel):
    id: int
    product_id: Optional[int]
    product_name: str
    product_image: Optional[str]
    quantity: int
    unit_price: float
    total_price: float

    class Config:
        from_attributes = True

# Order Schemas
class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str
    city: str
    postal_code: str
    payment_method: str = "Credit Card"
    items: List[OrderItemCreate]
    notes: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: Optional[int] = None
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str
    city: str
    postal_code: str
    subtotal: float
    shipping_fee: float
    tax_amount: float
    total_amount: float
    discount_amount: Optional[float] = 0.0
    status: str
    payment_status: str
    payment_method: str
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    upi_reference: Optional[str] = None
    transaction_time: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

# Payment Schemas
class PaymentConfigResponse(BaseModel):
    razorpay_key_id: str
    upi_id: str
    merchant_name: str

class RazorpayOrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str
    city: str
    postal_code: str
    items: List[OrderItemCreate]
    notes: Optional[str] = None

class RazorpayOrderResponse(BaseModel):
    order_id: int
    order_number: str
    razorpay_order_id: str
    amount: int  # in paise
    currency: str = "INR"
    key_id: str
    customer_name: str
    customer_email: str
    customer_phone: str
    subtotal: float
    shipping_fee: float
    tax_amount: float
    total_amount: float

class RazorpayPaymentVerify(BaseModel):
    order_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class DirectUPIOrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str
    city: str
    postal_code: str
    items: List[OrderItemCreate]
    notes: Optional[str] = None

class DirectUPISubmit(BaseModel):
    order_id: int
    upi_reference: str

class CODOrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str
    city: str
    postal_code: str
    items: List[OrderItemCreate]
    notes: Optional[str] = None

class RefundRequest(BaseModel):
    amount: Optional[float] = None
    reason: Optional[str] = "Customer requested refund"

class PaymentFailureReport(BaseModel):
    order_id: int
    reason: Optional[str] = "Payment cancelled or failed"
    status: Optional[str] = "CANCELLED"


# Analytics Schemas for Admin Dashboard
class SalesByDay(BaseModel):
    date: str
    sales: float
    orders_count: int

class CategorySales(BaseModel):
    category: str
    total_sales: float
    items_sold: int

class AdminStatsResponse(BaseModel):
    total_revenue: float
    total_orders: int
    total_products: int
    low_stock_count: int
    total_customers: int
    recent_sales: List[SalesByDay]
    category_distribution: List[CategorySales]
    popular_products: List[ProductResponse]
    recent_orders: List[OrderResponse]

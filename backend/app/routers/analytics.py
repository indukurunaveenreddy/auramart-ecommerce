from datetime import datetime, timedelta
from typing import List, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Order, OrderItem, Product, Category, User
from app.schemas import AdminStatsResponse, SalesByDay, CategorySales, ProductResponse, OrderResponse
from app.auth import get_current_admin

router = APIRouter(prefix="/api/analytics", tags=["Admin Analytics"])

@router.get("/dashboard", response_model=AdminStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    # Total revenue from paid orders (or completed/delivered/processing)
    revenue_query = db.query(func.sum(Order.total_amount)).filter(
        Order.status != "cancelled",
        Order.payment_status == "paid"
    ).scalar()
    total_revenue = round(float(revenue_query or 0.0), 2)

    # Total orders
    total_orders = db.query(Order).count()

    # Total products & low stock items
    total_products = db.query(Product).count()
    low_stock_count = db.query(Product).filter(Product.stock <= 5, Product.is_active == True).count()

    # Total registered customers
    total_customers = db.query(User).filter(User.role == "customer").count()

    # Sales by day for the last 7 days
    today = datetime.utcnow().date()
    sales_by_day_dict: Dict[str, Dict[str, float]] = {}
    for i in range(6, -1, -1):
        day_date = today - timedelta(days=i)
        day_str = day_date.strftime("%b %d")
        sales_by_day_dict[day_str] = {"sales": 0.0, "orders_count": 0}

    # Fetch orders in last 7 days
    start_date = datetime.combine(today - timedelta(days=7), datetime.min.time())
    recent_orders_list = db.query(Order).filter(
        Order.created_at >= start_date,
        Order.status != "cancelled"
    ).all()

    for o in recent_orders_list:
        day_str = o.created_at.strftime("%b %d")
        if day_str in sales_by_day_dict:
            sales_by_day_dict[day_str]["sales"] += round(o.total_amount, 2)
            sales_by_day_dict[day_str]["orders_count"] += 1

    sales_by_day = [
        SalesByDay(
            date=day_key,
            sales=round(data["sales"], 2),
            orders_count=data["orders_count"]
        )
        for day_key, data in sales_by_day_dict.items()
    ]

    # Category distribution
    categories = db.query(Category).all()
    category_distribution = []
    for cat in categories:
        items_sold_count = 0
        cat_sales = 0.0
        for p in cat.products:
            for oi in p.order_items:
                if oi.order and oi.order.status != "cancelled":
                    items_sold_count += oi.quantity
                    cat_sales += oi.total_price

        category_distribution.append(
            CategorySales(
                category=cat.name,
                total_sales=round(cat_sales, 2),
                items_sold=items_sold_count
            )
        )

    # Popular products
    popular_products_query = db.query(
        Product,
        func.coalesce(func.sum(OrderItem.quantity), 0).label("total_sold")
    ).outerjoin(OrderItem, Product.id == OrderItem.product_id)\
     .group_by(Product.id)\
     .order_by(func.coalesce(func.sum(OrderItem.quantity), 0).desc())\
     .limit(5).all()

    popular_products = [prod for prod, _ in popular_products_query]

    # Recent 5 orders
    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(5).all()

    return AdminStatsResponse(
        total_revenue=total_revenue,
        total_orders=total_orders,
        total_products=total_products,
        low_stock_count=low_stock_count,
        total_customers=total_customers,
        recent_sales=sales_by_day,
        category_distribution=category_distribution,
        popular_products=popular_products,
        recent_orders=recent_orders
    )

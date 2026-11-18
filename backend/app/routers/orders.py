import random
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Order, OrderItem, Product, User
from app.schemas import OrderCreate, OrderResponse, OrderStatusUpdate, CODOrderCreate
from app.auth import get_current_user, get_optional_current_user, get_current_admin

router = APIRouter(prefix="/api/orders", tags=["Orders"])

def generate_order_number() -> str:
    timestamp = datetime.utcnow().strftime("%Y%m%d")
    rand_suffix = f"{random.randint(1000, 9999)}"
    return f"ORD-{timestamp}-{rand_suffix}"

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    if not order_in.items:
        raise HTTPException(status_code=400, detail="An order must contain at least one item")

    subtotal = 0.0
    order_items_to_create = []

    # Validate stock and calculate subtotal
    for item in order_in.items:
        prod = db.query(Product).filter(Product.id == item.product_id).first()
        if not prod or not prod.is_active:
            raise HTTPException(status_code=400, detail=f"Product with ID {item.product_id} is unavailable")
        
        if prod.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient inventory for '{prod.name}'. Only {prod.stock} units remaining."
            )
        
        # Deduct stock
        prod.stock -= item.quantity
        line_total = round(prod.price * item.quantity, 2)
        subtotal += line_total

        order_items_to_create.append(
            OrderItem(
                product_id=prod.id,
                product_name=prod.name,
                product_image=prod.image_url,
                quantity=item.quantity,
                unit_price=prod.price,
                total_price=line_total
            )
        )

    shipping_fee = 0.0 if subtotal >= 999.0 else 99.0
    tax_amount = round(subtotal * 0.18, 2)  # 18% GST (standard Indian e-commerce)
    total_amount = round(subtotal + shipping_fee + tax_amount, 2)

    order = Order(
        order_number=generate_order_number(),
        user_id=current_user.id if current_user else None,
        customer_name=order_in.customer_name,
        customer_email=order_in.customer_email.lower(),
        customer_phone=order_in.customer_phone,
        shipping_address=order_in.shipping_address,
        city=order_in.city,
        postal_code=order_in.postal_code,
        subtotal=round(subtotal, 2),
        shipping_fee=shipping_fee,
        tax_amount=tax_amount,
        total_amount=total_amount,
        status="processing",
        payment_status="pending" if "Cash on Delivery" in order_in.payment_method else "paid",
        payment_method=order_in.payment_method,
        notes=order_in.notes
    )

    db.add(order)
    db.flush()  # assign order.id

    for oi in order_items_to_create:
        oi.order_id = order.id
        db.add(oi)

    db.commit()
    db.refresh(order)
    return order

@router.post("/create-cod", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_cod_order(
    order_in: CODOrderCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    4. CASH ON DELIVERY
    - Create customer order.
    - Generate unique AuraMart order ID.
    - Save payment method as Cash on Delivery.
    - Set payment status to PENDING.
    - Set order status to CONFIRMED.
    """
    if not order_in.items:
        raise HTTPException(status_code=400, detail="An order must contain at least one item")

    subtotal = 0.0
    order_items_to_create = []

    for item in order_in.items:
        prod = db.query(Product).filter(Product.id == item.product_id).first()
        if not prod or not prod.is_active:
            raise HTTPException(status_code=400, detail=f"Product with ID {item.product_id} is unavailable")
        
        if prod.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient inventory for '{prod.name}'. Only {prod.stock} units remaining."
            )
        
        prod.stock -= item.quantity
        line_total = round(prod.price * item.quantity, 2)
        subtotal += line_total

        order_items_to_create.append(
            OrderItem(
                product_id=prod.id,
                product_name=prod.name,
                product_image=prod.image_url,
                quantity=item.quantity,
                unit_price=prod.price,
                total_price=line_total
            )
        )

    shipping_fee = 0.0 if subtotal >= 999.0 else 49.0
    tax_amount = round(subtotal * 0.18, 2)
    total_amount = round(subtotal + shipping_fee + tax_amount, 2)

    order = Order(
        order_number=generate_order_number(),
        user_id=current_user.id if current_user else None,
        customer_name=order_in.customer_name,
        customer_email=order_in.customer_email.lower(),
        customer_phone=order_in.customer_phone,
        shipping_address=order_in.shipping_address,
        city=order_in.city,
        postal_code=order_in.postal_code,
        subtotal=round(subtotal, 2),
        shipping_fee=shipping_fee,
        tax_amount=tax_amount,
        total_amount=total_amount,
        status="CONFIRMED",
        payment_status="PENDING",
        payment_method="Cash on Delivery",
        notes=order_in.notes
    )

    db.add(order)
    db.flush()

    for oi in order_items_to_create:
        oi.order_id = order.id
        db.add(oi)

    db.commit()
    db.refresh(order)
    return order

@router.get("/my-orders", response_model=List[OrderResponse])
def get_user_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return orders

@router.get("", response_model=List[OrderResponse])
def get_all_orders(
    status_filter: Optional[str] = None,
    payment_status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    query = db.query(Order)
    if status_filter:
        query = query.filter(Order.status == status_filter)
    if payment_status:
        query = query.filter(Order.payment_status == payment_status)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (Order.order_number.ilike(search_fmt)) |
            (Order.customer_name.ilike(search_fmt)) |
            (Order.customer_email.ilike(search_fmt))
        )
    return query.order_by(Order.created_at.desc()).all()

@router.get("/{id_or_number}", response_model=OrderResponse)
def get_order_by_identifier(
    id_or_number: str,
    db: Session = Depends(get_db)
):
    if id_or_number.isdigit():
        order = db.query(Order).filter(Order.id == int(id_or_number)).first()
    else:
        order = db.query(Order).filter(Order.order_number == id_or_number).first()
        
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if status_update.status:
        # If order was cancelled and previous status was not cancelled, optionally restore stock
        if status_update.status == "cancelled" and order.status != "cancelled":
            for item in order.items:
                if item.product_id:
                    prod = db.query(Product).filter(Product.id == item.product_id).first()
                    if prod:
                        prod.stock += item.quantity
        order.status = status_update.status

    if status_update.payment_status:
        order.payment_status = status_update.payment_status

    order.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(order)
    return order

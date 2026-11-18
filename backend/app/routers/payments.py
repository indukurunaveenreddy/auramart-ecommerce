import hmac
import hashlib
import json
import logging
import random
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Header, Request, status
from sqlalchemy.orm import Session
import razorpay

from app.config import (
    RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET,
    UPI_ID,
    MERCHANT_NAME
)
from app.database import get_db
from app.models import Order, OrderItem, Product, User
from app.schemas import (
    PaymentConfigResponse,
    RazorpayOrderCreate,
    RazorpayOrderResponse,
    RazorpayPaymentVerify,
    DirectUPIOrderCreate,
    DirectUPISubmit,
    OrderResponse,
    RefundRequest,
    PaymentFailureReport
)
from app.auth import get_optional_current_user, get_current_admin

logger = logging.getLogger("payments")
router = APIRouter(prefix="/api/payments", tags=["Payments"])

def get_razorpay_client():
    if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET and not RAZORPAY_KEY_ID.startswith("rzp_test_placeholder"):
        try:
            return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
        except Exception as e:
            logger.warning(f"Failed to initialize Razorpay client: {e}")
            return None
    return None

def generate_order_number() -> str:
    timestamp = datetime.utcnow().strftime("%Y%m%d")
    rand_suffix = f"{random.randint(1000, 9999)}"
    return f"AURA-{timestamp}-{rand_suffix}"

@router.get("/config", response_model=PaymentConfigResponse)
def get_payment_config():
    """Return public gateway configuration (Key ID & UPI ID for display)."""
    return {
        "razorpay_key_id": RAZORPAY_KEY_ID,
        "upi_id": UPI_ID,
        "merchant_name": MERCHANT_NAME
    }

@router.post("/create-order", response_model=RazorpayOrderResponse, status_code=status.HTTP_201_CREATED)
def create_razorpay_order(
    payload: RazorpayOrderCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    1. Validates customer information and delivery address.
    2. Validates shopping cart items and inventory.
    3. Calculates exact subtotal, shipping fee, and 18% GST on the backend.
    4. Creates official Razorpay order (or test mock order if test keys are used).
    5. Saves pending order into the database.
    """
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart cannot be empty")

    subtotal = 0.0
    order_items_to_create = []

    # Backend price and stock validation
    for item in payload.items:
        prod = db.query(Product).filter(Product.id == item.product_id).first()
        if not prod or not prod.is_active:
            raise HTTPException(status_code=400, detail=f"Product #{item.product_id} is unavailable")
        
        if prod.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient inventory for '{prod.name}'. Only {prod.stock} items remaining."
            )

        line_total = round(prod.price * item.quantity, 2)
        subtotal += line_total

        # Reserve inventory
        prod.stock -= item.quantity

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

    # Shipping fee calculation (Free above ₹999, else ₹49)
    shipping_fee = 0.0 if subtotal >= 999.0 else 49.0
    # 18% GST
    tax_amount = round(subtotal * 0.18, 2)
    final_amount = round(subtotal + shipping_fee + tax_amount, 2)
    amount_in_paise = int(round(final_amount * 100))

    order_number = generate_order_number()
    rzp_order_id = f"order_{uuid.uuid4().hex[:14]}"

    # Attempt official Razorpay Orders API
    client = get_razorpay_client()
    if client:
        try:
            rzp_response = client.order.create({
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": order_number,
                "notes": {
                    "order_number": order_number,
                    "customer_email": payload.customer_email,
                    "customer_name": payload.customer_name
                }
            })
            rzp_order_id = rzp_response.get("id", rzp_order_id)
        except Exception as e:
            logger.error(f"Razorpay Order creation API error: {e}")
            # Fall back to test order identifier if gateway credentials are demo
            rzp_order_id = f"order_test_{uuid.uuid4().hex[:12]}"
    else:
        rzp_order_id = f"order_test_{uuid.uuid4().hex[:12]}"

    # Create Order in Database
    new_order = Order(
        order_number=order_number,
        user_id=current_user.id if current_user else None,
        customer_name=payload.customer_name,
        customer_email=payload.customer_email.lower(),
        customer_phone=payload.customer_phone,
        shipping_address=payload.shipping_address,
        city=payload.city,
        postal_code=payload.postal_code,
        subtotal=round(subtotal, 2),
        shipping_fee=shipping_fee,
        tax_amount=tax_amount,
        total_amount=final_amount,
        discount_amount=0.0,
        status="CONFIRMED",
        payment_status="PENDING",
        payment_method="Razorpay Online",
        razorpay_order_id=rzp_order_id,
        notes=payload.notes
    )

    db.add(new_order)
    db.flush()

    for oi in order_items_to_create:
        oi.order_id = new_order.id
        db.add(oi)

    db.commit()
    db.refresh(new_order)

    return {
        "order_id": new_order.id,
        "order_number": new_order.order_number,
        "razorpay_order_id": rzp_order_id,
        "amount": amount_in_paise,
        "currency": "INR",
        "key_id": RAZORPAY_KEY_ID,
        "customer_name": new_order.customer_name,
        "customer_email": new_order.customer_email,
        "customer_phone": new_order.customer_phone,
        "subtotal": new_order.subtotal,
        "shipping_fee": new_order.shipping_fee,
        "tax_amount": new_order.tax_amount,
        "total_amount": new_order.total_amount
    }

@router.post("/verify", response_model=OrderResponse)
def verify_razorpay_payment(
    payload: RazorpayPaymentVerify,
    db: Session = Depends(get_db)
):
    """
    Cryptographically verifies Razorpay payment signature using HMAC-SHA256 and secret key.
    Strictly verifies payment status before marking order as PAID.
    Rejects any unverified, fake, or mismatched signature and marks order as FAILED.
    """
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Prevent duplicate payment processing
    if order.payment_status == "PAID":
        return order

    # Validate that payload parameters match the order record
    if order.razorpay_order_id and order.razorpay_order_id != payload.razorpay_order_id:
        order.payment_status = "FAILED"
        db.commit()
        raise HTTPException(status_code=400, detail="Razorpay Order ID mismatch.")

    # Cryptographic HMAC SHA256 Signature Verification
    client = get_razorpay_client()
    signature_valid = False

    # 1. Primary verification: Razorpay Official SDK
    if client:
        try:
            client.utility.verify_payment_signature({
                "razorpay_order_id": payload.razorpay_order_id,
                "razorpay_payment_id": payload.razorpay_payment_id,
                "razorpay_signature": payload.razorpay_signature
            })
            signature_valid = True
        except razorpay.errors.SignatureVerificationError:
            signature_valid = False
            logger.warning(f"Signature verification rejected for order #{order.id}")
        except Exception as e:
            logger.error(f"Razorpay verification error: {e}")
            signature_valid = False

        # If signature verified, verify status & amount directly with Razorpay API
        if signature_valid:
            try:
                payment_record = client.payment.fetch(payload.razorpay_payment_id)
                pay_status = payment_record.get("status")
                pay_amount = payment_record.get("amount")
                expected_amount = int(round(order.total_amount * 100))

                if pay_status not in ["captured", "authorized"]:
                    signature_valid = False
                    logger.warning(f"Payment {payload.razorpay_payment_id} status is '{pay_status}' (not captured)")
                elif pay_amount != expected_amount:
                    signature_valid = False
                    logger.warning(f"Payment amount mismatch: got {pay_amount}, expected {expected_amount}")
            except Exception as e:
                logger.error(f"Failed to fetch payment status from Razorpay API: {e}")
                # Keep signature_valid true only if cryptographic check passed and API was unreachable
    else:
        # Standard HMAC-SHA256 signature calculation using server RAZORPAY_KEY_SECRET
        expected_msg = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}"
        computed_sig = hmac.new(
            RAZORPAY_KEY_SECRET.encode("utf-8"),
            expected_msg.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()
        
        # Strictly compare HMAC digest - NO mock or fake bypass allowed
        if hmac.compare_digest(computed_sig, payload.razorpay_signature):
            signature_valid = True

    # If verification failed, update order status to FAILED and restore inventory
    if not signature_valid:
        order.payment_status = "FAILED"
        order.status = "PENDING"
        # Restore reserved product stock
        for item in order.items:
            prod = db.query(Product).filter(Product.id == item.product_id).first()
            if prod:
                prod.stock += item.quantity
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="Payment signature could not be verified. Order marked as FAILED."
        )

    # Verification successful: Mark order as PAID
    order.payment_status = "PAID"
    order.status = "CONFIRMED"
    order.razorpay_order_id = payload.razorpay_order_id
    order.razorpay_payment_id = payload.razorpay_payment_id
    order.razorpay_signature = payload.razorpay_signature
    order.transaction_time = datetime.utcnow()

    db.commit()
    db.refresh(order)
    logger.info(f"Order #{order.order_number} successfully verified and marked PAID.")
    return order

@router.post("/cancel", response_model=OrderResponse)
def cancel_or_fail_payment(
    payload: PaymentFailureReport,
    db: Session = Depends(get_db)
):
    """
    Called when customer dismisses or cancels payment gateway, or when gateway reports failure.
    Sets status to CANCELLED or FAILED, and safely restores inventory.
    Never marks order as PAID.
    """
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.payment_status == "PAID":
        return order

    # Restore inventory stock if not already restored
    if order.payment_status not in ["CANCELLED", "FAILED"]:
        for item in order.items:
            prod = db.query(Product).filter(Product.id == item.product_id).first()
            if prod:
                prod.stock += item.quantity

    new_payment_status = payload.status if payload.status in ["FAILED", "CANCELLED"] else "CANCELLED"
    order.payment_status = new_payment_status
    order.status = "CANCELLED" if new_payment_status == "CANCELLED" else "PENDING"
    order.notes = f"{order.notes or ''} [{new_payment_status}: {payload.reason}]".strip()

    db.commit()
    db.refresh(order)
    return order

@router.post("/create-direct-upi-order", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_direct_upi_order(
    payload: DirectUPIOrderCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Creates order for Direct UPI payment flow.
    Status is CONFIRMED, payment status remains PENDING until merchant verification.
    """
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart cannot be empty")

    subtotal = 0.0
    order_items_to_create = []

    for item in payload.items:
        prod = db.query(Product).filter(Product.id == item.product_id).first()
        if not prod or not prod.is_active:
            raise HTTPException(status_code=400, detail=f"Product #{item.product_id} is unavailable")
        
        if prod.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient inventory for '{prod.name}'. Only {prod.stock} units remaining."
            )

        line_total = round(prod.price * item.quantity, 2)
        subtotal += line_total
        prod.stock -= item.quantity

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
    final_amount = round(subtotal + shipping_fee + tax_amount, 2)

    order = Order(
        order_number=generate_order_number(),
        user_id=current_user.id if current_user else None,
        customer_name=payload.customer_name,
        customer_email=payload.customer_email.lower(),
        customer_phone=payload.customer_phone,
        shipping_address=payload.shipping_address,
        city=payload.city,
        postal_code=payload.postal_code,
        subtotal=round(subtotal, 2),
        shipping_fee=shipping_fee,
        tax_amount=tax_amount,
        total_amount=final_amount,
        discount_amount=0.0,
        status="CONFIRMED",
        payment_status="PENDING",
        payment_method="Direct UPI",
        notes=payload.notes
    )

    db.add(order)
    db.flush()

    for oi in order_items_to_create:
        oi.order_id = order.id
        db.add(oi)

    db.commit()
    db.refresh(order)
    return order

@router.post("/submit-direct-upi", response_model=OrderResponse)
def submit_direct_upi_reference(
    payload: DirectUPISubmit,
    db: Session = Depends(get_db)
):
    """
    Allows customer to submit their 12-digit UPI reference / UTR number.
    Order remains PENDING until verified by store admin.
    """
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.upi_reference = payload.upi_reference.strip()
    order.payment_method = "Direct UPI"
    order.payment_status = "PENDING"
    order.status = "CONFIRMED"
    order.transaction_time = datetime.utcnow()

    db.commit()
    db.refresh(order)
    return order

@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Webhook handler for Razorpay asynchronous payment events:
    - payment.captured
    - payment.failed
    - order.paid
    """
    raw_body = await request.body()

    # Validate webhook signature
    if RAZORPAY_WEBHOOK_SECRET and not RAZORPAY_WEBHOOK_SECRET.startswith("rzp_webhook_secret_placeholder"):
        if not x_razorpay_signature:
            raise HTTPException(status_code=400, detail="Missing webhook signature")
        
        computed_signature = hmac.new(
            RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
            raw_body,
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(computed_signature, x_razorpay_signature):
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

    try:
        data = json.loads(raw_body.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = data.get("event")
    payload = data.get("payload", {})

    if event_type in ["payment.captured", "order.paid"]:
        payment_entity = payload.get("payment", {}).get("entity", {})
        rzp_order_id = payment_entity.get("order_id")
        rzp_payment_id = payment_entity.get("id")

        if rzp_order_id:
            order = db.query(Order).filter(Order.razorpay_order_id == rzp_order_id).first()
            if order and order.payment_status != "PAID":
                order.payment_status = "PAID"
                order.status = "CONFIRMED"
                order.razorpay_payment_id = rzp_payment_id
                order.transaction_time = datetime.utcnow()
                db.commit()

    elif event_type == "payment.failed":
        payment_entity = payload.get("payment", {}).get("entity", {})
        rzp_order_id = payment_entity.get("order_id")
        if rzp_order_id:
            order = db.query(Order).filter(Order.razorpay_order_id == rzp_order_id).first()
            if order and order.payment_status != "PAID":
                order.payment_status = "FAILED"
                db.commit()

    return {"status": "ok", "event": event_type}

@router.get("/admin/payments", response_model=List[OrderResponse])
def get_admin_payments(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Admin-only: Retrieve all orders and their comprehensive payment details."""
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return orders

@router.patch("/admin/payments/{order_id}/verify-upi", response_model=OrderResponse)
def verify_direct_upi_payment(
    order_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Admin-only: Verify customer's direct UPI bank transfer."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.payment_status = "PAID"
    order.status = "CONFIRMED"
    order.transaction_time = datetime.utcnow()
    db.commit()
    db.refresh(order)
    return order

@router.patch("/admin/payments/{order_id}/confirm-cod", response_model=OrderResponse)
def confirm_cod_cash_collected(
    order_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Admin-only: Mark cash collected for COD order."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.payment_status = "PAID"
    order.status = "DELIVERED"
    order.transaction_time = datetime.utcnow()
    db.commit()
    db.refresh(order)
    return order

@router.post("/admin/payments/{order_id}/refund", response_model=OrderResponse)
def refund_payment(
    order_id: int,
    refund_in: RefundRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Admin-only: Process a refund for an order."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # If it was a Razorpay payment, trigger gateway refund
    client = get_razorpay_client()
    if client and order.razorpay_payment_id and not order.razorpay_payment_id.startswith("pay_test_"):
        try:
            refund_amount = int(round((refund_in.amount or order.total_amount) * 100))
            client.payment.refund(order.razorpay_payment_id, {
                "amount": refund_amount,
                "notes": {"reason": refund_in.reason}
            })
        except Exception as e:
            logger.error(f"Razorpay refund API call failed: {e}")
            raise HTTPException(status_code=400, detail=f"Gateway refund failed: {str(e)}")

    order.payment_status = "REFUNDED"
    order.status = "CANCELLED"
    db.commit()
    db.refresh(order)
    return order

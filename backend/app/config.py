import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env from backend dir and project root
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR.parent / ".env")

DB_FILE = BASE_DIR / "ecommerce.db"

SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-ecommerce-jwt-key-2026-secure")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 days

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_FILE}")

# Razorpay & Payment Gateway Configuration (Production Live Keys)
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_live_U1EINZEYZdW4j8")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "odW4tu1O6YY6KsB0sXj0Ct7V")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "rzp_webhook_secret_placeholder")

# Direct UPI Configuration
UPI_ID = os.getenv("UPI_ID", "8639866865@ybl")
MERCHANT_NAME = "AuraMart Modern Commerce"

# AuraMart – Modern Commerce

AuraMart is a modern full-stack e-commerce web platform designed by **Naveen Reddy**, with integrated Razorpay Standard Checkout, instant UPI app redirection, cash on delivery, Amazon.in Associates, and administrative management.

[![Live Storefront](https://img.shields.io/badge/Live_Storefront-GitHub_Pages-2ea44f?style=for-the-badge&logo=github)](https://indukurunaveenreddy.github.io/auramart-ecommerce/)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/indukurunaveenreddy/auramart-ecommerce)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Findukurunaveenreddy%2Fauramart-ecommerce&root-directory=frontend)

![AuraMart Modern Commerce](https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1200&q=80)

---

## 🌟 Key Features

* **Complete Payment Architecture**:
  * **Razorpay Standard Gateway**: Cards, UPI, QR code, Netbanking, and Wallets with server-side HMAC SHA-256 signature verification.
  * **Direct UPI Click-to-Pay**: Deep links for PhonePe, Google Pay, and Paytm, along with on-screen QR codes.
  * **Cash on Delivery (COD)**: Seamless checkout with automated order confirmation and admin verification.
* **Separated Authentication**:
  * **Customer Portal**: Sign up and login for order tracking, shopping cart, and instant checkout.
  * **Admin Management Portal**: Role-restricted access with amber-shield security for managing catalog inventory, orders, and settlements.
* **Curated Catalog**: 110+ genuine Indian products across 7 categories (Fashion, Electronics, Home & Living, Fitness, Audio, Personal Care, and Accessories) with zero duplicate items.
* **Responsive Modern UI**: Built with Tailwind CSS and Lucide icons using a dark navy and emerald green palette.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React
* **Backend**: FastAPI, Python 3.12+, SQLAlchemy, Uvicorn, Pydantic v2
* **Payment Gateway**: Official Razorpay SDK (`razorpay`) with live order creation & webhook support
* **Database**: SQLite (local) / PostgreSQL ready

---

## 🚀 Getting Started Locally

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/indukurunaveenreddy/auramart-ecommerce.git
cd auramart-ecommerce

# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your Razorpay Key ID and Secret

# Start FastAPI server
uvicorn main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
```

Backend API will be running at `http://localhost:8000` (Swagger docs at `/docs`).

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be running at `http://localhost:5173`.

---

## 🌐 Deployment Guide

### Deploying Frontend to Vercel

1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import `indukurunaveenreddy/auramart-ecommerce`.
4. Set **Root Directory** to `frontend`.
5. Set Environment Variable:
   * `VITE_API_URL`: Your deployed FastAPI backend URL (e.g. `https://your-backend.onrender.com`).
6. Click **Deploy**.

### Deploying Backend to Render / Railway

1. In [Render Dashboard](https://dashboard.render.com/), select **New Web Service**.
2. Connect `indukurunaveenreddy/auramart-ecommerce`.
3. Configure:
   * **Root Directory**: `.`
   * **Build Command**: `pip install -r backend/requirements.txt`
   * **Start Command**: `uvicorn main:app --app-dir backend --host 0.0.0.0 --port 10000`
4. Add Environment Variables:
   * `RAZORPAY_KEY_ID`: Your Razorpay Key ID
   * `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret
   * `UPI_ID`: Your registered UPI ID
   * `SECRET_KEY`: A secure random JWT secret string

---

## 👥 Demo Credentials

* **Admin Portal**: `admin@store.com` / `Admin@123`
* **Customer Account**: `alex@example.com` / `Customer@123`

---

## 📄 License

MIT License. Designed & Developed for Modern Indian E-Commerce.

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.seed_data import seed_database
from app.routers import auth, products, categories, orders, analytics, payments

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    Base.metadata.create_all(bind=engine)
    # Seed initial data
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="Online Shopping Management System API",
    description="High-performance e-commerce backend with Admin Dashboard & Analytics",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(analytics.router)
app.include_router(payments.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to AuraMart Online Shopping System API",
        "documentation": "/docs",
        "health": "/api/health",
        "storefront_url": "http://localhost:5173"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Online Shopping Management System",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

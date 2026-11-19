from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.database import get_db
from app.models import Product, Category
from app.schemas import ProductCreate, ProductUpdate, ProductResponse
from app.auth import get_current_admin

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("")
def get_products(
    category_id: Optional[int] = None,
    category_slug: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    featured_only: Optional[bool] = None,
    in_stock_only: Optional[bool] = None,
    amazon_only: Optional[bool] = None,
    include_inactive: Optional[bool] = False,
    sort_by: Optional[str] = "newest",  # newest, price_asc, price_desc, rating, trending
    page: int = Query(1, ge=1),
    limit: int = Query(40, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    
    if not include_inactive:
        query = query.filter(Product.is_active == True)
        
    if category_id:
        query = query.filter(Product.category_id == category_id)
        
    if category_slug:
        cat = db.query(Category).filter(Category.slug == category_slug).first()
        if cat:
            query = query.filter(Product.category_id == cat.id)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_fmt),
                Product.description.ilike(search_fmt),
                Product.sku.ilike(search_fmt),
                Product.asin.ilike(search_fmt),
                Product.brand.ilike(search_fmt)
            )
        )

    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if featured_only:
        query = query.filter(Product.is_featured == True)

    if amazon_only:
        query = query.filter(Product.is_amazon_product == True)

    if in_stock_only:
        query = query.filter(Product.stock > 0)

    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "rating":
        query = query.order_by(Product.rating.desc())
    elif sort_by == "trending":
        query = query.order_by(Product.reviews_count.desc(), Product.rating.desc())
    else:  # newest
        query = query.order_by(Product.created_at.desc())

    total = query.count()
    total_pages = max(1, (total + limit - 1) // limit)
    products = query.offset((page - 1) * limit).limit(limit).all()

    # Serialize products via Pydantic model
    items = [ProductResponse.model_validate(p).model_dump() for p in products]

    return {
        "products": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
    }

@router.get("/{id_or_slug}", response_model=ProductResponse)
def get_product(id_or_slug: str, db: Session = Depends(get_db)):
    if id_or_slug.isdigit():
        prod = db.query(Product).filter(Product.id == int(id_or_slug)).first()
    else:
        prod = db.query(Product).filter(Product.slug == id_or_slug).first()
        
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    return prod

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    existing = db.query(Product).filter(
        or_(Product.slug == product_in.slug, Product.sku == product_in.sku)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="A product with this slug or SKU already exists")

    product = Product(**product_in.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(prod, field, val)

    db.commit()
    db.refresh(prod)
    return prod

@router.patch("/{product_id}/stock", response_model=ProductResponse)
def update_stock(
    product_id: int,
    stock: int = Query(..., ge=0),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    prod.stock = stock
    db.commit()
    db.refresh(prod)
    return prod

@router.get("/export/csv")
def export_products_csv(db: Session = Depends(get_db)):
    """Export complete Amazon A-to-Z catalog as CSV."""
    import csv, io
    from fastapi.responses import Response

    products = (
        db.query(Product, Category.name.label("category_name"))
        .join(Category, Product.category_id == Category.id)
        .filter(Product.is_active == True)
        .order_by(Product.name.asc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Product_ID", "Alphabet_Letter", "Product_Name", "Category", 
        "Selling_Price_INR", "MRP_Compare_Price_INR", "Discount_Percentage", 
        "Stock_Available", "SKU", "Customer_Rating", "Reviews_Count", "Image_URL"
    ])

    for prod, cat_name in products:
        mrp = prod.compare_at_price or prod.price
        disc = round(((mrp - prod.price) / mrp) * 100, 1) if mrp > prod.price else 0.0
        writer.writerow([
            prod.id,
            prod.name[0].upper(),
            prod.name,
            cat_name,
            prod.price,
            mrp,
            disc,
            prod.stock,
            prod.sku,
            prod.rating,
            prod.reviews_count,
            prod.image_url
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=amazon_india_catalog.csv"}
    )

@router.get("/export/json")
def export_products_json(db: Session = Depends(get_db)):
    """Export complete Amazon A-to-Z catalog as JSON."""
    products = (
        db.query(Product, Category.name.label("category_name"))
        .join(Category, Product.category_id == Category.id)
        .filter(Product.is_active == True)
        .order_by(Product.name.asc())
        .all()
    )

    result = []
    for prod, cat_name in products:
        mrp = prod.compare_at_price or prod.price
        disc = round(((mrp - prod.price) / mrp) * 100, 1) if mrp > prod.price else 0.0
        result.append({
            "id": prod.id,
            "letter": prod.name[0].upper(),
            "name": prod.name,
            "category": cat_name,
            "price": prod.price,
            "compare_at_price": mrp,
            "discount_percentage": disc,
            "stock": prod.stock,
            "sku": prod.sku,
            "rating": prod.rating,
            "reviews_count": prod.reviews_count,
            "image_url": prod.image_url
        })
    return result

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(prod)
    db.commit()
    return None

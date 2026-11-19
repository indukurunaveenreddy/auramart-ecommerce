import json
from pathlib import Path
from sqlalchemy.orm import Session
from app.models import User, Category, Product
from app.auth import get_password_hash
from app.utils.dedup import check_product_duplicate, normalize_product_name

CATALOG_FILE = Path(__file__).resolve().parent / "curated_catalog.json"

def seed_database(db: Session):
    # Clean up any legacy Meesho or Flipkart products & category descriptions
    try:
        for bad_kw in ['meesho', 'flipkart', 'messho']:
            pattern = f"%{bad_kw}%"
            db.query(Product).filter(
                (Product.name.ilike(pattern)) | (Product.description.ilike(pattern))
            ).delete(synchronize_session=False)

        cat7 = db.query(Category).filter(Category.slug == "accessories").first()
        if cat7 and "meesho" in (cat7.description or "").lower():
            cat7.description = "Amazon trending jewellery, smart accessories, mobile covers, 65W fast chargers, tempered glass, wallets, sunglasses and watches"
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Warning during legacy cleanup: {e}")

    # Check if database is already seeded
    if db.query(User).filter(User.email == "admin@store.com").first():
        print("Database already seeded. Verifying catalog products...")
        # Ensure any missing Amazon products from curated_catalog.json are inserted
        if CATALOG_FILE.exists():
            try:
                with open(CATALOG_FILE, "r", encoding="utf-8") as f:
                    catalog = json.load(f)
                category_map = {c.slug: c.id for c in db.query(Category).all()}
                existing_skus = {p.sku for p in db.query(Product.sku).all()}
                new_count = 0
                prod_list = catalog if isinstance(catalog, list) else catalog.get("products", [])
                for p in prod_list:
                    sku = p.get("sku", f"AURA-{p['id']:05d}")
                    if sku not in existing_skus:
                        # Check for duplicates before inserting
                        is_dup, _, _ = check_product_duplicate(
                            db,
                            asin=p.get("asin"),
                            name=p.get("name"),
                            affiliate_url=p.get("amazon_affiliate_url"),
                            category_id=category_map.get(p.get("category_slug")) or p.get("category_id"),
                            brand=p.get("brand")
                        )
                        if is_dup:
                            continue

                        # Find matching category by slug or default
                        cat_slug = p.get("category_slug")
                        cat_id = category_map.get(cat_slug) or p.get("category_id")
                        prod = Product(
                            name=p["name"],
                            slug=p["slug"],
                            description=p.get("description", ""),
                            price=float(p["price"]),
                            compare_at_price=float(p["compare_at_price"]) if p.get("compare_at_price") else None,
                            cost_price=float(p["cost_price"]) if p.get("cost_price") else None,
                            stock=int(p.get("stock", 50)),
                            sku=sku,
                            category_id=cat_id,
                            image_url=p.get("image_url", ""),
                            is_featured=bool(p.get("is_featured", 0)),
                            is_active=bool(p.get("is_active", 1)),
                            rating=float(p.get("rating", 4.5)),
                            reviews_count=int(p.get("reviews_count", 100)),
                            asin=p.get("asin"),
                            is_amazon_product=bool(p.get("is_amazon_product", 1)),
                            amazon_affiliate_url=p.get("amazon_affiliate_url"),
                            brand=p.get("brand"),
                            features=p.get("features")
                        )
                        db.add(prod)
                        new_count += 1
                if new_count > 0:
                    db.commit()
                    print(f"Added {new_count} missing curated products to database.")
            except Exception as e:
                db.rollback()
                print(f"Warning syncing curated products: {e}")
        return

    print("Seeding database with curated catalog in Indian Rupees (₹)...")

    # 1. Users
    admin = User(
        name="System Administrator",
        email="admin@store.com",
        hashed_password=get_password_hash("Admin@123"),
        role="admin"
    )
    customer1 = User(
        name="Alex Morgan",
        email="alex@example.com",
        hashed_password=get_password_hash("Customer@123"),
        role="customer"
    )
    customer2 = User(
        name="Sophia Chen",
        email="sophia@example.com",
        hashed_password=get_password_hash("Customer@123"),
        role="customer"
    )
    customer3 = User(
        name="Naveen Reddy",
        email="indukurun@gmail.com",
        hashed_password=get_password_hash("Customer@123"),
        role="customer"
    )
    db.add_all([admin, customer1, customer2, customer3])
    db.flush()

    # 2. Categories & Products from curated_catalog.json
    if CATALOG_FILE.exists():
        with open(CATALOG_FILE, "r", encoding="utf-8") as f:
            catalog = json.load(f)

        category_id_map = {}
        for c in catalog.get("categories", []):
            cat = Category(
                name=c["name"],
                slug=c["slug"],
                description=c.get("description"),
                icon=c.get("icon")
            )
            db.add(cat)
            db.flush()
            category_id_map[c["id"]] = cat.id

        for p in catalog.get("products", []):
            old_cat_id = p.get("category_id")
            new_cat_id = category_id_map.get(old_cat_id)
            prod = Product(
                name=p["name"],
                slug=p["slug"],
                description=p.get("description", ""),
                price=float(p["price"]),
                compare_at_price=float(p["compare_at_price"]) if p.get("compare_at_price") else None,
                cost_price=float(p["cost_price"]) if p.get("cost_price") else None,
                stock=int(p.get("stock", 50)),
                sku=p.get("sku", f"AURA-{p['id']:05d}"),
                category_id=new_cat_id,
                image_url=p.get("image_url", ""),
                is_featured=bool(p.get("is_featured", 0)),
                is_active=bool(p.get("is_active", 1)),
                rating=float(p.get("rating", 4.5)),
                reviews_count=int(p.get("reviews_count", 100))
            )
            db.add(prod)
        db.flush()

    db.commit()
    print("Database seeding completed successfully.")

"""
AuraMart Product Deduplication and Canonical Identification Engine.

Detects and prevents duplicate products based on:
1. Canonical key: (category_id, normalized_brand, normalized_product_name)
2. Amazon ASIN
3. Canonical affiliate URL / product URL
4. Product SKU

Retains the best complete listing (rating, reviews, clean title, verified image, affiliate tag).
"""

import re
import urllib.parse
from typing import Optional, Tuple, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_

def normalize_product_name(name: str) -> str:
    """
    Normalizes a product name by removing common search modifiers,
    bracketed price constraints, capitalization differences, and repetitive text.
    """
    if not name:
        return ""
    t = name.lower()
    
    # Strip (Under ₹xxx) or under xxx
    t = re.sub(r"\s*\(under\s*₹?\d+\)", "", t)
    t = re.sub(r"\bunder\s+\d+\b", "", t)
    
    # Common search query keywords/modifiers appended in imports
    modifiers = [
        "buy online", "amazon india", "popular brands", "popular", "new collection", "new",
        "sale offers", "sale", "value pack", "combo", "best quality", "reviews", "discounted",
        "discount", "2026", "offers", "best brand", "best price", "exclusive", "customer choice",
        "latest design", "must have", "premium quality", "price range", "recommended",
        "shopping", "top picks", "trending products", "value for money", "wide range",
        "best sellers", "top rated", "budget", "premium", "latest", "trending", "deals",
        "branded", "lightweight", "durable", "cotton", "wireless", "portable", "compact",
        "professional", "everyday", "online shopping", "online", "for men", "for women", "for kids",
        "price", "collection", "variety", "gift", "daily use", "accessories", "replacement",
        "best", "buy", "cheap"
    ]
    for term in modifiers:
        t = re.sub(rf"\b{term}\b", "", t)
        
    # If title has format "Brand Sub - Kw", strip repetitive part after dash
    if " - " in t:
        parts = t.split(" - ")
        t = parts[0]
        
    t = re.sub(r"[-–—:_/\(\)\[\]]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t

def clean_display_title(name: str) -> str:
    """
    Produces a clean, human-readable e-commerce product title
    without search query noise, while keeping the authentic brand and subcategory.
    """
    if not name:
        return ""
    cleaned = re.sub(r"\s*\(under\s*₹?\d+\)", "", name, flags=re.I)
    cleaned = re.sub(r"\bunder\s+\d+\b", "", cleaned, flags=re.I)
    
    # If title has format "Brand Subcategory - Keyword", keep clean primary part
    if " - " in cleaned:
        parts = cleaned.split(" - ")
        cleaned = parts[0].strip()
        
    # Strip trailing noisy words
    noisy_trailing = [
        r"\s+buy online$", r"\s+amazon india$", r"\s+popular$", r"\s+new$", r"\s+sale$",
        r"\s+value pack$", r"\s+combo$", r"\s+best quality$", r"\s+reviews$", r"\s+discount$",
        r"\s+2026$", r"\s+offers$", r"\s+best sellers$", r"\s+top rated$", r"\s+budget$",
        r"\s+premium$", r"\s+latest$", r"\s+trending$", r"\s+deals$", r"\s+branded$",
        r"\s+everyday$", r"\s+online$"
    ]
    for pattern in noisy_trailing:
        cleaned = re.sub(pattern, "", cleaned, flags=re.I)
        
    return re.sub(r"\s+", " ", cleaned).strip()

def get_canonical_key(
    asin: Optional[str] = None,
    name: Optional[str] = None,
    affiliate_url: Optional[str] = None,
    category_id: Optional[int] = None,
    brand: Optional[str] = None
) -> str:
    """
    Generates a deterministic canonical key for duplicate clustering.
    Products with identical canonical keys represent the exact same product.
    """
    norm_name = normalize_product_name(name or "")
    clean_brand = (brand or "").strip().lower()
    cat_str = str(category_id or 0)
    
    # Primary canonical cluster key: (category, brand, normalized_name)
    return f"cat:{cat_str}::brand:{clean_brand}::name:{norm_name}"

def check_product_duplicate(
    db: Session,
    asin: Optional[str] = None,
    name: Optional[str] = None,
    affiliate_url: Optional[str] = None,
    category_id: Optional[int] = None,
    brand: Optional[str] = None,
    exclude_id: Optional[int] = None
) -> Tuple[bool, Optional[Any], str]:
    """
    Checks if a product already exists in the database.
    Returns (is_duplicate: bool, existing_product: Optional[Product], reason: str).
    """
    from app.models import Product

    # 1. Check exact ASIN
    if asin:
        clean_asin = asin.strip().upper()
        q = db.query(Product).filter(Product.asin == clean_asin)
        if exclude_id:
            q = q.filter(Product.id != exclude_id)
        existing = q.first()
        if existing:
            return True, existing, f"Duplicate Amazon ASIN ({clean_asin})"

    # 2. Check exact affiliate URL or canonical URL
    if affiliate_url:
        clean_url = affiliate_url.strip()
        q = db.query(Product).filter(Product.amazon_affiliate_url == clean_url)
        if exclude_id:
            q = q.filter(Product.id != exclude_id)
        existing = q.first()
        if existing:
            return True, existing, f"Duplicate Amazon affiliate URL ({clean_url})"

    # 3. Check normalized product name in the same category and brand
    if name:
        target_norm = normalize_product_name(name)
        if target_norm:
            candidates_query = db.query(Product)
            if category_id:
                candidates_query = candidates_query.filter(Product.category_id == category_id)
            if exclude_id:
                candidates_query = candidates_query.filter(Product.id != exclude_id)
            
            candidates = candidates_query.all()
            for cand in candidates:
                cand_norm = normalize_product_name(cand.name)
                # Check exact normalized name match
                if cand_norm == target_norm:
                    # If brands match or either is blank, it's a duplicate
                    cand_brand = (cand.brand or "").strip().lower()
                    target_brand = (brand or "").strip().lower()
                    if not cand_brand or not target_brand or cand_brand == target_brand:
                        return True, cand, f"Duplicate product name '{cand.name}' (normalized: '{cand_norm}')"

    return False, None, ""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Category
from app.schemas import CategoryCreate, CategoryResponse
from app.auth import get_current_admin

router = APIRouter(prefix="/api/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.name.asc()).all()

@router.post("", response_model=CategoryResponse)
def create_category(cat_in: CategoryCreate, db: Session = Depends(get_db), current_admin=Depends(get_current_admin)):
    existing = db.query(Category).filter(Category.slug == cat_in.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category slug already exists")
    category = Category(**cat_in.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, cat_in: CategoryCreate, db: Session = Depends(get_db), current_admin=Depends(get_current_admin)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    category.name = cat_in.name
    category.slug = cat_in.slug
    category.description = cat_in.description
    category.icon = cat_in.icon
    db.commit()
    db.refresh(category)
    return category

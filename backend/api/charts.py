import logging
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List, Dict, Any
from backend.database.connection import get_db
from backend.database.models import Customer
from backend.api.kpis import apply_customer_filters

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/charts", tags=["Charts"])

@router.get("/sales-trends")
def get_sales_trends(
    gender: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    payment_method: Optional[str] = Query(None),
    min_age: Optional[int] = Query(None),
    max_age: Optional[int] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        base_query = db.query(Customer)
        filtered = apply_customer_filters(
            base_query, gender, category, location, payment_method, min_age, max_age, start_date, end_date
        )
        
        monthly_stats = filtered.with_entities(
            func.substr(Customer.purchase_date, 1, 7).label("month"),
            func.sum(Customer.purchase_amount).label("revenue"),
            func.count(Customer.customer_id).label("orders")
        ).group_by("month").order_by("month").all()
        
        return [
            {
                "month": r.month,
                "revenue": round(float(r.revenue or 0.0), 2),
                "orders": int(r.orders or 0)
            } for r in monthly_stats
        ]
    except Exception as e:
        logger.error(f"Error fetching sales trends: {e}")
        return []

@router.get("/category-performance")
def get_category_performance(
    gender: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    payment_method: Optional[str] = Query(None),
    min_age: Optional[int] = Query(None),
    max_age: Optional[int] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        base_query = db.query(Customer)
        filtered = apply_customer_filters(
            base_query, gender, category, location, payment_method, min_age, max_age, start_date, end_date
        )
        
        cat_stats = filtered.with_entities(
            Customer.category,
            func.sum(Customer.purchase_amount).label("revenue"),
            func.count(Customer.customer_id).label("orders"),
            func.avg(Customer.review_rating).label("avg_rating")
        ).group_by(Customer.category).order_by(func.sum(Customer.purchase_amount).desc()).all()
        
        return [
            {
                "category": r.category,
                "revenue": round(float(r.revenue or 0.0), 2),
                "orders": int(r.orders or 0),
                "avg_rating": round(float(r.avg_rating or 0.0), 2)
            } for r in cat_stats
        ]
    except Exception as e:
        logger.error(f"Error fetching category stats: {e}")
        return []

@router.get("/demographics")
def get_demographics(
    gender: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    payment_method: Optional[str] = Query(None),
    min_age: Optional[int] = Query(None),
    max_age: Optional[int] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        base_query = db.query(Customer)
        filtered = apply_customer_filters(
            base_query, gender, category, location, payment_method, min_age, max_age, start_date, end_date
        )
        
        # Gender split
        gender_stats = filtered.with_entities(
            Customer.gender,
            func.count(Customer.customer_id).label("count"),
            func.sum(Customer.purchase_amount).label("revenue")
        ).group_by(Customer.gender).all()
        
        # Age group split
        age_stats = filtered.with_entities(
            Customer.age_group,
            func.count(Customer.customer_id).label("count")
        ).group_by(Customer.age_group).all()
        
        return {
            "gender": [
                {"name": r.gender, "value": int(r.count or 0), "revenue": round(float(r.revenue or 0.0), 2)}
                for r in gender_stats
            ],
            "age_groups": [
                {"name": r.age_group, "value": int(r.count or 0)}
                for r in age_stats if r.age_group is not None
            ]
        }
    except Exception as e:
        logger.error(f"Error fetching demographics stats: {e}")
        return {"gender": [], "age_groups": []}

@router.get("/payment-methods")
def get_payment_methods(
    gender: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    payment_method: Optional[str] = Query(None),
    min_age: Optional[int] = Query(None),
    max_age: Optional[int] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        base_query = db.query(Customer)
        filtered = apply_customer_filters(
            base_query, gender, category, location, payment_method, min_age, max_age, start_date, end_date
        )
        
        pay_stats = filtered.with_entities(
            Customer.payment_method,
            func.count(Customer.customer_id).label("count"),
            func.sum(Customer.purchase_amount).label("revenue")
        ).group_by(Customer.payment_method).order_by(func.count(Customer.customer_id).desc()).all()
        
        return [
            {
                "method": r.payment_method,
                "count": int(r.count or 0),
                "revenue": round(float(r.revenue or 0.0), 2)
            } for r in pay_stats
        ]
    except Exception as e:
        logger.error(f"Error fetching payment stats: {e}")
        return []

@router.get("/regions")
def get_regions(
    gender: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    payment_method: Optional[str] = Query(None),
    min_age: Optional[int] = Query(None),
    max_age: Optional[int] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        base_query = db.query(Customer)
        filtered = apply_customer_filters(
            base_query, gender, category, location, payment_method, min_age, max_age, start_date, end_date
        )
        
        region_stats = filtered.with_entities(
            Customer.location.label("state"),
            func.sum(Customer.purchase_amount).label("revenue"),
            func.count(Customer.customer_id).label("orders")
        ).group_by(Customer.location).order_by(func.sum(Customer.purchase_amount).desc()).limit(10).all()
        
        return [
            {
                "state": r.state,
                "revenue": round(float(r.revenue or 0.0), 2),
                "orders": int(r.orders or 0)
            } for r in region_stats
        ]
    except Exception as e:
        logger.error(f"Error fetching region stats: {e}")
        return []

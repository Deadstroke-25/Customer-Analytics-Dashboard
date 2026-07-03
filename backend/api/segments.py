import logging
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List, Dict, Any
from backend.database.connection import get_db
from backend.database.models import Customer
from backend.api.kpis import apply_customer_filters

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/segments", tags=["Segments"])

@router.get("/summary")
def get_rfm_summary(
    gender: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        base_query = db.query(Customer)
        filtered = apply_customer_filters(base_query, gender, category, location)
        
        cohorts = filtered.with_entities(
            Customer.customer_segment,
            func.count(Customer.customer_id).label("count"),
            func.avg(Customer.purchase_amount).label("avg_spend"),
            func.avg(Customer.clv_estimate).label("avg_clv"),
            func.sum(Customer.purchase_amount).label("total_revenue")
        ).group_by(Customer.customer_segment).all()
        
        return [
            {
                "segment": r.customer_segment or "Unknown",
                "count": int(r.count or 0),
                "avg_spend": round(float(r.avg_spend or 0.0), 2),
                "avg_clv": round(float(r.avg_clv or 0.0), 2),
                "total_revenue": round(float(r.total_revenue or 0.0), 2)
            } for r in cohorts
        ]
    except Exception as e:
        logger.error(f"Error fetching RFM summary: {e}")
        return []



@router.get("/top-customers")
def get_top_customers(
    limit: int = Query(20, ge=5, le=100),
    db: Session = Depends(get_db)
):
    try:
        customers = db.query(Customer).order_by(Customer.clv_estimate.desc()).limit(limit).all()
        return [
            {
                "customer_id": c.customer_id,
                "age": c.age,
                "gender": c.gender,
                "location": c.location,
                "total_purchases": c.previous_purchases + 1,
                "aov": round(c.purchase_amount, 2),
                "clv": round(c.clv_estimate, 2),
                "segment": c.customer_segment
            } for c in customers
        ]
    except Exception as e:
        logger.error(f"Error fetching top customers: {e}")
        return []

@router.get("/churn-risk")
def get_churn_risk_summary(db: Session = Depends(get_db)):
    try:
        # Active vs At Risk customers
        # Subscribers with recency > 60 days are flagged as High Churn Risk
        high_risk = db.query(Customer).filter(
            Customer.subscription_status == "Yes",
            Customer.rfm_recency > 60
        ).count()
        
        total_subscribers = db.query(Customer).filter(
            Customer.subscription_status == "Yes"
        ).count()
        
        return {
            "high_risk_subscribers": high_risk,
            "total_subscribers": total_subscribers,
            "churn_rate_pct": round((high_risk / total_subscribers * 100.0), 1) if total_subscribers > 0 else 0.0
        }
    except Exception as e:
        logger.error(f"Error fetching churn risk summary: {e}")
        return {"high_risk_subscribers": 0, "total_subscribers": 0, "churn_rate_pct": 0.0}

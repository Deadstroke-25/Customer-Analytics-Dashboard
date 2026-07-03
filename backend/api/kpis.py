import logging
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from backend.database.connection import get_db
from backend.database.models import Customer

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/kpis", tags=["KPIs"])

def apply_customer_filters(
    query,
    gender: Optional[str] = None,
    category: Optional[str] = None,
    location: Optional[str] = None,
    payment_method: Optional[str] = None,
    min_age: Optional[int] = None,
    max_age: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """
    Applies common query parameters filters to the SQLAlchemy Customer query.
    """
    if gender:
        query = query.filter(Customer.gender == gender)
    if category:
        query = query.filter(Customer.category == category)
    if location:
        query = query.filter(Customer.location == location)
    if payment_method:
        query = query.filter(Customer.payment_method == payment_method)
    if min_age is not None:
        query = query.filter(Customer.age >= min_age)
    if max_age is not None:
        query = query.filter(Customer.age <= max_age)
    if start_date:
        query = query.filter(Customer.purchase_date >= start_date)
    if end_date:
        query = query.filter(Customer.purchase_date <= end_date)
    return query

def get_dynamic_insights(filtered_query, db: Session) -> dict:
    """
    Calculates key business intelligence highlights dynamically from the current filtered ledger.
    """
    # 1. Highest revenue category
    highest_cat = filtered_query.with_entities(
        Customer.category,
        func.sum(Customer.purchase_amount).label("revenue")
    ).group_by(Customer.category).order_by(func.sum(Customer.purchase_amount).desc()).first()
    
    highest_cat_str = f"{highest_cat.category} (${round(float(highest_cat.revenue or 0.0), 2):,})" if highest_cat else "None"
    
    # 2. Top performing state
    top_state = filtered_query.with_entities(
        Customer.location,
        func.sum(Customer.purchase_amount).label("revenue")
    ).group_by(Customer.location).order_by(func.sum(Customer.purchase_amount).desc()).first()
    
    top_state_str = f"{top_state.location} (${round(float(top_state.revenue or 0.0), 2):,})" if top_state else "None"
    
    # 3. Highest CLV segment
    highest_clv_seg = filtered_query.with_entities(
        Customer.customer_segment,
        func.avg(Customer.clv_estimate).label("avg_clv")
    ).group_by(Customer.customer_segment).order_by(func.avg(Customer.clv_estimate).desc()).first()
    
    highest_clv_segment_str = f"{highest_clv_seg.customer_segment} (${round(float(highest_clv_seg.avg_clv or 0.0), 2):,} avg)" if highest_clv_seg else "None"
    
    # 4. Subscriber churn rate
    total_subs = filtered_query.filter(Customer.subscription_status == "Yes").count()
    churned_subs = filtered_query.filter(Customer.subscription_status == "Yes", Customer.days_since_last_purchase > 60).count()
    churn_rate_val = f"{round((churned_subs / total_subs * 100.0), 1) if total_subs > 0 else 0.0}%"
    
    # 5. Most used payment method
    most_used_pay = filtered_query.with_entities(
        Customer.payment_method,
        func.count(Customer.customer_id).label("count")
    ).group_by(Customer.payment_method).order_by(func.count(Customer.customer_id).desc()).first()
    
    most_used_payment_str = f"{most_used_pay.payment_method} ({most_used_pay.count:,} orders)" if most_used_pay else "None"
    
    return {
        "highest_category": highest_cat_str,
        "top_state": top_state_str,
        "highest_clv_segment": highest_clv_segment_str,
        "subscriber_churn": churn_rate_val,
        "most_used_payment": most_used_payment_str
    }

@router.get("")
def get_kpis(
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
        # Base query for aggregation
        base_query = db.query(Customer)
        filtered_query = apply_customer_filters(
            base_query, gender, category, location, payment_method, min_age, max_age, start_date, end_date
        )
        
        # Aggregate core KPI values
        stats = filtered_query.with_entities(
            func.sum(Customer.purchase_amount).label("total_revenue"),
            func.count(Customer.customer_id).label("total_orders"),
            func.avg(Customer.purchase_amount).label("avg_order_value"),
            func.sum(Customer.clv_estimate).label("total_clv")
        ).first()

        total_revenue = float(stats.total_revenue or 0.0)
        total_orders = int(stats.total_orders or 0)
        aov = float(stats.avg_order_value or 0.0)
        total_clv = float(stats.total_clv or 0.0)
        
        # Active vs Returning Customers
        returning_orders = filtered_query.filter(Customer.previous_purchases > 0).count()
        returning_pct = (returning_orders / total_orders * 100.0) if total_orders > 0 else 0.0
        
        # Calculate MoM revenue change dynamically using SQLite / PostgreSQL group by month
        monthly_stats = filtered_query.with_entities(
            func.substr(Customer.purchase_date, 1, 7).label("month"),
            func.sum(Customer.purchase_amount).label("revenue")
        ).group_by("month").order_by("month").all()
        
        growth_pct = 0.0
        if len(monthly_stats) >= 2:
            current_month_rev = float(monthly_stats[-1].revenue or 0.0)
            prev_month_rev = float(monthly_stats[-2].revenue or 0.0)
            if prev_month_rev > 0:
                growth_pct = ((current_month_rev - prev_month_rev) / prev_month_rev) * 100.0

        return {
            "total_revenue": round(total_revenue, 2),
            "total_orders": total_orders,
            "avg_order_value": round(aov, 2),
            "active_customers": total_orders,
            "returning_customers": returning_orders,
            "returning_percentage": round(returning_pct, 1),
            "revenue_growth_pct": round(growth_pct, 2),
            "total_clv_estimate": round(total_clv, 2),
            "insights": get_dynamic_insights(filtered_query, db)
        }
    except Exception as e:
        logger.error(f"Error fetching KPIs: {e}")
        return {
            "total_revenue": 0.0,
            "total_orders": 0,
            "avg_order_value": 0.0,
            "active_customers": 0,
            "returning_customers": 0,
            "returning_percentage": 0.0,
            "revenue_growth_pct": 0.0,
            "total_clv_estimate": 0.0,
            "insights": {
                "highest_category": "None",
                "top_state": "None",
                "highest_clv_segment": "None",
                "subscriber_churn": "0.0%",
                "most_used_payment": "None"
            }
        }

import logging
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
import pandas as pd
from typing import Optional, Dict, Any
from backend.database.connection import get_db
from backend.database.models import Customer
from backend.ml.forecaster import generate_sales_forecast
from backend.exploratory_analysis import calculate_correlation, detect_outliers_iqr

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ml", tags=["Advanced Analytics"])

@router.get("/forecast")
def get_forecast(db: Session = Depends(get_db)):
    try:
        # Load all customers into DataFrame to feed the forecast model
        customers = db.query(Customer).all()
        if not customers:
            return []
            
        data = [
            {
                "purchase_date": c.purchase_date,
                "purchase_amount": c.purchase_amount
            } for c in customers
        ]
        df = pd.DataFrame(data)
        forecast_results = generate_sales_forecast(df, forecast_months=6)
        return forecast_results
    except Exception as e:
        logger.error(f"Error compiling forecast results: {e}")
        return []

@router.get("/correlation")
def get_correlation(db: Session = Depends(get_db)):
    try:
        customers = db.query(Customer).all()
        if not customers:
            return {}
            
        data = [
            {
                "age": c.age,
                "purchase_amount": c.purchase_amount,
                "review_rating": c.review_rating,
                "previous_purchases": c.previous_purchases,
                "clv_estimate": c.clv_estimate
            } for c in customers
        ]
        df = pd.DataFrame(data)
        corr_matrix = calculate_correlation(df)
        
        # Convert df to dictionary for API response
        return corr_matrix.to_dict()
    except Exception as e:
        logger.error(f"Error computing correlation: {e}")
        return {}

@router.get("/outliers")
def get_outliers(
    column: str = Query("purchase_amount"),
    db: Session = Depends(get_db)
):
    try:
        customers = db.query(Customer).all()
        if not customers:
            return {"outlier_count": 0, "lower_bound": 0.0, "upper_bound": 0.0}
            
        data = [
            {
                "purchase_amount": c.purchase_amount,
                "age": c.age,
                "review_rating": c.review_rating
            } for c in customers
        ]
        df = pd.DataFrame(data)
        
        if column not in df.columns:
            column = "purchase_amount"
            
        outliers, lb, ub = detect_outliers_iqr(df, column)
        
        return {
            "column": column,
            "outlier_count": len(outliers),
            "lower_bound": round(float(lb), 2),
            "upper_bound": round(float(ub), 2),
            "total_records": len(df)
        }
    except Exception as e:
        logger.error(f"Error fetching outliers: {e}")
        return {"outlier_count": 0, "lower_bound": 0.0, "upper_bound": 0.0}

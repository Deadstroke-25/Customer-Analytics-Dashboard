import logging
import pandas as pd
from typing import Tuple

logger = logging.getLogger(__name__)

def run_segmentation_pipeline(df: pd.DataFrame) -> pd.DataFrame:
    """
    Executes demographic binning, RFM calculations, and Customer Lifetime Value estimation.
    """
    logger.info("Executing RFM segmentation pipeline...")
    df_feat = df.copy()

    # 1. Map purchase frequency to numerical days
    frequency_mapping = {
        'Fortnightly': 14,
        'Weekly': 7,
        'Bi-Weekly': 14,
        'Monthly': 30,
        'Every 3 Months': 90,
        'Quarterly': 90,
        'Annually': 365
    }
    if 'frequency_of_purchases' in df_feat.columns:
        df_feat['purchase_frequency_days'] = df_feat['frequency_of_purchases'].map(frequency_mapping)
        df_feat['purchase_frequency_days'] = df_feat['purchase_frequency_days'].fillna(30)
        
    # 2. Bin age groups
    if 'age' in df_feat.columns:
        labels = ['Young Adult', 'Adult', 'Middle-aged', 'Senior']
        df_feat['age_group'] = pd.qcut(df_feat['age'], q=4, labels=labels).astype(str)
        
    # 3. Calculate RFM metrics
    if 'days_since_last_purchase' in df_feat.columns:
        df_feat['rfm_recency'] = df_feat['days_since_last_purchase']
        df_feat['rfm_frequency'] = df_feat['previous_purchases'] + 1
        df_feat['rfm_monetary'] = df_feat['purchase_amount'] * df_feat['rfm_frequency']
        
        # Scoring quintiles (1-5)
        df_feat['r_score'] = pd.qcut(df_feat['rfm_recency'], q=5, labels=[5, 4, 3, 2, 1]).astype(int)
        df_feat['f_score'] = pd.qcut(df_feat['rfm_frequency'].rank(method='first'), q=5, labels=[1, 2, 3, 4, 5]).astype(int)
        df_feat['m_score'] = pd.qcut(df_feat['rfm_monetary'], q=5, labels=[1, 2, 3, 4, 5]).astype(int)
        df_feat['rfm_score'] = df_feat['r_score'].astype(str) + df_feat['f_score'].astype(str) + df_feat['m_score'].astype(str)
        
        # Map cohorts
        def get_segment(row):
            r, f = row['r_score'], row['f_score']
            if r >= 4 and f >= 4:
                return "Champions"
            elif r >= 3 and f >= 3:
                return "Loyal Customers"
            elif r >= 4 and f <= 2:
                return "Recent Buyers"
            elif r <= 2 and f >= 3:
                return "At Risk"
            else:
                return "Lost / Hibernating"
                
        df_feat['customer_segment'] = df_feat.apply(get_segment, axis=1)

    # 4. Customer Lifetime Value (CLV) Estimation with subscription weight
    if 'subscription_status' in df_feat.columns:
        premium = df_feat['subscription_status'].apply(lambda x: 1.25 if x == "Yes" else 1.0)
        df_feat['clv_estimate'] = df_feat['rfm_monetary'] * premium
    else:
        df_feat['clv_estimate'] = df_feat['rfm_monetary']
        
    logger.info("Segmentation pipeline finished successfully.")
    return df_feat

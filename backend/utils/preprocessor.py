import logging
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

def preprocess_dataframe(df: pd.DataFrame, end_date_str: str = "2026-07-01") -> pd.DataFrame:
    """
    Cleans and prepares raw customer shopping behavior dataframe with natural date distributions.
    """
    logger.info("Running raw data preprocessing pipeline...")
    df_clean = df.copy()
    
    # 1. Standardize columns to snake_case
    df_clean.columns = df_clean.columns.str.strip().str.lower().str.replace(' ', '_')
    if 'purchase_amount_(usd)' in df_clean.columns:
        df_clean = df_clean.rename(columns={'purchase_amount_(usd)': 'purchase_amount'})
        
    # 2. Impute missing ratings with group category median
    if 'review_rating' in df_clean.columns and 'category' in df_clean.columns:
        df_clean['review_rating'] = df_clean.groupby('category')['review_rating'].transform(
            lambda x: x.fillna(x.median())
        )
        
    # 3. Drop collinear columns
    if 'promo_code_used' in df_clean.columns and 'discount_applied' in df_clean.columns:
        if (df_clean['discount_applied'] == df_clean['promo_code_used']).all():
            df_clean = df_clean.drop(columns=['promo_code_used'])
            
    # 4. Generate synthetic purchase dates distributed naturally over the past year (1 to 365 days ago)
    np.random.seed(42)
    end_date = pd.to_datetime(end_date_str)
    
    # Generate random days ago to distribute transactions uniformly over 12 months
    days_ago = np.random.randint(1, 366, size=len(df_clean))
    df_clean['days_since_last_purchase'] = days_ago
    df_clean['purchase_date'] = end_date - pd.to_timedelta(df_clean['days_since_last_purchase'], unit='D')
    df_clean['purchase_date'] = df_clean['purchase_date'].dt.strftime('%Y-%m-%d')
    
    freq_max_days = {
        'Weekly': 7,
        'Bi-Weekly': 14,
        'Fortnightly': 14,
        'Monthly': 30,
        'Every 3 Months': 90,
        'Quarterly': 90,
        'Annually': 365
    }
    
    if 'frequency_of_purchases' in df_clean.columns:
        df_clean['purchase_frequency_days'] = df_clean['frequency_of_purchases'].map(freq_max_days)
        df_clean['purchase_frequency_days'] = df_clean['purchase_frequency_days'].fillna(30)
        
    logger.info("Preprocessing complete.")
    return df_clean

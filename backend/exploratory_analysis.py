import logging
import pandas as pd
import numpy as np
from typing import Tuple

logger = logging.getLogger(__name__)

def detect_outliers_iqr(df: pd.DataFrame, column: str, threshold: float = 1.5) -> Tuple[pd.DataFrame, float, float]:
    """
    Detects outliers in a numerical column using the Interquartile Range (IQR) method.
    """
    logger.info(f"Running IQR outlier detection on column '{column}'...")
    if column not in df.columns:
        raise ValueError(f"Column '{column}' not found in DataFrame.")
        
    q1 = df[column].quantile(0.25)
    q3 = df[column].quantile(0.75)
    iqr = q3 - q1
    lower_bound = q1 - (threshold * iqr)
    upper_bound = q3 + (threshold * iqr)
    
    outliers = df[(df[column] < lower_bound) | (df[column] > upper_bound)]
    return outliers, lower_bound, upper_bound

def calculate_correlation(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculates the correlation matrix for numerical columns in the DataFrame.
    """
    logger.info("Calculating Pearson correlation matrix...")
    numeric_df = df.select_dtypes(include=[np.number])
    if 'customer_id' in numeric_df.columns:
        numeric_df = numeric_df.drop(columns=['customer_id'])
    return numeric_df.corr()

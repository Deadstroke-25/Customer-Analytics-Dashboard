import logging
from typing import List, Tuple
import pandas as pd

logger = logging.getLogger(__name__)

def validate_dataframe(df: pd.DataFrame) -> Tuple[bool, List[str]]:
    """
    Validates a preprocessed dataframe against business constraints.

    Returns:
    --------
    is_valid : bool
        True if the data meets schema rules.
    errors : List[str]
        List of validation warning/error descriptions.
    """
    logger.info("Executing validation on data schema...")
    errors = []
    
    # 1. Expected schema keys
    required_cols = {
        'customer_id', 'age', 'gender', 'item_purchased', 'category',
        'purchase_amount', 'location', 'size', 'color', 'season',
        'review_rating', 'subscription_status', 'shipping_type',
        'discount_applied', 'previous_purchases', 'payment_method',
        'frequency_of_purchases', 'purchase_date'
    }
    
    missing = required_cols - set(df.columns)
    if missing:
        errors.append(f"Missing required columns in dataset: {list(missing)}")
        return False, errors
        
    # 2. Duplicate checks
    if df['customer_id'].duplicated().any():
        errors.append("Uniqueness violation: duplicate customer_id keys detected.")
        
    # 3. Numeric constraints
    invalid_age = df[(df['age'] < 18) | (df['age'] > 120)]
    if not invalid_age.empty:
        errors.append(f"Age boundary violation: {len(invalid_age)} records contain age values outside [18, 120].")
        
    invalid_amount = df[df['purchase_amount'] <= 0]
    if not invalid_amount.empty:
        errors.append(f"Purchase amount violation: {len(invalid_amount)} rows have negative or zero purchase amounts.")
        
    invalid_rating = df[(df['review_rating'] < 1.0) | (df['review_rating'] > 5.0)]
    if not invalid_rating.empty:
        errors.append(f"Review rating violation: {len(invalid_rating)} records contain review ratings outside [1.0, 5.0].")
        
    invalid_prev = df[df['previous_purchases'] < 0]
    if not invalid_prev.empty:
        errors.append(f"Previous purchases violation: {len(invalid_prev)} rows have negative previous purchase counts.")
        
    # 4. Check category columns
    invalid_sub = df[~df['subscription_status'].isin(['Yes', 'No'])]
    if not invalid_sub.empty:
        errors.append(f"Value constraint violation: subscription_status must be 'Yes' or 'No' (found {invalid_sub['subscription_status'].unique()}).")
        
    invalid_disc = df[~df['discount_applied'].isin(['Yes', 'No'])]
    if not invalid_disc.empty:
        errors.append(f"Value constraint violation: discount_applied must be 'Yes' or 'No' (found {invalid_disc['discount_applied'].unique()}).")

    is_valid = len(errors) == 0
    if is_valid:
        logger.info("Validation completed. All checks passed.")
    else:
        logger.warning(f"Validation failed with {len(errors)} errors.")
        
    return is_valid, errors

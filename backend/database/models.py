from sqlalchemy import Column, Integer, String, Float
from backend.database.connection import Base

class Customer(Base):
    __tablename__ = "customer"

    customer_id = Column(Integer, primary_key=True, index=True)
    age = Column(Integer)
    gender = Column(String(50))
    item_purchased = Column(String(100))
    category = Column(String(100))
    purchase_amount = Column(Float)
    location = Column(String(100))
    size = Column(String(50))
    color = Column(String(50))
    season = Column(String(50))
    review_rating = Column(Float)
    subscription_status = Column(String(50))
    shipping_type = Column(String(100))
    discount_applied = Column(String(50))
    previous_purchases = Column(Integer)
    payment_method = Column(String(100))
    frequency_of_purchases = Column(String(100))
    days_since_last_purchase = Column(Integer)
    purchase_date = Column(String(50))  # ISO Format Date YYYY-MM-DD
    purchase_frequency_days = Column(Integer)
    age_group = Column(String(50))
    rfm_recency = Column(Integer)
    rfm_frequency = Column(Integer)
    rfm_monetary = Column(Float)
    r_score = Column(Integer)
    f_score = Column(Integer)
    m_score = Column(Integer)
    rfm_score = Column(String(10))
    customer_segment = Column(String(100))
    clv_estimate = Column(Float)

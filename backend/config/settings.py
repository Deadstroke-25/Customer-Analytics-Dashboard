import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # App General Settings
    APP_NAME: str = "CustomerPulse API"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # Paths configuration
    PROJECT_ROOT: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    DATA_DIR: str = os.path.join(PROJECT_ROOT, "data")
    RAW_DATA_PATH: str = os.path.join(DATA_DIR, "raw", "customer_shopping_behavior.csv")
    PROCESSED_DATA_PATH: str = os.path.join(DATA_DIR, "processed", "customer_shopping_behavior_engineered.csv")
    
    # Database Settings
    # Default to local sqlite database in the backend/ directory
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{os.path.join(PROJECT_ROOT, 'backend', 'customer_pulse.db')}"
    )

    # ML Parameters
    RANDOM_STATE: int = 42
    OUTLIER_IQR_THRESHOLD: float = 1.5
    
    # CORS Origins
    CORS_ORIGINS: list = ["*"]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

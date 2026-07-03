import logging
import os
import sys
from fastapi import FastAPI, Depends, Query, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import pandas as pd
from typing import Optional

# Setup backend paths
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.config.settings import settings
from backend.database.connection import engine, Base, SessionLocal, get_db
from backend.database.models import Customer
from backend.api import kpis, charts, segments, forecast
from backend.utils.preprocessor import preprocess_dataframe
from backend.utils.validator import validate_dataframe
from backend.ml.segmenter import run_segmentation_pipeline
from backend.api.kpis import apply_customer_filters

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("backend")

# Initialize database tables
logger.info("Initializing database schemas...")
Base.metadata.create_all(bind=engine)

# Seed database on start if it has 0 records
db = SessionLocal()
try:
    if db.query(Customer).count() == 0:
        logger.info("Database is empty. Initiating bootloader database seeding...")
        if os.path.exists(settings.RAW_DATA_PATH):
            df_raw = pd.read_csv(settings.RAW_DATA_PATH)
            df_clean = preprocess_dataframe(df_raw)
            is_valid, errors = validate_dataframe(df_clean)
            if is_valid:
                df_engineered = run_segmentation_pipeline(df_clean)
                records = df_engineered.to_dict(orient="records")
                db.bulk_insert_mappings(Customer, records)
                db.commit()
                logger.info(f"Bootloader database seeding successful! Ingested {len(records)} records.")
            else:
                logger.error(f"Bootloader seeding failed. Validation errors: {errors}")
        else:
            logger.warning(f"Raw data file not found at {settings.RAW_DATA_PATH}. Seeding skipped.")
finally:
    db.close()

# Initialize FastAPI App
app = FastAPI(
    title=settings.APP_NAME,
    description="CustomerPulse - Enterprise Customer Analytics API Backend",
    version="1.0.0"
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(kpis.router, prefix="/api")
app.include_router(charts.router, prefix="/api")
app.include_router(segments.router, prefix="/api")
app.include_router(forecast.router, prefix="/api")

@app.get("/")
def get_root():
    return {
        "status": "Healthy",
        "app_name": settings.APP_NAME,
        "database": settings.DATABASE_URL.split("://")[0]
    }

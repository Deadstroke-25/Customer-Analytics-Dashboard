import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.config.settings import settings

logger = logging.getLogger(__name__)

# Configure engine arguments for SQLite and PostgreSQL
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
except Exception as e:
    logger.error(f"Error establishing database connection engine: {e}")
    raise e

def get_db():
    """
    FastAPI dependency yielding a database session and safely closing it after query completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

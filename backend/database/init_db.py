from sqlalchemy import create_engine
from core.config import settings
from .models import Base

def initialize_database():
    """Sync function for migrations/scripts"""
    engine = create_engine(settings.SYNC_DATABASE_URL)
    Base.metadata.create_all(bind=engine) 
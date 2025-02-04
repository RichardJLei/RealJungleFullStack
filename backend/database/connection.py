from sqlalchemy.ext.asyncio import create_async_engine
from core.config import settings

def create_async_engine_wrapper():
    return create_async_engine(
        settings.ASYNC_DATABASE_URL,
        pool_size=20,
        max_overflow=10,
        pool_pre_ping=True
    ) 
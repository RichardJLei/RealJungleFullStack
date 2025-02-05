import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, Session
from core.config import settings

# Load environment variables once
load_dotenv()

# Async engine and session
async_engine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    pool_size=20,
    max_overflow=10
)

AsyncSessionLocal = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Sync engine for migrations
sync_engine = create_engine(settings.SYNC_DATABASE_URL)

# Sync connection (Migrations/scripts)
def get_sync_connection():
    """Sync connection using psycopg2"""
    import psycopg2
    return psycopg2.connect(os.getenv("SYNC_DATABASE_URL"))

async def get_async_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session 
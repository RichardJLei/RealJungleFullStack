import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables once
load_dotenv()

def get_db_connection():
    """Create and return a new database connection using DATABASE_URL from env"""
    return psycopg2.connect(os.getenv("DATABASE_URL"))

async def get_async_db_connection():
    """Create and return an async database connection"""
    # For async support (if using asyncpg)
    import asyncpg
    return await asyncpg.connect(os.getenv("DATABASE_URL")) 
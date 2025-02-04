import sys
from pathlib import Path
import asyncio
from sqlalchemy import inspect
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import create_async_engine_wrapper
from core.config import settings
from database.models import BlogPost

# Add project root to Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

async def verify_schema_async():
    # Create async engine
    engine = create_async_engine_wrapper()
    
    async with engine.connect() as conn:
        # Reflect database schema
        inspector = await conn.run_sync(lambda sync_conn: inspect(sync_conn))
        
        # Get database columns
        db_columns = await conn.run_sync(
            lambda sync_conn: inspector.get_columns('blog_posts')
        )
        
        # Get model columns
        model_columns = get_model_schema()
        
        # Comparison logic
        discrepancies = compare_schemas(db_columns, model_columns)
        
        # Output results
        if discrepancies:
            print("Schema discrepancies found:")
            for issue in discrepancies:
                print(f" - {issue}")
        else:
            print("Schema matches perfectly!")

def compare_schemas(db_cols, model_cols):
    """Compare database columns with model definition"""
    discrepancies = []
    
    # Get column names
    db_names = {col['name'] for col in db_cols}
    model_names = set(model_cols.keys())
    
    # Check for extra/missing columns
    for db_col_name in db_names - model_names:
        discrepancies.append(f"Extra database column: {db_col_name}")
    
    for model_col_name in model_names - db_names:
        discrepancies.append(f"Missing database column: {model_col_name}")
    
    # Compare existing columns
    for db_col in db_cols:
        col_name = db_col['name']
        if col_name not in model_names:
            continue
            
        model_col = model_cols[col_name]
        
        # Check column type
        if not isinstance(db_col['type'], model_col['type']):
            discrepancies.append(
                f"Type mismatch for {col_name}: "
                f"DB={type(db_col['type']).__name__} vs "
                f"Model={model_col['type'].__name__}"
            )
            
        # Check nullable
        if db_col['nullable'] != model_col['nullable']:
            discrepancies.append(
                f"Nullable mismatch for {col_name}: "
                f"DB={db_col['nullable']} vs Model={model_col['nullable']}"
            )
    
    return discrepancies

def get_model_schema():
    """Extract schema definition from SQLAlchemy model"""
    return {
        col.name: {
            "type": type(col.type),
            "nullable": col.nullable,
            "default": col.default
        }
        for col in BlogPost.__table__.columns
    }

if __name__ == "__main__":
    asyncio.run(verify_schema_async()) 
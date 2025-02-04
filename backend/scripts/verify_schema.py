from sqlalchemy import inspect
from database.models import BlogPost, Base
from database import get_engine

def verify_schema():
    engine = get_engine()
    inspector = inspect(engine)
    
    # Get defined model columns
    model_columns = {col.name: col for col in BlogPost.__table__.columns}
    
    # Get database columns
    db_columns = inspector.get_columns('blog_posts')
    
    # Comparison logic
    discrepancies = []
    for db_col in db_columns:
        model_col = model_columns.get(db_col['name'])
        if not model_col:
            discrepancies.append(f"Extra column in DB: {db_col['name']}")
            continue
            
        # Type comparison
        if not isinstance(db_col['type'], type(model_col.type)):
            discrepancies.append(f"Type mismatch for {db_col['name']}: DB={db_col['type']} vs Model={model_col.type}")
            
        # Nullable check
        if db_col['nullable'] != model_col.nullable:
            discrepancies.append(f"Nullable mismatch for {db_col['name']}: DB={db_col['nullable']} vs Model={model_col.nullable}")
    
    # Output results
    if discrepancies:
        print("Schema discrepancies found:")
        for issue in discrepancies:
            print(f" - {issue}")
    else:
        print("Schema matches perfectly!")

if __name__ == "__main__":
    verify_schema() 
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.automap import automap_base
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv('.env')  # Load from current directory

# Get database URL directly from environment
DATABASE_URI = os.getenv('DATABASE_URL')

if not DATABASE_URI:
    raise ValueError("DATABASE_URL not found in environment variables")

def reflect_database():
    # Create synchronous engine
    engine = create_engine(DATABASE_URI)
    metadata = MetaData()
    
    # Reflect all tables
    metadata.reflect(engine)
    
    # Automap the reflected tables
    Base = automap_base(metadata=metadata)
    Base.prepare()
    
    # Print the BlogPost class structure
    if 'blog_posts' in Base.classes:
        print("\nBlogPost Model Structure:")
        bp = Base.classes.blog_posts
        print(f"Table name: {bp.__table__}")
        for column in bp.__table__.columns:
            print(f"Column: {column.name} | Type: {column.type} | Nullable: {column.nullable}")

if __name__ == "__main__":
    reflect_database() 
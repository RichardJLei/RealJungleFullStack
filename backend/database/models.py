from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from core.config import settings  # Uncomment this line

# Create the base class for our models
Base = declarative_base()

# Create the blog posts model
class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    category_id = Column(Integer)
    status = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Move engine creation to a function
def get_engine():
    return create_engine(settings.DATABASE_URL)

# Remove these lines:
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
# Base.metadata.create_all(bind=get_engine()) 
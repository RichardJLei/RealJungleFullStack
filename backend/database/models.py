from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Text, DateTime, func

# Create the base class for our models
Base = declarative_base()

# Create the blog posts model
class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now()) 
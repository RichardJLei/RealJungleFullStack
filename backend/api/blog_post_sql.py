from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from database import get_db_connection

router = APIRouter(
    prefix="/blog-post-sql",
    tags=["Blog Posts"],
    responses={404: {"description": "Not found"}}
)

class BlogPost(BaseModel):
    id: int
    title: str
    content: str

class BlogPostList(BaseModel):
    posts: List[BlogPost]

@router.get("/", response_model=BlogPostList)
async def get_blog_posts():
    """
    Retrieve list of blog posts from PostgreSQL database
    
    Returns:
        BlogPostList: List of blog post objects with id, title, and content
    """
    try:
        # Reuse existing database connection
        conn = await get_db_connection()
        
        # Example query - adjust based on your actual table structure
        query = "SELECT id, title, content FROM blog_posts"
        result = await conn.fetch(query)
        
        return {"posts": result}
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Database error: {str(e)}"
        )
    finally:
        await conn.close() 
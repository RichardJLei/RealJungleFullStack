from fastapi import APIRouter, HTTPException, Depends
from typing import List
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from database.core import get_async_session
# Import from dependencies module
from .dependencies.access_control import admin_access, regular_user_access
import logging
from sqlalchemy import text

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

logger = logging.getLogger(__name__)

@router.get(
    "/", 
    response_model=BlogPostList,
    dependencies=[Depends(regular_user_access)]  # Only require basic access
)
async def get_blog_posts(session: AsyncSession = Depends(get_async_session)):
    """
    Retrieve list of blog posts from PostgreSQL database
    
    Returns:
        BlogPostList: List of blog post objects with id, title, and content
    """
    try:
        result = await session.execute(text("SELECT id, title, content FROM blog_posts"))
        posts = result.mappings().all()
        return {"posts": posts}
    except Exception as e:
        logger.error(f"Database error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/test-deps")
async def test_dependencies(
    admin: bool = Depends(admin_access),
    user: bool = Depends(regular_user_access)
):
    return {"admin_check": admin, "user_check": user} 
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from database.core import get_async_session
# Import from dependencies module
from .dependencies.access_control import admin_access, regular_user_access
import logging
from sqlalchemy import text
from api.dependencies.pagination import get_pagination_params
from database.models import BlogPost
from sqlalchemy.orm import Session
from sqlalchemy.sql import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import ProgrammingError

router = APIRouter(
    prefix="/blog-post-sql",
    tags=["Blog Posts"],
    responses={404: {"description": "Not found"}}
)

class BlogPostResponse(BaseModel):
    id: int
    title: str
    content: str

class BlogPostList(BaseModel):
    data: List[BlogPostResponse]
    total: int

logger = logging.getLogger(__name__)

@router.get(
    "/", 
    response_model=BlogPostList,
    dependencies=[Depends(regular_user_access)]  # Only require basic access
)
async def get_blog_posts(
    pagination: Dict[str, Any] = Depends(get_pagination_params),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Get paginated blog posts with sorting (async version)
    """
    try:
        # Proper ORM-style select
        query = select(BlogPost)
        
        if pagination["order_by"]:
            query = query.order_by(text(pagination["order_by"]))
        
        # Execute paginated query
        result = await db.execute(
            query.offset(pagination["skip"]).limit(pagination["limit"])
        )
        posts = result.scalars().all()
        
        # Get total count
        total_result = await db.execute(select(func.count()).select_from(BlogPost))
        total = total_result.scalar()

        return {
            "data": [BlogPostResponse(**post.__dict__) for post in posts],
            "total": total
        }
    except ProgrammingError as pe:
        logger.error(f"Database query error: {str(pe)}")
        raise HTTPException(
            status_code=400,
            detail={
                "error": {
                    "message": "Invalid query parameters",
                    "statusCode": 400,
                    "errors": [str(pe)]
                }
            }
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": {
                    "message": "Internal server error",
                    "statusCode": 500
                }
            }
        )

@router.get("/test-deps")
async def test_dependencies(
    admin: bool = Depends(admin_access),
    user: bool = Depends(regular_user_access)
):
    return {"admin_check": admin, "user_check": user} 
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from database.core import get_async_session
# Import from dependencies module
from .dependencies.access_control import admin_access, regular_user_access
import logging
from sqlalchemy import text, and_
from api.dependencies.pagination import get_pagination_params, pagination_params, refine_filter_parser
from database.models import BlogPost
from sqlalchemy.orm import Session
from sqlalchemy.sql import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import ProgrammingError
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from datetime import datetime
from sqlalchemy.types import String, Text
from utils.query_builder import QueryBuilder

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
    response_model=List[BlogPostResponse],
    dependencies=[Depends(regular_user_access)]
)
async def get_blog_posts(
    pagination: Dict[str, Any] = Depends(get_pagination_params),
    filters: List[Dict] = Depends(refine_filter_parser),
    db: AsyncSession = Depends(get_async_session)
):
    """Get paginated blog posts with sorting"""
    try:
        query_builder = QueryBuilder(BlogPost)
        
        # Build query with all conditions
        posts, total = await (query_builder
            .apply_filters(filters)
            .apply_sorting(pagination.get("order_by"))
            .apply_pagination(pagination["skip"], pagination["limit"])
            .execute(db))

        headers = {"x-total-count": str(total)}
        
        return JSONResponse(
            content=jsonable_encoder(posts),
            headers=headers
        )
    except Exception as e:
        logger.error(f"Error fetching blog posts: {str(e)}")
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

@router.get("/{post_id}", response_model=BlogPostResponse)
async def get_blog_post(
    post_id: int,
    db: AsyncSession = Depends(get_async_session)
):
    result = await db.execute(select(BlogPost).filter(BlogPost.id == post_id))
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post 

def read_blog_posts(skip: int = 0, limit: int = 10, filters: dict = None):
    db = next(get_async_session())
    
    query = db.query(BlogPost)
    
    # Add filter conditions
    if filters:
        filter_conditions = []
        field = getattr(BlogPost, filters["field"], None)
        
        if field is not None:
            if filters["operator"] == "eq":
                filter_conditions.append(field == filters["value"])
            elif filters["operator"] == "contains":
                filter_conditions.append(field.ilike(f"%{filters['value']}%"))
            # Add more operators as needed
        
        if filter_conditions:
            query = query.filter(and_(*filter_conditions))
    
    # Existing pagination
    print("Received filters:", filters)  # Should show your filter params
    return query.offset(skip).limit(limit).all() 
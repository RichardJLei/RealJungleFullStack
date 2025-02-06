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
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

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
        # Base query with filters/sorting (no pagination)
        base_query = select(BlogPost)
        if pagination["order_by"]:
            base_query = base_query.order_by(text(pagination["order_by"]))
        
        # Get total count from base query
        count_result = await db.execute(
            select(func.count()).select_from(base_query.alias())
        )
        total = count_result.scalar()

        print(f"[Backend] Total records calculated: {total}")  # 👈 Add this line
        headers = {"x-total-count": str(total)}

        # Apply pagination to base query
        paginated_query = base_query.offset(
            pagination["skip"]
        ).limit(pagination["limit"])
        result = await db.execute(paginated_query)
        posts = result.scalars().all()

        return JSONResponse(
            content=jsonable_encoder(posts),
            headers=headers
        )
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
from fastapi import APIRouter
from core.config import settings

router = APIRouter(prefix="", tags=["configuration"])

@router.get("/config-check")
async def config_check():
    return {
        "db_url": settings.SYNC_DATABASE_URL,
        "environment": settings.ENVIRONMENT
    } 
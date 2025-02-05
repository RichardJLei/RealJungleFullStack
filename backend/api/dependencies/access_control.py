from fastapi import Request, HTTPException, Depends, status
import logging
from fastapi.security import OAuth2PasswordBearer

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token", auto_error=False)

# Temporary user validation until auth is implemented
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Temporary development bypass"""
    if not token:  # Bypass authentication when no token provided
        class TempUser:
            role = "admin"
            email = "dev@example.com"
        logger.info("Using temporary development user")
        return TempUser()
    
    # Actual token validation would go here
    raise HTTPException(status.HTTP_401_UNAUTHORIZED)

async def admin_access(user = Depends(get_current_user)):
    logger.info(f"Admin check for {user.email}")
    if user.role != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return user

async def regular_user_access(user = Depends(get_current_user)):
    logger.info(f"User access check for {user.email}")
    return user 
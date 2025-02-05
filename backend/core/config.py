import logging
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SYNC_DATABASE_URL: str
    ASYNC_DATABASE_URL: str
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"

settings = Settings()

# Configure root logger
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

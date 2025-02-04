from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SYNC_DATABASE_URL: str
    ASYNC_DATABASE_URL: str
    ENVIRONMENT: str = "development"
    
    class Config:
        env_file = ".env"

settings = Settings()

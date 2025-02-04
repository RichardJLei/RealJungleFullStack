from fastapi import FastAPI
from core.config import settings
from routers import test_config

app = FastAPI()

app.include_router(test_config.router)

@app.get("/")
async def root():
    return {"message": "Hello World"} 
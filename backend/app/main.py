from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.services import PipelineService
from app.config import CORS_ORIGINS

app = FastAPI(
    title="Ingredient Extraction API",
    version="1.0.0",
    description="Backend for YOLO + OCR Ingredient Extraction Pipeline"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.state.pipeline = PipelineService()

import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional

from app.pipeline.pipeline import IngredientPipeline

router = APIRouter()

# Initialize the pipeline only once when the server starts
pipeline = IngredientPipeline()


class PostProcessRequest(BaseModel):
    ocr_results: List[dict]
    custom_prompt: Optional[str] = None


@router.get("/")
def root():
    return {
        "message": "Backend is running successfully!"
    }


@router.get("/health")
def health():
    return {
        "status": "healthy"
    }


@router.post("/extract")
async def extract_ingredients(
    file: UploadFile = File(...),
    custom_prompt: str = Form(None)
):
    # Read image content directly in-memory to prevent local storage usage
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return {
            "status": "error",
            "message": "Invalid image file format. Could not decode."
        }

    # Pass the in-memory array to the extraction pipeline
    result = pipeline.process_image(img, custom_prompt=custom_prompt)

    return result


@router.post("/postprocess")
def postprocess_ocr(request: PostProcessRequest):
    # Run only the LLM post-processing step on pre-extracted OCR text
    llm_results = pipeline.post_processor.postprocess(
        ocr_results=request.ocr_results,
        custom_prompt=request.custom_prompt
    )
    return llm_results
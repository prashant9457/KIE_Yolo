"""HTTP validation and transport; inference is delegated to services."""
import logging
import cv2
import numpy as np
from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from starlette.concurrency import run_in_threadpool
from app.config import MAX_IMAGE_PIXELS, MAX_UPLOAD_BYTES
from app.schemas import ExtractionResult, LLMResult, PostProcessRequest

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get('/')
def root():
    return {'message': 'Ingredient Extraction API'}

@router.get('/health')
def health():
    return {'status': 'healthy'}

@router.post('/extract', response_model=ExtractionResult)
async def extract_ingredients(
    request: Request,
    file: UploadFile = File(...),
    confidence: float = Form(0.45, ge=0.1, le=0.9),
    custom_prompt: str | None = Form(None, max_length=10000),
):
    try:
        contents = await file.read(MAX_UPLOAD_BYTES + 1)
    finally:
        await file.close()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, 'Image must be 10 MB or smaller.')
    if not contents:
        raise HTTPException(400, 'Image is empty.')
    try:
        image = await run_in_threadpool(cv2.imdecode, np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)
    except cv2.error:
        raise HTTPException(400, 'Invalid image data.')
    if image is None:
        raise HTTPException(400, 'Invalid image. Upload a PNG or JPEG image.')
    if image.shape[0] * image.shape[1] > MAX_IMAGE_PIXELS:
        raise HTTPException(413, 'Image must contain at most 25 million pixels.')
    try:
        return await run_in_threadpool(request.app.state.pipeline.extract, image, confidence, custom_prompt)
    except Exception:
        logger.exception('Image extraction failed')
        raise HTTPException(503, 'Extraction unavailable. Check server configuration and model dependencies.')

@router.post('/postprocess', response_model=LLMResult)
def postprocess_ocr(request: Request, body: PostProcessRequest):
    try:
        return request.app.state.pipeline.postprocess(
            [region.model_dump() for region in body.ocr_results], body.custom_prompt
        )
    except Exception:
        logger.exception('Post-processing failed')
        raise HTTPException(503, 'Post-processing unavailable. Check server configuration.')

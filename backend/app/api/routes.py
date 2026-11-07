"""HTTP validation and transport; inference is delegated to services."""
import logging
from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from starlette.concurrency import run_in_threadpool
from app.config import MAX_UPLOAD_BYTES
from app.images import decode_image, InvalidImage, ImageTooLarge
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
        image = await run_in_threadpool(decode_image, contents)
    except ImageTooLarge as exc:
        raise HTTPException(413, str(exc)) from exc
    except InvalidImage as exc:
        raise HTTPException(400, str(exc)) from exc
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

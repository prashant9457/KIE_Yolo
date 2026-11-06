"""Public API contracts, independent of inference libraries."""
from typing import Annotated, Any
from pydantic import BaseModel, Field

class OCRRegion(BaseModel):
    box_id: int = Field(ge=0)
    bbox: tuple[int, int, int, int]
    text: str
    confidence: float = Field(default=1.0, ge=0, le=1)
    class_id: int = Field(default=0, ge=0)

class PostProcessRequest(BaseModel):
    ocr_results: Annotated[list[OCRRegion], Field(max_length=500)]
    custom_prompt: str | None = Field(default=None, max_length=10000)

class LLMResult(BaseModel):
    model: str
    raw_response: str = ''
    structured: dict[str, Any] = Field(default_factory=dict)
    error: str | None = None

class ExtractionResult(BaseModel):
    detected_regions: list[OCRRegion]
    llm_post_process: LLMResult

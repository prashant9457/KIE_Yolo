"""Public API contracts, independent of inference libraries."""
from typing import Annotated, Any
from pydantic import BaseModel, Field, field_validator

Coordinate = Annotated[int, Field(ge=0)]
IngredientName = Annotated[str, Field(strict=True, min_length=1)]

class IngredientTranslations(BaseModel):
    en: list[IngredientName]
    hi: list[IngredientName]
    es: list[IngredientName]
    fr: list[IngredientName]
    de: list[IngredientName]
    ar: list[IngredientName]

class IngredientOutput(BaseModel):
    """Validated output for the default ingredient extraction task."""

    ingredients: list[Annotated[str, Field(strict=True, min_length=1)]]
    postprocessed_corrected_text: str
    error: str | None = None
    translations: IngredientTranslations = Field(description='Required translations of every ingredient in English, Hindi, Spanish, French, German and Arabic, in the original ingredient order.')

    @field_validator('translations')
    @classmethod
    def validate_translations(cls, value, info):
        count = len(info.data.get('ingredients', []))
        for names in value.model_dump().values():
            if len(names) != count:
                raise ValueError('Translations must match ingredient count and order.')
        return value

class OCRRegion(BaseModel):
    box_id: int = Field(ge=0)
    bbox: tuple[Coordinate, Coordinate, Coordinate, Coordinate]
    text: str = Field(max_length=50000)
    confidence: float = Field(default=1.0, ge=0, le=1)
    class_id: int = Field(default=0, ge=0)

    @field_validator('bbox')
    @classmethod
    def validate_bbox(cls, bbox):
        x1, y1, x2, y2 = bbox
        if x2 <= x1 or y2 <= y1:
            raise ValueError('Bounding box must have positive width and height.')
        return bbox

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

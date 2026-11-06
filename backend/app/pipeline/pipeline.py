import torch  # Critical: Import torch first on Windows to resolve DLL loading conflicts with paddlepaddle
import numpy as np

from app.pipeline.detector import IngredientDetector
from app.pipeline.ocr import IngredientOCR
from app.pipeline.postprocessor import IngredientPostProcessor


class IngredientPipeline:

    def __init__(self):
        self.detector = IngredientDetector()
        self.ocr = IngredientOCR()
        self.post_processor = IngredientPostProcessor()

        print("✅ Ingredient Pipeline Initialized with YOLO + PaddleOCR + GroqLLM")

    def process_image(self, image_input: np.ndarray, confidence: float = 0.45, custom_prompt: str = None):
        # 1. Run YOLO object detection directly on the in-memory numpy array
        detections = self.detector.detect(image_input, conf=confidence)

        # 2. Crop detected boxes and run PaddleOCR directly on the in-memory numpy array
        ocr_results = self.ocr.extract_text(image_input, detections)

        # 3. Refine the OCR text with the configured Groq model
        llm_results = self.post_processor.postprocess(ocr_results, custom_prompt=custom_prompt)

        # 4. Return clean, simple JSON containing only the detected regions (bbox & text) and LLM results
        return {
            "detected_regions": ocr_results,
            "llm_post_process": llm_results
        }
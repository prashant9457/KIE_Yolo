"""Lazy model lifecycle and serialized access to shared inference objects."""
from threading import Lock

class PipelineService:
    def __init__(self, factory=None):
        self._factory = factory
        self._pipeline = None
        self._post_processor = None
        self._lock = Lock()

    def _get_pipeline(self):
        if self._pipeline is None:
            if self._factory is None:
                from app.pipeline.pipeline import IngredientPipeline
                self._factory = IngredientPipeline
            self._pipeline = self._factory()
        return self._pipeline

    def extract(self, image, confidence, prompt):
        with self._lock:
            return self._get_pipeline().process_image(image, confidence, prompt)

    def postprocess(self, regions, prompt):
        with self._lock:
            if self._post_processor is None:
                from app.pipeline.postprocessor import IngredientPostProcessor
                self._post_processor = IngredientPostProcessor()
            return self._post_processor.postprocess(regions, prompt)

"""Lazy model lifecycle and serialized access to shared inference objects."""
from threading import Lock


class PipelineService:
    def __init__(self, pipeline_factory=None, postprocessor_factory=None):
        self._pipeline_factory = pipeline_factory
        self._postprocessor_factory = postprocessor_factory
        self._pipeline = None
        self._post_processor = None
        self._lock = Lock()

    def _get_post_processor(self):
        if self._post_processor is None:
            factory = self._postprocessor_factory
            if factory is None:
                from app.pipeline.postprocessor import IngredientPostProcessor
                factory = IngredientPostProcessor
            self._post_processor = factory()
        return self._post_processor

    def _get_pipeline(self):
        if self._pipeline is None:
            factory = self._pipeline_factory
            if factory is None:
                from app.pipeline.pipeline import IngredientPipeline
                factory = IngredientPipeline
            self._pipeline = factory(post_processor=self._get_post_processor())
        return self._pipeline

    def extract(self, image, confidence, prompt):
        with self._lock:
            return self._get_pipeline().process_image(image, confidence, prompt)

    def postprocess(self, regions, prompt):
        with self._lock:
            return self._get_post_processor().postprocess(regions, prompt)

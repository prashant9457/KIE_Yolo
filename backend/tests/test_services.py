import unittest
from unittest.mock import Mock
from app.services import PipelineService


class ServiceTests(unittest.TestCase):
    def test_postprocessing_does_not_initialize_vision_models(self):
        processor = Mock()
        pipeline_factory = Mock()
        service = PipelineService(pipeline_factory, Mock(return_value=processor))
        service.postprocess([], 'ingredients')
        pipeline_factory.assert_not_called()
        processor.postprocess.assert_called_once_with([], 'ingredients')

    def test_extraction_and_custom_analysis_share_a_single_processor(self):
        processor = Mock()
        processor_factory = Mock(return_value=processor)
        pipeline_factory = Mock()
        service = PipelineService(pipeline_factory, processor_factory)
        service.extract('image', 0.5, None)
        service.postprocess([], 'ingredients')
        service.extract('second-image', 0.7, None)
        processor_factory.assert_called_once()
        pipeline_factory.assert_called_once_with(post_processor=processor)

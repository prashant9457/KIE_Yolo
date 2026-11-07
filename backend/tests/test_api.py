"""Regression tests run without model downloads or external API calls."""
import unittest
from unittest.mock import Mock, patch
import cv2
import numpy as np
from fastapi.testclient import TestClient
from app.main import app

class APITests(unittest.TestCase):
    def setUp(self):
        self.original = app.state.pipeline
        self.service = Mock()
        app.state.pipeline = self.service
        self.client = TestClient(app)
        self.image = cv2.imencode('.png', np.zeros((8, 8, 3), dtype=np.uint8))[1].tobytes()
        self.result = {'detected_regions': [{'box_id': 0, 'bbox': [0, 0, 8, 8],
            'text': 'salt', 'confidence': 0.82, 'class_id': 1}],
            'llm_post_process': {'model': 'test', 'structured': {'text': 'salt'}}}
        self.service.extract.return_value = self.result

    def tearDown(self):
        app.state.pipeline = self.original

    def test_health_does_not_load_models(self):
        self.assertEqual(self.client.get('/health').status_code, 200)
        self.service.extract.assert_not_called()

    def test_confidence_and_metadata_roundtrip(self):
        response = self.client.post('/extract', files={'file': ('x.png', self.image)},
                                    data={'confidence': '0.65', 'custom_prompt': 'ingredients'})
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(self.service.extract.call_args.args[1:], (0.65, 'ingredients'))
        self.assertEqual(response.json()['detected_regions'][0]['confidence'], 0.82)
        self.assertEqual(response.json()['detected_regions'][0]['class_id'], 1)

    def test_invalid_and_empty_images(self):
        for data in (b'', b'not an image'):
            response = self.client.post('/extract', files={'file': ('x.png', data)})
            self.assertEqual(response.status_code, 400)
        self.service.extract.assert_not_called()

    def test_upload_limit(self):
        with patch('app.api.routes.MAX_UPLOAD_BYTES', 4):
            response = self.client.post('/extract', files={'file': ('x.png', b'12345')})
        self.assertEqual(response.status_code, 413)

    def test_confidence_validation(self):
        response = self.client.post('/extract', files={'file': ('x.png', self.image)}, data={'confidence': 2})
        self.assertEqual(response.status_code, 422)

    def test_postprocess_validates_regions(self):
        response = self.client.post('/postprocess', json={'ocr_results': [{'text': 'salt'}]})
        self.assertEqual(response.status_code, 422)
        self.service.postprocess.assert_not_called()

    def test_invalid_bounding_boxes_are_rejected(self):
        for bbox in ([-1, 0, 2, 2], [2, 2, 1, 1], [0, 0, 0, 1]):
            response = self.client.post('/postprocess', json={'ocr_results': [
                {'box_id': 0, 'bbox': bbox, 'text': 'salt'}]})
            self.assertEqual(response.status_code, 422)
        self.service.postprocess.assert_not_called()

    def test_internal_errors_are_not_exposed(self):
        self.service.extract.side_effect = RuntimeError('private configuration')
        with self.assertLogs('app.api.routes', level='ERROR'):
            response = self.client.post('/extract', files={'file': ('x.png', self.image)})
        self.assertEqual(response.status_code, 503)
        self.assertNotIn('private configuration', response.text)

if __name__ == '__main__':
    unittest.main()

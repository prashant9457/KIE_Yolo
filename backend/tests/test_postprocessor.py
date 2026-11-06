import unittest
from unittest.mock import Mock, MagicMock, patch
from app.pipeline.postprocessor import IngredientPostProcessor

class PostProcessorTests(unittest.TestCase):
    def test_empty_ocr_skips_provider(self):
        client = Mock()
        result = IngredientPostProcessor(client).postprocess([])
        self.assertIsNotNone(result['error'])
        client.chat.completions.create.assert_not_called()

    def test_response_and_prompt_boundary(self):
        client = MagicMock()
        client.chat.completions.create.return_value.choices[0].message.content = '{"text":"salt"}'
        result = IngredientPostProcessor(client).postprocess(
            [{'box_id': 0, 'bbox': [0, 0, 1, 1], 'text': 'salt'}], 'Return ingredients')
        self.assertEqual(result['structured'], {'text': 'salt'})
        self.assertIsNone(result['error'])
        call = client.chat.completions.create.call_args.kwargs
        self.assertIn('JSON', call['messages'][0]['content'])
        self.assertIn('"box_number": 1', call['messages'][1]['content'])

    def test_provider_failure_preserves_result_contract(self):
        client = Mock()
        client.chat.completions.create.side_effect = RuntimeError('secret')
        with self.assertLogs('app.pipeline.postprocessor', level='ERROR'):
            result = IngredientPostProcessor(client).postprocess([{'box_id': 0, 'bbox': [0,0,1,1], 'text': 'salt'}])
        self.assertTrue(result['error'])
        self.assertNotIn('secret', result['error'])

    def test_missing_key_is_partial_failure(self):
        with patch.dict('os.environ', {'GROQ_API_KEY': ''}):
            result = IngredientPostProcessor().postprocess([{'box_id': 0, 'bbox': [0,0,1,1], 'text': 'salt'}])
        self.assertIn('not configured', result['error'])

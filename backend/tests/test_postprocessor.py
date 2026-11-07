import unittest
from unittest.mock import Mock, MagicMock, patch
from app.pipeline.postprocessor import IngredientPostProcessor
import httpx
from groq import PermissionDeniedError

class PostProcessorTests(unittest.TestCase):
    def test_project_permission_failure_has_actionable_message(self):
        client = Mock()
        response = httpx.Response(403, request=httpx.Request('POST', 'https://api.groq.com/openai/v1/chat/completions'))
        client.chat.completions.create.side_effect = PermissionDeniedError(
            'blocked', response=response,
            body={'error': {'code': 'model_permission_blocked_project', 'message': 'private provider details'}},
        )
        with self.assertLogs('app.pipeline.postprocessor', level='WARNING'):
            result = IngredientPostProcessor(client).postprocess(
                [{'box_id': 0, 'bbox': [0, 0, 1, 1], 'text': 'salt'}])
        self.assertIn('403', result['error'])
        self.assertIn('https://console.groq.com/settings/project/limits', result['error'])
        self.assertNotIn('private provider details', result['error'])

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

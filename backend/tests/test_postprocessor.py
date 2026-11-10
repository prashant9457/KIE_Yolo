import unittest
import json
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
        client.chat.completions.create.return_value = self.completion('{"text":"salt"}')
        result = IngredientPostProcessor(client).postprocess(
            [{'box_id': 0, 'bbox': [0, 0, 1, 1], 'text': 'salt'}], 'Return ingredients')
        self.assertEqual(result['structured'], {'text': 'salt'})
        self.assertIsNone(result['error'])
        call = client.chat.completions.create.call_args.kwargs
        self.assertIn('JSON', call['messages'][0]['content'])
        self.assertIn('"box_number": 1', call['messages'][1]['content'])

    @staticmethod
    def completion(content):
        return {
            'choices': [{'message': {'role': 'assistant', 'content': content}, 'finish_reason': 'stop'}],
            'model': 'test-model',
        }

    def test_default_output_is_validated(self):
        client = Mock()
        client.chat.completions.create.return_value = self.completion(
            json.dumps({'ingredients': ['salt'], 'postprocessed_corrected_text': 'Ingredients: salt',
                        'translations': {code: ['salt'] for code in ['en', 'hi', 'es', 'fr', 'de', 'ar']}}))
        result = IngredientPostProcessor(client).postprocess(
            [{'box_id': 0, 'bbox': [0, 0, 1, 1], 'text': 'salt'}])
        self.assertIsNone(result['error'])
        self.assertEqual(result['structured']['ingredients'], ['salt'])

    def test_invalid_default_outputs_preserve_raw_response(self):
        for raw in ['{"ingredients": [42], "postprocessed_corrected_text": "salt"}',
                    '{"text":"salt"}', '[]', '{"ingredients": ["salt"]']:
            with self.subTest(raw=raw):
                client = Mock()
                client.chat.completions.create.return_value = self.completion(raw)
                result = IngredientPostProcessor(client).postprocess(
                    [{'box_id': 0, 'bbox': [0, 0, 1, 1], 'text': 'salt'}])
                self.assertIn('invalid structured output', result['error'])
                self.assertEqual(result['raw_response'], raw)
                self.assertEqual(result['structured'], {})

    def test_missing_translations_are_retried_and_required(self):
        client = Mock()
        valid = {'ingredients': ['salt'], 'postprocessed_corrected_text': 'Salt',
                 'translations': {code: ['salt'] for code in ['en', 'hi', 'es', 'fr', 'de', 'ar']}}
        client.chat.completions.create.side_effect = [
            self.completion('{"ingredients":["salt"],"postprocessed_corrected_text":"Salt"}'),
            self.completion(json.dumps(valid)),
        ]
        result = IngredientPostProcessor(client).postprocess(
            [{'box_id': 0, 'bbox': [0, 0, 1, 1], 'text': 'salt'}])
        self.assertIsNone(result['error'])
        self.assertEqual(set(result['structured']['translations']), {'en', 'hi', 'es', 'fr', 'de', 'ar'})
        self.assertEqual(client.chat.completions.create.call_count, 2)

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

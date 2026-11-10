import unittest
from pydantic import ValidationError
from app.schemas import IngredientOutput


class TranslationTests(unittest.TestCase):
    def test_native_script_and_order_are_preserved(self):
        output = IngredientOutput(
            ingredients=['salt', 'sugar'],
            postprocessed_corrected_text='Salt, sugar',
            translations={**{code: ['salt', 'sugar'] for code in ['en', 'hi', 'es', 'fr', 'de', 'ar']}, 'hi': ['नमक', 'चीनी'], 'es': ['sal', 'azúcar']},
        )
        self.assertEqual(output.translations.hi, ['नमक', 'चीनी'])

    def test_incomplete_or_invalid_translations_are_rejected(self):
        complete = {code: ['salt', 'sugar'] for code in ['en', 'hi', 'es', 'fr', 'de', 'ar']}
        for translations in [{}, {'hi': ['नमक']}, {**complete, 'hi': ['नमक']}, {**complete, 'hi': [1, 2]}]:
            with self.subTest(translations=translations), self.assertRaises(ValidationError):
                IngredientOutput(
                    ingredients=['salt', 'sugar'],
                    postprocessed_corrected_text='Salt, sugar',
                    translations=translations,
                )

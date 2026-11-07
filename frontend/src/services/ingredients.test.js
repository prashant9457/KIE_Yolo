import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getIngredientSummary } from './ingredients.js';

test('ingredient array preserves order and nested groups', () => {
  assert.deepEqual(
    getIngredientSummary({
      ingredients: ['wheat flour', 'seasoning (salt, pepper)'],
    }).ingredients,
    ['wheat flour', 'seasoning (salt, pepper)'],
  );
});
test('legacy corrected text remains readable without guessing a split', () => {
  assert.deepEqual(
    getIngredientSummary({
      postprocessed_corrected_text: 'Sugar, chocolate (cocoa, butter)',
    }),
    { ingredients: [], text: 'Sugar, chocolate (cocoa, butter)' },
  );
});
test('empty or unsupported provider output does not invent ingredients', () => {
  assert.deepEqual(getIngredientSummary(null), { ingredients: [], text: '' });
  assert.deepEqual(getIngredientSummary({ ingredients: [null, {}, 4] }).ingredients, []);
});

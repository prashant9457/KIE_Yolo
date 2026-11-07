import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getResponseView } from './responseView.js';

test('custom responses never replace the original ingredient export', () => {
  const results = {
    json: { llm_post_process: { structured: { ingredients: ['salt'] } } },
  };
  const custom = { structured: { allergens: ['milk'] } };
  assert.equal(getResponseView('ingredients', results, custom).content, 'salt');
  assert.equal(getResponseView('custom', results, custom).response, custom);
});
test('missing or failed ingredient output cannot be exported as success', () => {
  assert.equal(getResponseView('api', null, null).canExport, false);
  assert.equal(
    getResponseView(
      'ingredients',
      {
        json: {
          llm_post_process: { error: 'Provider failed', structured: {} },
        },
      },
      null,
    ).canExport,
    false,
  );
});

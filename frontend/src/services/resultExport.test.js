import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getResultExport } from './resultExport.js';

const result = {
  json: {
    llm_post_process: { structured: { ingredients: ['salt'], translations: { hi: ['नमक'] } } },
  },
};

test('ingredient exports use the selected language and preserve Unicode', () => {
  const exported = getResultExport('ingredients', result, null, 'hi');
  assert.equal(exported.content, 'नमक');
  assert.equal(exported.filename, 'ingredients-hi.txt');
  assert.equal(exported.canExport, true);
});

test('missing translations cannot be exported under the selected language', () => {
  const exported = getResultExport('ingredients', result, null, 'fr');
  assert.equal(exported.content, '');
  assert.equal(exported.canExport, false);
});

test('chat exports contain a readable conversation instead of provider JSON', () => {
  const exported = getResultExport('custom', result, null, 'original', [
    { role: 'user', text: 'What is listed?' },
    { role: 'assistant', text: 'Salt.' },
  ]);
  assert.equal(exported.content, 'You: What is listed?\n\nAssistant: Salt.');
  assert.equal(exported.mime, 'text/plain');
  assert.equal(exported.canExport, true);
});

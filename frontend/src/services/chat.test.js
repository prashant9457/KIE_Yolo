import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildChatPrompt, getAssistantMessage } from './chat.js';
import { getTranslatedIngredients, hasCompleteTranslations } from './translations.js';

test('long chat context stays within the API limit even with escaped text', () => {
  const question = '\\"'.repeat(2000);
  const messages = Array.from({ length: 20 }, () => ({ role: 'assistant', text: question }));
  const prompt = buildChatPrompt(messages, question);
  assert.ok(prompt.length <= 10000);
  const conversation = JSON.parse(prompt.slice(prompt.indexOf('[{"')));
  assert.equal(conversation.at(-1).text, question);
});

test('provider failures and malformed replies are readable chat errors', () => {
  assert.equal(getAssistantMessage({ error: 'Try again.' }).text, 'Try again.');
  assert.equal(getAssistantMessage({ structured: { unsupported: true } }).error, true);
});

test('translation validation rejects incomplete arrays and invalid names', () => {
  const structured = { ingredients: ['salt'], translations: { hi: ['नमक'], fr: [] } };
  assert.deepEqual(getTranslatedIngredients(structured, 'hi'), ['नमक']);
  assert.equal(getTranslatedIngredients(structured, 'fr'), null);
  assert.equal(hasCompleteTranslations(structured), false);
});

import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { drawDetectionsOnCanvas } from './annotations.js';

const originalImage = globalThis.Image;
const originalDocument = globalThis.document;
afterEach(() => {
  globalThis.Image = originalImage;
  globalThis.document = originalDocument;
});

test('canvas allocation errors preserve successful extraction', async () => {
  let image;
  globalThis.Image = class {
    constructor() {
      image = this;
    }
  };
  globalThis.document = {
    createElement() {
      throw new Error('Canvas allocation failed');
    },
  };
  const result = drawDetectionsOnCanvas('source-image', []);
  image.onload();
  assert.equal(await result, 'source-image');
});
test('cancelling annotation loading rejects and removes callbacks', async () => {
  let image;
  globalThis.Image = class {
    constructor() {
      image = this;
    }
  };
  const controller = new AbortController();
  const result = drawDetectionsOnCanvas('source-image', [], controller.signal);
  controller.abort();
  await assert.rejects(result, { name: 'AbortError' });
  assert.equal(image.onload, null);
  assert.equal(image.onerror, null);
});

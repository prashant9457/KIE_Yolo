import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { postprocessOCR } from './api.js';
import { runExtraction } from './extraction.js';

const originalFetch = globalThis.fetch;
const originalImage = globalThis.Image;
afterEach(() => {
  globalThis.fetch = originalFetch;
  globalThis.Image = originalImage;
});

// Exercise the fallback annotation path without a browser canvas.
function mockImage() {
  globalThis.Image = class {
    set src(value) {
      queueMicrotask(() => this.onerror());
    }
  };
}

test('extraction sends threshold and cancellation, retaining actual metadata', async () => {
  mockImage();
  const signal = new AbortController().signal;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/extract');
    assert.equal(options.body.get('confidence'), '0.65');
    assert.equal(options.signal, signal);
    return Response.json({
      detected_regions: [{ box_id: 0, bbox: [0, 0, 4, 4], confidence: 0.83, class_id: 1 }],
      llm_post_process: { model: 'test', structured: {} },
    });
  };
  const result = await runExtraction('data:image/png;base64,AA==', 0.65, signal);
  assert.equal(result.boxes[0].confidence, 0.83);
  assert.equal(result.boxes[0].id, 1);
});

test('server validation messages reach the caller', async () => {
  globalThis.fetch = async () => Response.json({ detail: 'Invalid image' }, { status: 400 });
  await assert.rejects(runExtraction('data:image/png;base64,AA=='), /Invalid image/);
});

test('postprocessing propagates cancellation and request content', async () => {
  const signal = new AbortController().signal;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/postprocess');
    assert.equal(options.signal, signal);
    assert.deepEqual(JSON.parse(options.body), {
      ocr_results: [],
      custom_prompt: 'ingredients',
    });
    return Response.json({ model: 'test', structured: {} });
  };
  assert.equal((await postprocessOCR([], 'ingredients', signal)).model, 'test');
});

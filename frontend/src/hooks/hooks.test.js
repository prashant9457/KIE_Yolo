import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { useExtraction } from './useExtraction.js';
import { usePipelinePlayback } from './usePipelinePlayback.js';
import { createServer } from 'vite';

let root, window, hook, time, frames;
let descriptors;
const globalKeys = [
  'window',
  'document',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'performance',
  'fetch',
  'Image',
  'FileReader',
  'IS_REACT_ACT_ENVIRONMENT',
];
beforeEach(() => {
  descriptors = new Map(
    globalKeys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  window = new JSDOM('<div id="root"></div>', { url: 'http://localhost' }).window;
  window.matchMedia = () => ({ matches: false });
  Object.defineProperty(window.document, 'hidden', { value: false, configurable: true });
  time = 0;
  frames = new Map();
  let nextId = 0;
  Object.assign(globalThis, {
    window,
    document: window.document,
    IS_REACT_ACT_ENVIRONMENT: true,
    requestAnimationFrame: (callback) => {
      frames.set(++nextId, callback);
      return nextId;
    },
    cancelAnimationFrame: (id) => frames.delete(id),
  });
  Object.defineProperty(globalThis, 'performance', {
    configurable: true,
    value: {
      now: () => time,
      measure: () => {},
      mark: () => {},
      clearMarks: () => {},
      clearMeasures: () => {},
    },
  });
  root = createRoot(document.getElementById('root'));
});
afterEach(async () => {
  await act(() => root.unmount());
  window.close();
  for (const [key, descriptor] of descriptors) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
});
async function render(useHook) {
  function Probe() {
    hook = useHook();
    return null;
  }
  await act(() => root.render(createElement(Probe)));
}
async function advance(ms) {
  time += ms;
  const pending = [...frames.values()];
  frames.clear();
  await act(() => pending.forEach((callback) => callback(time)));
}
const extraction = {
  detected_regions: [
    { box_id: 0, bbox: [0, 0, 10, 10], text: 'salt', confidence: 0.9, class_id: 0 },
  ],
  llm_post_process: { structured: { ingredients: ['salt'] }, model: 'test' },
};
function mockImage() {
  globalThis.Image = class {
    set src(value) {
      if (value) queueMicrotask(() => this.onerror?.());
    }
  };
}

test('reset during extraction aborts the request and ignores late results', async () => {
  let resolve, signal;
  globalThis.fetch = (_url, options) => {
    signal = options.signal;
    return new Promise((done) => {
      resolve = done;
    });
  };
  await render(useExtraction);
  await act(() => hook.handleImageSelected('data:image/png;base64,AA=='));
  let pending;
  act(() => {
    pending = hook.handleExtract();
  });
  assert.equal(hook.isLoading, true);
  await act(() => hook.handleReset());
  assert.equal(signal.aborted, true);
  await act(async () => {
    resolve(Response.json(extraction));
    await pending;
  });
  assert.equal(hook.results, null);
  assert.equal(hook.image, null);
  assert.equal(hook.error, '');
});
test('custom prompts preserve initial ingredients and image replacement clears responses', async () => {
  mockImage();
  globalThis.fetch = async (url) =>
    Response.json(
      url === '/extract' ? extraction : { model: 'test', structured: { allergens: [] } },
    );
  await render(useExtraction);
  await act(() => hook.handleImageSelected('data:image/png;base64,AA==', { name: 'first.png' }));
  await act(() => hook.handleExtract());
  const original = hook.results;
  await act(() => hook.handlePostProcess());
  assert.equal(hook.results, original);
  assert.deepEqual(hook.customResult.structured, { allergens: [] });
  await act(() => hook.handleImageSelected('data:image/png;base64,AQ==', { name: 'second.png' }));
  assert.equal(hook.results, null);
  assert.equal(hook.customResult, null);
  assert.equal(hook.file.name, 'second.png');
});
test('walkthrough pauses, skips with a fresh timer, and loops', async () => {
  await render(() => usePipelinePlayback(2, 500));
  await advance(250);
  await act(() => hook.togglePlaying());
  await advance(250);
  assert.equal(hook.selected, 0);
  await act(() => hook.skip(1));
  assert.equal(hook.selected, 1);
  assert.equal(hook.playing, true);
  await advance(250);
  assert.equal(hook.selected, 1);
  await advance(250);
  assert.equal(hook.selected, 0);
});
test('reduced-motion starts paused and a single step can keep playing', async () => {
  window.matchMedia = () => ({ matches: true });
  await render(() => usePipelinePlayback(1, 250));
  assert.equal(hook.playing, false);
  await act(() => hook.togglePlaying());
  await advance(250);
  assert.equal(hook.selected, 0);
  assert.equal(frames.size, 1);
});

test('home navigation and the full three-panel ingredient flow render correctly', async () => {
  const server = await createServer({ cacheDir: 'node_modules/.vite-tests',
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] }, appType: 'custom' });
  try {
    const { default: App } = await server.ssrLoadModule('/src/app/App.jsx');
    await act(() => root.render(createElement(App)));
    assert.match(document.querySelector('.home-intro').textContent, /See beyond/);
    assert.equal(document.querySelector('.main-shell').hidden, true);
    await act(() => {
      window.location.hash = '#/extract';
      window.dispatchEvent(new window.HashChangeEvent('hashchange'));
    });
    assert.equal(document.querySelector('.home-page'), null);
    assert.equal(document.querySelector('.main-shell').hidden, false);
    assert.equal(document.querySelectorAll('.workspace > .panel').length, 3);
    assert.equal(document.querySelector('.primary-button').disabled, true);
    globalThis.FileReader = class {
      readAsDataURL() {
        this.readyState = 2;
        this.result = 'data:image/png;base64,AA==';
        queueMicrotask(() => this.onload?.());
      }
    };
    globalThis.Image = class {
      naturalWidth = 16;
      naturalHeight = 16;
      set src(value) {
        if (value) queueMicrotask(() => this.onload?.());
      }
    };
    window.HTMLCanvasElement.prototype.getContext = () => null;
    globalThis.fetch = async () => Response.json(extraction);
    const input = document.querySelector('input[type="file"]');
    Object.defineProperty(input, 'files', {
      value: [{ name: 'label.png', type: 'image/png', size: 1024 }],
    });
    await act(() => input.dispatchEvent(new window.Event('change', { bubbles: true })));
    assert.equal(document.querySelector('.primary-button').disabled, false);
    await act(() => document.querySelector('.primary-button').click());
    assert.match(document.querySelector('.ingredient-list').textContent, /salt/);
    assert.equal(
      document.querySelector('.labelled-canvas img').getAttribute('src'),
      'data:image/png;base64,AA==',
    );
    assert.equal(document.querySelectorAll('.ocr-region').length, 0);
    await act(() => {
      window.location.hash = '#/';
      window.dispatchEvent(new window.HashChangeEvent('hashchange'));
    });
    assert.equal(document.querySelector('.main-shell').hidden, true);
    assert.match(document.querySelector('.ingredient-list').textContent, /salt/);
  } finally {
    await server.close();
  }
});

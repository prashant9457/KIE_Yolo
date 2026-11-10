import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { useExtraction } from './useExtraction.js';
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
  'ResizeObserver',
  'getComputedStyle',
  'Element',
  'HTMLElement',
  'SVGElement',
  'NodeList',
  'CSS',
];
beforeEach(() => {
  descriptors = new Map(
    globalKeys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  window = new JSDOM('<div id="root"></div>', { url: 'http://localhost' }).window;
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  Object.defineProperty(window.document, 'hidden', { value: false, configurable: true });
  time = 0;
  frames = new Map();
  let nextId = 0;
  Object.assign(globalThis, {
    window,
    ResizeObserver: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
    getComputedStyle: window.getComputedStyle.bind(window),
    Element: window.Element,
    HTMLElement: window.HTMLElement,
    SVGElement: window.SVGElement,
    NodeList: window.NodeList,
    CSS: { supports: () => false },
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
const extraction = {
  detected_regions: [
    { box_id: 0, bbox: [0, 0, 10, 10], text: 'salt', confidence: 0.9, class_id: 0 },
  ],
  llm_post_process: {
    structured: { ingredients: ['salt'], translations: { hi: ['नमक'], es: ['sal'] } },
    model: 'test',
  },
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
test('home navigation and upload-first ingredient flow render correctly', async () => {
  const server = await createServer({
    cacheDir: 'node_modules/.vite-tests',
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
    appType: 'custom',
  });
  try {
    const { default: App } = await server.ssrLoadModule('/src/app/App.jsx');
    await act(() => root.render(createElement(App)));
    assert.match(document.querySelector('.home-intro').textContent, /Read the label/);
    assert.equal(document.querySelector('.main-shell').hidden, true);
    await act(() => {
      window.location.hash = '#/extract';
      window.dispatchEvent(new window.HashChangeEvent('hashchange'));
    });
    assert.equal(document.querySelector('.home-page'), null);
    assert.equal(document.querySelector('.main-shell').hidden, false);
    await act(() => document.querySelector('.skip-link').click());
    assert.equal(window.location.hash, '#/extract');
    assert.equal(document.activeElement.id, 'main-content');
    assert.equal(document.querySelectorAll('.workspace > .panel').length, 1);
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
    let finishExtraction;
    globalThis.fetch = () =>
      new Promise((resolve) => {
        finishExtraction = resolve;
      });
    await act(() => document.querySelector('.primary-button').click());
    assert.ok(document.querySelector('.extraction-overlay'));
    assert.equal(document.querySelector('.upload-panel'), null);
    assert.equal(document.querySelector('.results-panel'), null);
    await act(async () => {
      finishExtraction(Response.json(extraction));
    });
    assert.equal(document.querySelector('.extraction-overlay'), null);
    assert.equal(document.querySelector('.upload-panel'), null);
    assert.equal(document.querySelectorAll('.workspace > .panel').length, 1);
    assert.equal(document.querySelector('.labelled-panel'), null);
    assert.match(document.querySelector('.ingredient-list').textContent, /salt/);
    assert.equal(
      document.querySelector('.detection-image img').getAttribute('src'),
      'data:image/png;base64,AA==',
    );
    const productImage = document.querySelector('.detection-image img');
    Object.defineProperties(productImage, {
      naturalWidth: { value: 100 },
      naturalHeight: { value: 100 },
    });
    await act(() => productImage.dispatchEvent(new window.Event('load')));
    assert.equal(document.querySelectorAll('.detection-region rect').length, 1);
    assert.ok(document.querySelector('.drawing-cursor'));
    assert.ok(document.querySelector('[aria-label="Zoom in"]'));
    assert.ok(document.querySelector('[aria-label="Fit image"]'));
    assert.equal(document.querySelectorAll('.ocr-region').length, 0);
    const language = document.querySelector('[role="combobox"]');
    await act(() =>
      language.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })),
    );
    const hindi = [...document.querySelectorAll('[role="option"]')].find((item) =>
      item.textContent.includes('हिन्दी'),
    );
    assert.ok(hindi);
    assert.equal(
      document.querySelector('[role="listbox"]').querySelectorAll('[role="option"]').length,
      7,
    );
    await act(() =>
      language.dispatchEvent(
        new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      ),
    );
    await act(() =>
      language.dispatchEvent(
        new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      ),
    );
    await act(() =>
      language.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })),
    );
    assert.match(document.querySelector('.ingredient-list').textContent, /नमक/);
    const chatbot = [...document.querySelectorAll('.results-panel [role="tab"]')].find((item) =>
      item.textContent.includes('AI chatbot'),
    );
    await act(() =>
      document
        .querySelector('.results-panel [role="tab"]')
        .dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })),
    );
    assert.equal(chatbot.getAttribute('aria-selected'), 'true');
    assert.ok(document.querySelector('.prompt-bar textarea'));
    assert.equal(document.querySelector('[aria-label="Add files and sources"]'), null);
    globalThis.fetch = async () =>
      Response.json({ model: 'test', structured: { answer: 'Salt is listed.' } });
    await act(() => document.querySelector('.chat-suggestions button').click());
    assert.equal(document.querySelector('.chat-user').getAttribute('aria-label'), 'Your message');
    assert.equal(
      document.querySelector('.chat-assistant').getAttribute('aria-label'),
      'Assistant reply',
    );
    assert.match(document.querySelector('.chat-assistant').textContent, /Salt is listed/);
    await act(() =>
      [...document.querySelectorAll('.results-panel [role="tab"]')]
        .find((item) => item.textContent === 'Ingredients')
        .click(),
    );
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

test('cancelling extraction retains the upload and ignores late results', async () => {
  let complete;
  globalThis.fetch = () =>
    new Promise((resolve) => {
      complete = resolve;
    });
  await render(useExtraction);
  await act(() => hook.handleImageSelected('data:image/png;base64,AA==', { name: 'label.png' }));
  let pending;
  act(() => {
    pending = hook.handleExtract();
  });
  await act(() => hook.handleCancel());
  assert.equal(hook.image, 'data:image/png;base64,AA==');
  assert.equal(hook.file.name, 'label.png');
  assert.equal(hook.isLoading, false);
  await act(async () => {
    complete(Response.json(extraction));
    await pending;
  });
  assert.equal(hook.results, null);
});

test('chat network errors stay in the conversation without replacing results', async () => {
  mockImage();
  globalThis.fetch = async (url) => {
    if (url === '/extract') return Response.json(extraction);
    throw new Error('Connection unavailable.');
  };
  await render(useExtraction);
  await act(() => hook.handleImageSelected('data:image/png;base64,AA=='));
  await act(() => hook.handleExtract());
  await act(() => hook.handlePostProcess('Which ingredients are listed?'));
  assert.equal(hook.messages.at(-1).error, true);
  assert.equal(hook.messages.at(-1).text, 'Connection unavailable.');
  assert.equal(hook.error, '');
  assert.ok(hook.results);
});

test('chat keeps conversation context and clears it with the image', async () => {
  mockImage();
  const sent = [];
  globalThis.fetch = async (url, options) => {
    if (url === '/extract') return Response.json(extraction);
    sent.push(JSON.parse(options.body).custom_prompt);
    return Response.json({ model: 'test', structured: { answer: 'Salt is listed on the label.' } });
  };
  await render(useExtraction);
  await act(() => hook.handleImageSelected('data:image/png;base64,AA=='));
  await act(() => hook.handleExtract());
  await act(() => hook.handlePostProcess('What is in this label?'));
  assert.equal(hook.messages.length, 2);
  await act(() => hook.handlePostProcess('Explain that ingredient.'));
  assert.match(sent[1], /What is in this label/);
  assert.match(sent[1], /Salt is listed/);
  assert.ok(sent[1].length <= 10000);
  assert.equal(hook.results.json.llm_post_process.structured.ingredients[0], 'salt');
  await act(() => hook.handleReset());
  assert.deepEqual(hook.messages, []);
});

test('existing extraction can fetch missing translations without rerunning detection', async () => {
  mockImage();
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push(url);
    if (url === '/extract') return Response.json(extraction);
    assert.equal(JSON.parse(options.body).custom_prompt, null);
    return Response.json({
      model: 'test',
      structured: {
        ingredients: ['salt'],
        translations: {
          en: ['salt'],
          hi: ['नमक'],
          es: ['sal'],
          fr: ['sel'],
          de: ['Salz'],
          ar: ['ملح'],
        },
      },
    });
  };
  await render(useExtraction);
  await act(() => hook.handleImageSelected('data:image/png;base64,AA=='));
  await act(() => hook.handleExtract());
  const annotatedImage = hook.results.annotatedImage;
  await act(() => hook.handleTranslate());
  assert.deepEqual(calls, ['/extract', '/postprocess']);
  assert.deepEqual(hook.results.json.llm_post_process.structured.translations.hi, ['नमक']);
  assert.equal(hook.results.annotatedImage, annotatedImage);
});

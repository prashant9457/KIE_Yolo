import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { readImageFile } from './imageFiles.js';

const originals = {
  FileReader: globalThis.FileReader,
  Image: globalThis.Image,
};
afterEach(() => Object.assign(globalThis, originals));
function mocks() {
  const handles = {};
  globalThis.FileReader = class {
    constructor() {
      handles.reader = this;
      this.readyState = 0;
    }
    readAsDataURL() {
      this.readyState = 1;
    }
    abort() {
      this.readyState = 2;
      handles.aborted = true;
    }
  };
  globalThis.Image = class {
    constructor() {
      handles.image = this;
    }
  };
  return handles;
}
const file = { name: 'label.png', type: 'image/png', size: 1024 };
function loadFile(handles) {
  handles.reader.result = 'data:image/png;base64,AA==';
  handles.reader.readyState = 2;
  handles.reader.onload();
}

test('selection requires a decodable image and preserves metadata', async () => {
  const handles = mocks();
  const result = readImageFile(file);
  loadFile(handles);
  Object.assign(handles.image, { naturalWidth: 100, naturalHeight: 100 });
  handles.image.onload();
  assert.deepEqual(await result, {
    source: 'data:image/png;base64,AA==',
    file: { name: 'label.png', size: 1024 },
  });
});
test('cancelled selection cannot complete after a reset', async () => {
  const handles = mocks();
  const controller = new AbortController();
  const result = readImageFile(file, controller.signal);
  controller.abort();
  await assert.rejects(result, { name: 'AbortError' });
  assert.equal(handles.aborted, true);
  assert.equal(handles.reader.onload, null);
});
test('corrupt or oversized pixel images are rejected', async () => {
  const handles = mocks();
  let result = readImageFile(file);
  loadFile(handles);
  handles.image.onerror();
  await assert.rejects(result, /not a readable image/);
  result = readImageFile(file);
  loadFile(handles);
  Object.assign(handles.image, { naturalWidth: 10000, naturalHeight: 10000 });
  handles.image.onload();
  await assert.rejects(result, /25 million pixels/);
});

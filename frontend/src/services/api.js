// HTTP transport only. Image preparation and rendering live in extraction.js.
async function requestJSON(url, options) {
  const response = await fetch(url, options);
  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error(
      response.ok
        ? 'The server returned an invalid response.'
        : `Request failed (${response.status}).`,
    );
  }
  if (!response.ok) {
    const detail =
      typeof body.detail === 'string'
        ? body.detail
        : Array.isArray(body.detail)
          ? body.detail.map((item) => item.msg).join('; ')
          : 'Request failed. Please try again.';
    throw new Error(`${detail} (${response.status})`);
  }
  return body;
}

export function extractImage(file, confidence, signal) {
  const data = new FormData();
  data.append('file', file, 'label.png');
  data.append('confidence', String(confidence));
  return requestJSON('/extract', { method: 'POST', body: data, signal });
}

export function postprocessOCR(ocrResults, customPrompt, signal) {
  return requestJSON('/postprocess', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ocr_results: ocrResults,
      custom_prompt: customPrompt,
    }),
  });
}

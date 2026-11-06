import { drawDetectionsOnCanvas } from './annotations.js';

// API service helpers for Ingredient Extraction APP

const dataURLtoBlob = (dataurl) => {
  try {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i += 1) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error("Failed to convert dataURL to Blob:", e);
    return null;
  }
};

export const runOneClickExtraction = async (
  imageSrc,
  confidenceThreshold = 0.45,
  customPrompt = "",
  signal,
) => {
  const blob = dataURLtoBlob(imageSrc);
  if (!blob) {
    throw new Error("Could not parse source image");
  }

  const formData = new FormData();
  formData.append("file", blob, "label.png");
  formData.append("confidence", String(confidenceThreshold));
  if (customPrompt) {
    formData.append("custom_prompt", customPrompt);
  }

  const response = await fetch("/extract", {
    method: "POST",
    body: formData,
    signal,
  });

  await checkResponse(response);

  const backendResult = await response.json();
  if (!Array.isArray(backendResult.detected_regions)) {
    throw new Error(backendResult.message || "Invalid extraction response");
  }
  const detectedRegions = backendResult.detected_regions;
  const boxes = detectedRegions.map(reg => ({
    id: reg.box_id + 1,
    coordinates: reg.bbox,
    confidence: reg.confidence,
    classId: reg.class_id,
    color: reg.class_id === 1 ? '#10b981' : reg.class_id === 2 ? '#f59e0b' : '#3b82f6',
  }));

  const annotatedImage = await drawDetectionsOnCanvas(imageSrc, boxes);

  return {
    annotatedImage,
    boxes,
    json: backendResult,
  };
};

export const runLLMPostProcess = async (ocrResults, customPrompt, signal) => {
  const response = await fetch("/postprocess", {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ocr_results: ocrResults,
      custom_prompt: customPrompt,
    }),
  });

  await checkResponse(response);

  return response.json();
};

async function checkResponse(response) {
  if (response.ok) return;
  const body = await response.json().catch(() => ({}));
  const detail = typeof body.detail === 'string' ? body.detail : 'Request failed. Check the image and try again.';
  throw new Error(`${detail} (${response.status})`);
}

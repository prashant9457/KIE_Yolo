import { extractImage } from './api.js';
import { drawDetectionsOnCanvas } from './annotations.js';

function imageBlob(source) {
  const [header, data] = source.split(',');
  const mime = header.match(/^data:(image\/(?:png|jpeg));base64$/)?.[1];
  if (!mime || !data) throw new Error('Could not read source image. Choose a PNG or JPEG image.');
  try {
    return new Blob([Uint8Array.from(atob(data), (character) => character.charCodeAt(0))], {
      type: mime,
    });
  } catch {
    throw new Error('Could not read source image. Choose another file.');
  }
}

export async function runExtraction(image, confidence, signal) {
  const json = await extractImage(imageBlob(image), confidence, signal);
  if (!Array.isArray(json?.detected_regions) || !json?.llm_post_process) {
    throw new Error('The server returned an incomplete extraction response.');
  }
  const boxes = json.detected_regions.map((region) => ({
    id: region.box_id + 1,
    coordinates: region.bbox,
    confidence: region.confidence,
    classId: region.class_id,
    color: region.class_id === 1 ? '#10b981' : region.class_id === 2 ? '#f59e0b' : '#3b82f6',
  }));
  signal?.throwIfAborted();
  const annotatedImage = await drawDetectionsOnCanvas(image, boxes, signal);
  return { json, boxes, annotatedImage };
}

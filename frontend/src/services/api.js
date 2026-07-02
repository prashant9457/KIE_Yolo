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

const drawDetectionsOnCanvas = (imageSrc, boxesList) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      boxesList.forEach((box) => {
        const [x1, y1, x2, y2] = box.coordinates;
        const color = box.color || "#3b82f6";

        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(2, Math.round(canvas.width * 0.005));
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

        const fontSize = Math.max(10, Math.round(canvas.width * 0.02));
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        const labelText = `BOX_${box.id} (${(box.confidence * 100).toFixed(0)}%)`;
        const textWidth = ctx.measureText(labelText).width;

        ctx.fillStyle = color;
        ctx.fillRect(x1 - 1, y1 - fontSize - 6, textWidth + 12, fontSize + 6);

        ctx.fillStyle = "#ffffff";
        ctx.fillText(labelText, x1 + 5, y1 - 4);
      });

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(imageSrc);
  });
};

export const runOneClickExtraction = async (
  imageSrc,
  confidenceThreshold = 0.45,
  customPrompt = "",
) => {
  const blob = dataURLtoBlob(imageSrc);
  if (!blob) {
    throw new Error("Could not parse source image");
  }

  const formData = new FormData();
  formData.append("file", blob, "label.png");
  if (customPrompt) {
    formData.append("custom_prompt", customPrompt);
  }

  const response = await fetch("/extract", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status} ${response.statusText}`);
  }

  const backendResult = await response.json();
  const detectedRegions = backendResult.detected_regions || [];
  const filteredBoxes = detectedRegions.reduce((acc, reg, index) => {
    const conf = reg.confidence ?? 1.0;
    if (conf >= confidenceThreshold) {
      acc.push({
        id: reg.box_id !== undefined ? reg.box_id + 1 : index + 1,
        coordinates: reg.bbox || reg.bbox_xyxy,
        confidence: conf,
        classId: reg.class_id || 0,
        color:
          reg.class_id === 1
            ? "#10b981"
            : reg.class_id === 2
              ? "#f59e0b"
              : "#3b82f6",
      });
    }
    return acc;
  }, []);

  const annotatedImage = await drawDetectionsOnCanvas(imageSrc, filteredBoxes);

  return {
    annotatedImage,
    boxes: filteredBoxes,
    json: backendResult,
  };
};

export const runLLMPostProcess = async (ocrResults, customPrompt) => {
  const response = await fetch("/postprocess", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ocr_results: ocrResults,
      custom_prompt: customPrompt,
    }),
  });

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

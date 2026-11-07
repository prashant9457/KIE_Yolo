export const drawDetectionsOnCanvas = (imageSrc, boxesList, signal) => {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const finish = (value) => {
      signal?.removeEventListener('abort', abort);
      img.onload = null;
      img.onerror = null;
      resolve(value);
    };
    const abort = () => {
      img.onload = null;
      img.onerror = null;
      img.src = '';
      reject(new DOMException('Request cancelled', 'AbortError'));
    };
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return finish(imageSrc);
        ctx.drawImage(img, 0, 0);

        boxesList.forEach((box) => {
          const [x1, y1, x2, y2] = box.coordinates;
          const color = box.color || '#3b82f6';

          ctx.strokeStyle = color;
          ctx.lineWidth = Math.max(2, Math.round(canvas.width * 0.005));
          ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

          const fontSize = Math.max(10, Math.round(canvas.width * 0.02));
          ctx.font = `bold ${fontSize}px Inter, sans-serif`;
          const labelText = `BOX_${box.id} (${(box.confidence * 100).toFixed(0)}%)`;
          const textWidth = ctx.measureText(labelText).width;

          ctx.fillStyle = color;
          ctx.fillRect(x1 - 1, y1 - fontSize - 6, textWidth + 12, fontSize + 6);

          ctx.fillStyle = '#ffffff';
          ctx.fillText(labelText, x1 + 5, y1 - 4);
        });

        finish(canvas.toDataURL('image/png'));
      } catch {
        // Canvas limits must not discard a successful OCR/provider response.
        finish(imageSrc);
      }
    };
    img.onerror = () => finish(imageSrc);
    signal?.addEventListener('abort', abort, { once: true });
    img.src = imageSrc;
  });
};

export const drawDetectionsOnCanvas = (imageSrc, boxesList) => {
  return new Promise((resolve) => {
    const img = new Image();
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
    img.src = imageSrc;
  });
};


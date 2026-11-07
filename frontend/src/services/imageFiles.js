const MAX_BYTES = 10 * 1024 * 1024;
const MAX_PIXELS = 25_000_000;

export async function readImageFile(file, signal) {
  signal?.throwIfAborted();
  if (!['image/png', 'image/jpeg'].includes(file.type))
    throw new Error('Choose a JPG or PNG image.');
  if (file.size > MAX_BYTES) throw new Error('Choose an image under 10 MB.');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    let image;
    const finish = (error, result) => {
      signal?.removeEventListener('abort', abort);
      reader.onload = null;
      reader.onerror = null;
      if (image) {
        image.onload = null;
        image.onerror = null;
        image.src = '';
      }
      if (reader.readyState === 1) reader.abort();
      if (error) reject(error);
      else resolve(result);
    };
    const abort = () => finish(new DOMException('Image selection cancelled', 'AbortError'));
    signal?.addEventListener('abort', abort, { once: true });
    reader.onerror = () => finish(new Error('Could not read the image. Please try another file.'));
    reader.onload = () => {
      const source = reader.result;
      image = new Image();
      image.onerror = () =>
        finish(new Error('This file is not a readable image. Choose another file.'));
      image.onload = () => {
        if (image.naturalWidth * image.naturalHeight > MAX_PIXELS) {
          return finish(
            new Error('Image must contain at most 25 million pixels. Choose a smaller image.'),
          );
        }
        finish(null, { source, file: { name: file.name, size: file.size } });
      };
      image.src = source;
    };
    reader.readAsDataURL(file);
  });
}

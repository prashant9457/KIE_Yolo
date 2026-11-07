export function downloadUrl(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
}

export function downloadText(content, filename, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  downloadUrl(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

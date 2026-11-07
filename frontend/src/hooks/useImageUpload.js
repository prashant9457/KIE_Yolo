import { useCallback, useEffect, useRef } from 'react';
import { readImageFile } from '../services/imageFiles.js';

export function useImageUpload(onSelect, onError) {
  const pending = useRef(null);
  const cancel = useCallback(() => {
    pending.current?.abort();
    pending.current = null;
  }, []);
  useEffect(() => cancel, [cancel]);

  const selectFile = async (file) => {
    cancel();
    if (!file) return;
    const controller = new AbortController();
    pending.current = controller;
    try {
      const selected = await readImageFile(file, controller.signal);
      if (pending.current !== controller) return;
      pending.current = null;
      onSelect(selected.source, selected.file);
    } catch (error) {
      if (pending.current === controller && error.name !== 'AbortError') onError(error.message);
    } finally {
      if (pending.current === controller) pending.current = null;
    }
  };
  return { selectFile, cancel };
}

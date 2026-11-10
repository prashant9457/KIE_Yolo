import { useEffect, useRef, useState } from 'react';
import { downloadText } from '../utils/download.js';

export function useResultActions(view, copyView = view) {
  const [copyState, setCopyState] = useState('idle');
  const timer = useRef(null);
  useEffect(() => {
    setCopyState('idle');
    return () => clearTimeout(timer.current);
  }, [copyView.content]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyView.content);
      setCopyState('copied');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('error');
    }
  };
  return { copy, copyState, download: () => downloadText(view.content, view.filename, view.mime) };
}

import { useEffect, useRef, useState } from 'react';
import { downloadText } from '../utils/download.js';

export function useResultActions(view) {
  const [copyState, setCopyState] = useState('idle');
  const timer = useRef(null);
  useEffect(() => {
    setCopyState('idle');
    return () => clearTimeout(timer.current);
  }, [view.content]);
  const copyContent = async (content = view.content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyState('copied');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('error');
    }
  };
  return {
    copy: () => copyContent(view.content),
    copyContent,
    copyState,
    download: () => downloadText(view.content, view.filename, view.mime),
  };
}

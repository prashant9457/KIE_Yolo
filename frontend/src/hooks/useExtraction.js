import { useEffect, useRef, useState } from 'react';
import { runExtraction } from '../services/extraction.js';
import { postprocessOCR } from '../services/api.js';
import { downloadUrl } from '../utils/download.js';

const DEFAULT_PROMPT =
  'List the ingredients explicitly present in this label. Return JSON with an ingredients array of names and postprocessed_corrected_text. Preserve label order and nested groups; do not invent ingredients.';

export function useExtraction() {
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [customResult, setCustomResult] = useState(null);
  const [confidence, setConfidence] = useState(0.45);
  const [customPrompt, setCustomPrompt] = useState(DEFAULT_PROMPT);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState('');
  const request = useRef(null);
  useEffect(
    () => () => {
      request.current?.abort();
      request.current = null;
    },
    [],
  );

  const handleImageSelected = (value, metadata = null) => {
    request.current?.abort();
    request.current = null;
    setPending(null);
    setImage(value);
    setFile(metadata);
    setResults(null);
    setCustomResult(null);
    setError('');
  };

  const execute = async (kind, operation, onSuccess) => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setPending(kind);
    setError('');
    try {
      const data = await operation(controller.signal);
      if (request.current === controller) onSuccess(data);
    } catch (err) {
      if (request.current === controller && err.name !== 'AbortError') {
        setError(err.message || 'Request failed. Please try again.');
      }
    } finally {
      if (request.current === controller) {
        request.current = null;
        setPending(null);
      }
    }
  };

  const handleExtract = () =>
    image &&
    execute(
      'extract',
      (signal) => runExtraction(image, confidence, signal),
      (data) => {
        setResults(data);
        setCustomResult(null);
      },
    );
  const handlePostProcess = () =>
    results &&
    execute(
      'llm',
      (signal) => postprocessOCR(results.json.detected_regions, customPrompt, signal),
      (llm) => setCustomResult(llm),
    );

  const handleDownloadImage = () => {
    if (!results?.annotatedImage) return;
    downloadUrl(results.annotatedImage, 'annotated-label.png');
  };

  return {
    image,
    file,
    results,
    customResult,
    confidence,
    setConfidence,
    customPrompt,
    setCustomPrompt,
    error,
    setError,
    handleImageSelected,
    handleExtract,
    handlePostProcess,
    handleDownloadImage,
    handleReset: () => handleImageSelected(null),
    isLoading: pending === 'extract',
    isLLMLoading: pending === 'llm',
  };
}

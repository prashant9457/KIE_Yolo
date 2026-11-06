import { useEffect, useRef, useState } from 'react';
import { runOneClickExtraction, runLLMPostProcess } from '../services/api';

const DEFAULT_PROMPT = 'Find the OCR region that contains the ingredients list. Return a JSON object with box_number, bbox, and postprocessed_corrected_text. Preserve label content; do not invent ingredients.';

export function useExtraction() {
  const [image, setImage] = useState(null);
  const [results, setResults] = useState(null);
  const [confidence, setConfidence] = useState(0.45);
  const [customPrompt, setCustomPrompt] = useState(DEFAULT_PROMPT);
  const [activeTab, setActiveTab] = useState('annotated');
  const [pending, setPending] = useState(null);
  const [error, setError] = useState('');
  const request = useRef(null);
  useEffect(() => () => request.current?.abort(), []);

  const handleImageSelected = (value) => {
    request.current?.abort();
    request.current = null;
    setPending(null);
    setImage(value);
    setResults(null);
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

  const handleExtract = () => image && execute('extract',
    signal => runOneClickExtraction(image, confidence, customPrompt, signal),
    data => { setResults(data); setActiveTab('annotated'); });
  const handlePostProcess = () => results && execute('llm',
    signal => runLLMPostProcess(results.json.detected_regions, customPrompt, signal),
    llm => setResults(previous => ({ ...previous, json: { ...previous.json, llm_post_process: llm } })));

  const handleDownloadImage = () => {
    if (!results?.annotatedImage) return;
    const link = document.createElement('a');
    link.href = results.annotatedImage;
    link.download = 'annotated_label.png';
    link.click();
  };

  return {
    image, results, confidence, setConfidence, customPrompt, setCustomPrompt,
    activeTab, setActiveTab, error, setError, handleImageSelected, handleExtract,
    handlePostProcess, handleDownloadImage, handleReset: () => handleImageSelected(null),
    isLoading: pending === 'extract', isLLMLoading: pending === 'llm',
  };
}

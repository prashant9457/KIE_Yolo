import { useEffect, useRef, useState } from 'react';
import { runExtraction } from '../services/extraction.js';
import { postprocessOCR } from '../services/api.js';
import { downloadUrl } from '../utils/download.js';
import { buildChatPrompt, getAssistantMessage } from '../services/chat.js';
import { hasCompleteTranslations } from '../services/translations.js';

export function useExtraction() {
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [customResult, setCustomResult] = useState(null);
  const [messages, setMessages] = useState([]);
  const [confidence, setConfidence] = useState(0.45);
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
    setMessages([]);
    setError('');
  };

  const execute = async (kind, operation, onSuccess, onFailure) => {
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
        const message = err.message || 'Request failed. Please try again.';
        if (onFailure) onFailure(message);
        else setError(message);
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
        setMessages([]);
      },
    );
  const handlePostProcess = (question = 'Summarize this ingredient label.') => {
    if (!results || request.current || !question.trim()) return;
    setMessages((previous) => [...previous, { role: 'user', text: question }]);
    return execute(
      'llm',
      (signal) =>
        postprocessOCR(results.json.detected_regions, buildChatPrompt(messages, question), signal),
      (llm) => {
        setCustomResult(llm);
        setMessages((previous) => [...previous, getAssistantMessage(llm)]);
      },
      (message) =>
        setMessages((previous) => [...previous, { role: 'assistant', text: message, error: true }]),
    );
  };

  const handleDownloadImage = () => {
    if (!results?.annotatedImage) return;
    downloadUrl(results.annotatedImage, 'annotated-label.png');
  };

  const handleTranslate = () => {
    if (!results || request.current) return;
    return execute(
      'translate',
      (signal) => postprocessOCR(results.json.detected_regions, null, signal),
      (llm) => {
        if (llm.error) {
          setError(llm.error);
          return;
        }
        if (!hasCompleteTranslations(llm.structured)) {
          setError('Some translations are missing. Try generating them again.');
          return;
        }
        setResults((previous) => ({
          ...previous,
          json: { ...previous.json, llm_post_process: llm },
        }));
      },
    );
  };

  const handleCancel = () => {
    request.current?.abort();
    request.current = null;
    setPending(null);
  };

  return {
    image,
    file,
    results,
    customResult,
    messages,
    confidence,
    setConfidence,
    error,
    setError,
    handleImageSelected,
    handleExtract,
    handlePostProcess,
    handleDownloadImage,
    handleTranslate,
    handleCancel,
    isBusy: pending !== null,
    isTranslating: pending === 'translate',
    handleReset: () => handleImageSelected(null),
    isLoading: pending === 'extract',
    isLLMLoading: pending === 'llm',
  };
}

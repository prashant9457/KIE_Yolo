import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { CheckIcon, CopyIcon, DownloadSimpleIcon, CaretDownIcon } from '@phosphor-icons/react';
import Tabs from '../../../components/common/Tabs';
import Button from '../../../components/ui/Button';
import Notice from '../../../components/ui/Notice';
import Surface from '../../../components/ui/Surface';
import { getIngredientSummary } from '../../../services/ingredients';
import { formatResult, getResultExport } from '../../../services/resultExport';
import { useResultActions } from '../../../hooks/useResultActions';
import { downloadText } from '../../../utils/download';
import IngredientList from './IngredientList';
import ChatPanel from './ChatPanel';
import './ResultsPanel.css';

const TABS = [
  { id: 'ingredients', name: 'Ingredients' },
  { id: 'custom', name: 'AI chatbot' },
  { id: 'api', name: 'API response' },
];

export default function ResultsPanel({
  results,
  customResult,
  messages = [],
  isLLMLoading,
  isTranslating,
  onPostProcess,
  onTranslate,
  onCancel,
}) {
  const [tab, setTab] = useState('ingredients');
  const [language, setLanguage] = useState('original');
  const [copyFormat, setCopyFormat] = useState('json');
  const [formatMenuOpen, setFormatMenuOpen] = useState(false);
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);
  const copyMenu = useRef(null);
  const saveMenu = useRef(null);
  const id = useId();
  const contentId = `${id}-content`;
  const result = results?.json.llm_post_process;
  const summary = useMemo(() => getIngredientSummary(result?.structured), [result?.structured]);
  const view = getResultExport(tab, results, customResult, language, messages);
  const copyViews = useMemo(
    () => ({
      json: { ...view, content: formatResult(view, 'json') },
      csv: { ...view, content: formatResult(view, 'csv') },
      txt: { ...view, content: formatResult(view, 'txt') },
    }),
    [view],
  );
  const { copyContent, copyState } = useResultActions(view);
  const busy = Boolean(isLLMLoading || isTranslating);
  useEffect(() => {
    if (!formatMenuOpen) return;
    const closeOnOutsideClick = (event) => {
      if (!copyMenu.current?.contains(event.target)) setFormatMenuOpen(false);
      if (!saveMenu.current?.contains(event.target)) setSaveMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setFormatMenuOpen(false);
      if (event.key === 'Escape') setSaveMenuOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [formatMenuOpen, saveMenuOpen]);
  return (
    <Surface className="results-panel panel" aria-label="Ingredients and label assistant">
      <header className="results-header">
        <h2>Results</h2>
        <span className={`result-status ${result?.error ? 'result-status--error' : ''}`}>
          {result?.error ? 'Needs review' : 'Analysis complete'}
        </span>
      </header>
      <Tabs
        items={TABS}
        value={tab}
        onChange={setTab}
        label="Result view"
        controls={contentId}
        idPrefix={`${id}-tab`}
      />
      <div
        id={contentId}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${tab}`}
        className={`result-content ${tab === 'custom' ? 'chat-content' : ''}`}
        aria-busy={tab === 'custom' ? isLLMLoading : isTranslating}
      >
        {tab === 'ingredients' ? (
          <IngredientList
            summary={summary}
            structured={result?.structured}
            error={result?.error}
            language={language}
            onLanguageChange={setLanguage}
            onTranslate={onTranslate}
            isTranslating={isTranslating}
          />
        ) : tab === 'custom' ? (
          <ChatPanel
            messages={messages}
            pending={isLLMLoading}
            disabled={busy}
            onSend={onPostProcess}
            onCancel={onCancel}
          />
        ) : (
          <div className="api-output">
            {result?.error && <Notice>{result.error}</Notice>}
            <p className="api-caption">Structured extraction output</p>
            <pre className="json-output">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
      {copyState === 'error' && (
        <p className="result-copy-error" role="status">
          Clipboard unavailable. Save the result instead.
        </p>
      )}
      <footer className="result-tools">
        <span className="result-note">Check the original label for allergens.</span>
        <div role="group" aria-label="Result actions">
          <div className="copy-menu" ref={copyMenu}>
            <div className="copy-split-button">
              <Button
                className="copy-split-button__action"
                variant="ghost"
                size="sm"
                disabled={!view.canExport || busy}
                onClick={() => setFormatMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={formatMenuOpen}
                aria-label="Copy"
              >
                {copyState === 'copied' ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
                {copyState === 'copied' ? 'Copied' : 'Copy'}
                <CaretDownIcon size={13} />
              </Button>
            </div>
            {formatMenuOpen && (
              <div className="copy-format-menu" role="menu" aria-label="Copy format">
                {['json', 'csv', 'txt'].map((format) => (
                  <button
                    key={format}
                    type="button"
                    role="menuitemradio"
                    aria-checked={copyFormat === format}
                    onClick={async () => {
                      setCopyFormat(format);
                      setFormatMenuOpen(false);
                      await copyContent(copyViews[format].content);
                    }}
                  >
                    {format.toUpperCase()}
                    {copyFormat === format && <CheckIcon size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="copy-menu" ref={saveMenu}>
            <Button
              variant="ghost"
              size="sm"
              disabled={!view.canExport || busy}
              onClick={() => setSaveMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={saveMenuOpen}
              aria-label="Save"
            >
              <DownloadSimpleIcon size={15} />
              Save
              <CaretDownIcon size={13} />
            </Button>
            {saveMenuOpen && (
              <div className="copy-format-menu" role="menu" aria-label="Save format">
                {['json', 'csv', 'txt'].map((format) => (
                  <button
                    key={format}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      const output = { ...view, content: formatResult(view, format) };
                      downloadText(
                        output.content,
                        output.filename.replace(/\.[^.]+$/, `.${format}`),
                        format === 'json' ? 'application/json' : 'text/plain',
                      );
                      setSaveMenuOpen(false);
                    }}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </footer>
    </Surface>
  );
}

import { useState } from 'react';
import { Check, Copy, Download, Leaf, Send } from 'lucide-react';
import { getResponseView } from '../../../services/responseView';
import { downloadText } from '../../../utils/download';
import IngredientList from './IngredientList';
import EmptyState from '../../../components/common/EmptyState';
import Tabs from '../../../components/common/Tabs';

const TABS = [
  { id: 'ingredients', name: 'Ingredients' },
  { id: 'api', name: 'API response' },
  { id: 'custom', name: 'Custom prompt' },
];

export default function ResultsPanel({
  results,
  customResult,
  isLoading,
  isLLMLoading,
  prompt,
  setPrompt,
  onPostProcess,
}) {
  const [tab, setTab] = useState('ingredients');
  const [copiedText, setCopiedText] = useState(null);
  const [copyError, setCopyError] = useState('');
  const view = getResponseView(tab, results, customResult);
  const { response: llm, summary, content: exportValue, hasContent } = view;
  const busy = isLoading || (tab === 'custom' && isLLMLoading);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exportValue);
      setCopiedText(exportValue);
      setCopyError('');
    } catch {
      setCopyError('Clipboard unavailable. Use Download instead.');
    }
  };
  const download = () => downloadText(view.content, view.filename, view.mime);

  return (
    <section className="results-panel panel" aria-label="Ingredients and API responses">
      <div className="panel-top">
        <span className="panel-number">03</span>
        <h2>Ingredients</h2>
      </div>
      <Tabs
        items={TABS}
        value={tab}
        onChange={(value) => {
          setTab(value);
          setCopyError('');
        }}
        controls="result-content"
        label="Response view"
      />
      {tab === 'custom' && (
        <form
          className="prompt-editor"
          onSubmit={(event) => {
            event.preventDefault();
            onPostProcess();
          }}
        >
          <label htmlFor="custom-prompt">Instructions for the extracted label</label>
          <textarea
            id="custom-prompt"
            maxLength={10000}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="For example: identify allergens in this label"
          />
          <button
            className="secondary-button"
            disabled={!results || isLoading || isLLMLoading || !prompt.trim()}
            type="submit"
          >
            {isLLMLoading ? <span className="spinner" /> : <Send size={13} />}
            {isLLMLoading ? 'Running...' : 'Run prompt'}
          </button>
        </form>
      )}
      <div
        id="result-content"
        className="result-content"
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        aria-busy={busy}
      >
        {busy ? (
          <EmptyState loading title={isLoading ? 'Processing your image' : 'Running custom prompt'}>
            Your response will appear here.
          </EmptyState>
        ) : !hasContent ? (
          <EmptyState icon={Leaf} title={tab === 'custom' ? 'Custom response' : 'No results yet'}>
            {tab === 'custom'
              ? results
                ? 'Run your prompt to analyze the extracted text.'
                : 'Extract an image first, then run your prompt.'
              : 'Upload an image and click Extract ingredients.'}
          </EmptyState>
        ) : tab === 'ingredients' ? (
          <IngredientList summary={summary} error={llm?.error} />
        ) : (
          <div className="api-output">
            {llm?.error && (
              <p className="provider-error" role="alert">
                {llm.error}
              </p>
            )}
            <div className="response-caption">
              {tab === 'custom' ? 'Custom API response' : 'Ingredient API response'}
              {llm?.model && <span>{llm.model}</span>}
            </div>
            <pre className="json-output">{exportValue}</pre>
          </div>
        )}
      </div>
      <div className="result-tools">
        <span role="status">
          {copyError ||
            (hasContent
              ? 'AI output should be checked against the original label.'
              : 'Results stay linked to the uploaded image.')}
        </span>
        <button
          className="icon-button"
          disabled={!view.canExport || busy}
          onClick={copy}
          aria-label="Copy current response"
          title="Copy response"
        >
          {copiedText === exportValue && hasContent ? <Check size={15} /> : <Copy size={15} />}
        </button>
        <button
          className="icon-button"
          disabled={!view.canExport || busy}
          onClick={download}
          aria-label="Download current response"
          title="Download response"
        >
          <Download size={15} />
        </button>
      </div>
    </section>
  );
}

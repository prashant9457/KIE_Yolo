import { useState } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import ImageUpload from './components/ImageUpload';
import LabelledOutput from './components/LabelledOutput';
import ResultsPanel from './components/ResultsPanel';
import './extract.css';

export default function ExtractPage({ flow, active }) {
  const [mobilePanel, setMobilePanel] = useState('upload');
  const busy = flow.isLoading || flow.isLLMLoading;
  return (
    <main className="main-shell" hidden={!active}>
      {flow.error && (
        <div className="error-banner" role="alert">
          {flow.error}
          <button className="text-button" onClick={() => flow.setError('')}>
            Dismiss
          </button>
        </div>
      )}
      <div className="mobile-switch" aria-label="Extraction panel">
        {['upload', 'labelled', 'response'].map((panel) => (
          <button
            key={panel}
            className={mobilePanel === panel ? 'selected' : ''}
            onClick={() => setMobilePanel(panel)}
          >
            {panel === 'upload' ? 'Upload' : panel === 'labelled' ? 'Labelled output' : 'Response'}
          </button>
        ))}
      </div>
      <div className={`workspace mobile-${mobilePanel}`}>
        <section className="upload-panel panel" aria-label="Upload and extraction controls">
          <div className="panel-top">
            <span className="panel-number">01</span>
            <h1>Upload</h1>
            <span className="panel-subtitle">Source image</span>
          </div>
          <ImageUpload
            image={flow.image}
            file={flow.file}
            onSelect={flow.handleImageSelected}
            onError={flow.setError}
          />
          <div className="upload-controls">
            <label htmlFor="confidence">
              Detection confidence <strong>{Math.round(flow.confidence * 100)}%</strong>
            </label>
            <input
              id="confidence"
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={flow.confidence}
              onChange={(event) => flow.setConfidence(Number(event.target.value))}
              disabled={busy}
            />
            <p>Lower the threshold to detect more text regions.</p>
            <button
              className="primary-button"
              disabled={!flow.image || busy}
              onClick={flow.handleExtract}
            >
              {flow.isLoading ? <span className="spinner" /> : <Sparkles size={16} />}
              {flow.isLoading ? 'Extracting...' : 'Extract ingredients'}
            </button>
            {flow.image && (
              <button className="clear-button" onClick={flow.handleReset}>
                <RotateCcw size={13} />
                Clear extraction
              </button>
            )}
          </div>
        </section>
        <LabelledOutput
          results={flow.results}
          isLoading={flow.isLoading}
          onDownload={flow.handleDownloadImage}
        />
        <ResultsPanel
          results={flow.results}
          customResult={flow.customResult}
          isLoading={flow.isLoading}
          isLLMLoading={flow.isLLMLoading}
          prompt={flow.customPrompt}
          setPrompt={flow.setCustomPrompt}
          onPostProcess={flow.handlePostProcess}
        />
      </div>
    </main>
  );
}

import { useEffect, useRef } from 'react';
import Surface from '../../components/ui/Surface';
import Notice from '../../components/ui/Notice';
import ClearExtractionButton from '../../components/ui/ClearExtractionButton';
import ImageUpload from './components/ImageUpload';
import ExtractionSettings from './components/ExtractionSettings';
import ProcessingState from './components/ProcessingState';
import LabelledOutput from './components/LabelledOutput';
import ResultsPanel from './components/ResultsPanel';
import './extract.css';

export default function ExtractPage({ flow, active }) {
  const ready = Boolean(flow.results) && !flow.isLoading;
  const heading = useRef(null);
  useEffect(() => {
    if (ready && active) heading.current?.focus({ preventScroll: true });
  }, [ready, active]);
  return (
    <main
      className="main-shell extraction-page"
      id={active ? 'main-content' : undefined}
      tabIndex={-1}
      hidden={!active}
    >
      {flow.error && (
        <Notice className="extraction-error" onDismiss={() => flow.setError('')}>
          {flow.error}
        </Notice>
      )}
      <header className="extraction-heading">
        <div>
          <h1 ref={heading} tabIndex={-1}>
            {ready ? 'Your results' : 'Extract ingredients'}
          </h1>
          <p>
            {ready
              ? 'Explore the ingredients, switch languages, or ask about your label.'
              : 'Start with a clear image of the ingredients on your package.'}
          </p>
        </div>
        {flow.image && !flow.isLoading && (
          <ClearExtractionButton onClear={flow.handleReset} disabled={flow.isBusy} />
        )}
      </header>
      {flow.isLoading ? (
        <ProcessingState image={flow.image} onCancel={flow.handleCancel} />
      ) : (
        <div className={`workspace ${ready ? 'workspace-results' : 'workspace-upload'}`}>
          {ready ? (
            <>
              <LabelledOutput
                key={`image-${flow.image}`}
                active={active}
                results={flow.results}
                image={flow.image}
                onDownload={flow.handleDownloadImage}
                file={flow.file}
              />
              <ResultsPanel
                key={`results-${flow.image}`}
                results={flow.results}
                customResult={flow.customResult}
                messages={flow.messages}
                isLLMLoading={flow.isLLMLoading}
                isTranslating={flow.isTranslating}
                onPostProcess={flow.handlePostProcess}
                onTranslate={flow.handleTranslate}
                onCancel={flow.handleCancel}
              />
            </>
          ) : (
            <Surface className="upload-panel panel" aria-label="Upload and extraction controls">
              <ImageUpload
                image={flow.image}
                file={flow.file}
                onSelect={flow.handleImageSelected}
                onError={flow.setError}
              />
              <ExtractionSettings
                confidence={flow.confidence}
                onConfidenceChange={flow.setConfidence}
                hasImage={Boolean(flow.image)}
                onExtract={flow.handleExtract}
              />
            </Surface>
          )}
        </div>
      )}
    </main>
  );
}

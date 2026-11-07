import EmptyState from '../../../components/common/EmptyState';
import { Download, ScanLine } from 'lucide-react';

export default function LabelledOutput({ results, isLoading, onDownload }) {
  return (
    <section className="labelled-panel panel" aria-label="Labelled image output">
      <div className="panel-top">
        <span className="panel-number">02</span>
        <h2>Labelled output</h2>
      </div>
      <div className="labelled-canvas" aria-busy={isLoading}>
        {isLoading ? (
          <EmptyState loading title="Reading your label">
            Detecting text and extracting ingredients...
          </EmptyState>
        ) : results ? (
          <img
            src={results.annotatedImage}
            alt="Product label with numbered text detection boxes"
          />
        ) : (
          <EmptyState icon={ScanLine} title="Labelled image appears here">
            Extract an image to see the labelled output.
          </EmptyState>
        )}
      </div>
      <div className="output-footer">
        <span>
          {results
            ? 'Labelled image from the extraction pipeline.'
            : 'Your processed label will appear here.'}
        </span>
        <button className="secondary-button" disabled={!results || isLoading} onClick={onDownload}>
          <Download size={14} />
          Download
        </button>
      </div>
    </section>
  );
}

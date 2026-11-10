import { ArrowRightIcon } from '@phosphor-icons/react';
import CometDial from '../../../components/reactbits/CometDial';
import Button from '../../../components/ui/Button';
import { colors } from '../../../styles/theme';

export default function ExtractionSettings({
  confidence,
  onConfidenceChange,
  hasImage,
  onExtract,
}) {
  return (
    <aside className="extraction-settings" aria-labelledby="confidence-title">
      <div>
        <h2 id="confidence-title">Detection confidence</h2>
        <p>Choose how confidently a text region needs to match.</p>
      </div>
      <CometDial
        className="rb-confidence"
        value={Math.round(confidence * 100)}
        min={10}
        max={90}
        step={5}
        label="Detection confidence"
        size={190}
        ink={colors.text}
        accent={colors.accent}
        onChange={(value) => onConfidenceChange(value / 100)}
      />
      <p className="confidence-help">
        Lower values find more text.
        <br />
        Higher values select stronger matches.
      </p>
      <div className="extract-action">
        <Button
          className="primary-button"
          variant="primary"
          size="lg"
          trailingIcon={ArrowRightIcon}
          disabled={!hasImage}
          onClick={onExtract}
        >
          Extract ingredients
        </Button>
        <span>{hasImage ? 'Your image is ready.' : 'Choose an image to begin.'}</span>
      </div>
    </aside>
  );
}

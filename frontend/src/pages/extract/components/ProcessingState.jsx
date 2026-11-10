import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import ThoughtLine from '../../../components/reactbits/ThoughtLine';
import Button from '../../../components/ui/Button';
import { colors, themeVariables } from '../../../styles/theme';

export default function ProcessingState({ image, onCancel }) {
  const dialog = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    if (typeof element.showModal === 'function') element.showModal();
    else element.setAttribute('open', '');
    return () => {
      if (element.open && typeof element.close === 'function') element.close();
    };
  }, []);
  return createPortal(
    <dialog
      ref={dialog}
      className="extraction-overlay"
      style={themeVariables}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <motion.div
        className="processing-state"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="processing-image">
          <img src={image} alt="Product label being processed" />
        </div>
        <h2 id={titleId}>Reading your label</h2>
        <p>
          Finding the text, identifying ingredients,
          <br />
          and translating the results.
        </p>
        <ThoughtLine
          label="Extracting ingredients"
          working
          fontSize={15}
          color={colors.text}
          glyphColor={colors.accent}
          shimmer={false}
          breathDepth={0.25}
        />
        <Button variant="ghost" onClick={onCancel} autoFocus>
          Cancel extraction
        </Button>
      </motion.div>
    </dialog>,
    document.body,
  );
}

import HoldButton from '../reactbits/HoldButton';
import { colors, radii } from '../../styles/theme';

export default function ClearExtractionButton({ onClear, disabled }) {
  return (
    <HoldButton
      className="rb-hold"
      onHold={onClear}
      holdTime={1200}
      doneLabel="Cleared"
      backgroundColor={colors.errorSoft}
      textColor={colors.error}
      fillColor={colors.error}
      fillTextColor={colors.onAccent}
      radius={radii.pill}
      size="sm"
      glow={false}
      wave={false}
      disabled={disabled}
    >
      Hold to clear
    </HoldButton>
  );
}

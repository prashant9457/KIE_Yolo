import { useEffect, useRef, useState } from 'react';
import { StarIcon } from '@phosphor-icons/react';
import PulseHeart from '../reactbits/PulseHeart';
import PeekRating from '../reactbits/PeekRating';
import { colors } from '../../styles/theme';

export default function AppFeedback() {
  const [rating, setRating] = useState(0);
  const popover = useRef(null);
  useEffect(() => {
    const close = (event) => {
      if (!popover.current?.contains(event.target)) popover.current?.removeAttribute('open');
    };
    const escape = (event) => {
      if (event.key === 'Escape' && popover.current?.open) {
        popover.current.removeAttribute('open');
        popover.current.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', escape);
    };
  }, []);

  return (
    <div className="app-feedback" aria-label="App feedback">
      <PulseHeart
        count={0}
        size={30}
        corner={999}
        pillColor={colors.subtle}
        idleColor={colors.secondary}
        likedColor={colors.accent}
        textColor={colors.text}
        label="Like this app"
      />
      <details ref={popover} className="feedback-rating">
        <summary aria-label="Rate this app" title="Rate this app">
          <StarIcon size={16} weight={rating ? 'fill' : 'light'} />
          <span>Rate</span>
        </summary>
        <div className="feedback-rating__popover">
          <h2>How was your experience?</h2>
          <PeekRating
            value={rating}
            onChange={setRating}
            size={28}
            activeColor={colors.accent}
            idleColor={colors.outline}
            tipColor={colors.text}
            tipTextColor={colors.surface}
            ariaLabel="Rate this app"
          />
          <p>
            {rating ? `Your rating: ${rating} of 5.` : 'Choose a rating from 1 to 5.'}
            <br />
            Feedback stays in this session.
          </p>
        </div>
      </details>
    </div>
  );
}

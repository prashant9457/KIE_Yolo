import { useCallback, useEffect, useRef, useState } from 'react';
import { StarIcon } from '@phosphor-icons/react';
import PulseHeart from '../reactbits/PulseHeart';
import PeekRating from '../reactbits/PeekRating';
import { colors } from '../../styles/theme';
import { getFeedbackClientId, getFeedbackStats, saveFeedback } from '../../services/feedback';

export default function AppFeedback() {
  const [rating, setRating] = useState(0);
  const [stats, setStats] = useState({ likes: 0, rating_count: 0, average_rating: null });
  const [liked, setLiked] = useState(false);
  const [clientId, setClientId] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(false);
  const popover = useRef(null);
  useEffect(() => {
    const id = getFeedbackClientId();
    setClientId(id);
    getFeedbackStats(id)
      .then((data) => {
        setStats(data);
        setLiked(data.liked);
        setRating(data.rating || 0);
        setConnected(true);
      })
      .catch(() => setConnected(false));
  }, []);

  const persist = useCallback(
    async (change) => {
      if (!clientId) return;
      setSyncing(true);
      try {
        const data = await saveFeedback(clientId, change);
        setStats(data);
        setLiked(data.liked);
        setRating(data.rating || 0);
        setConnected(true);
      } catch {
        setConnected(false);
      } finally {
        setSyncing(false);
      }
    },
    [clientId],
  );
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
        count={stats.likes}
        liked={liked}
        disabled={syncing}
        onChange={(nextLiked) => {
          setLiked(nextLiked);
          setStats((current) => ({
            ...current,
            likes: Math.max(0, current.likes + (nextLiked ? 1 : -1)),
          }));
          persist({ liked: nextLiked });
        }}
        size={30}
        corner={999}
        pillColor={colors.subtle}
        idleColor={colors.error}
        likedColor={colors.error}
        textColor={colors.error}
        label="Like this app"
      />
      <details ref={popover} className="feedback-rating">
        <summary
          aria-label={`Rate this app. ${stats.rating_count ? `${stats.average_rating} average from ${stats.rating_count} ratings` : 'No ratings yet'}.`}
          title={
            stats.rating_count
              ? `${stats.average_rating} average from ${stats.rating_count} ratings`
              : 'No ratings yet'
          }
        >
          <StarIcon size={16} weight={rating ? 'fill' : 'light'} />
          <span className="feedback-rating__label">Rate</span>
          <span className="feedback-rating__average">
            {stats.average_rating === null ? '—' : Number(stats.average_rating).toFixed(1)}
          </span>
        </summary>
        <div className="feedback-rating__popover">
          <h2>How was your experience?</h2>
          <PeekRating
            value={rating}
            disabled={syncing}
            allowClear={false}
            onChange={(nextRating) => {
              setRating(nextRating);
              persist({ rating: nextRating });
            }}
            size={28}
            activeColor={colors.accent}
            idleColor={colors.outline}
            tipColor={colors.text}
            tipTextColor={colors.surface}
            ariaLabel="Rate this app"
          />
          <p>
            {stats.rating_count > 0
              ? `${stats.average_rating} average from ${stats.rating_count} ratings.`
              : rating
                ? `Your rating: ${rating} of 5.`
                : 'Choose a rating from 1 to 5.'}
            <br />
            {connected
              ? 'Your feedback is included in app stats.'
              : 'MongoDB is disconnected; feedback is only temporary until it reconnects.'}
          </p>
        </div>
      </details>
    </div>
  );
}

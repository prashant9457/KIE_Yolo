import { useEffect, useRef, useState } from 'react';

export function usePipelinePlayback(stepCount, duration = 8000) {
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [visible, setVisible] = useState(() => !document.hidden);
  const [revision, setRevision] = useState(0);
  const elapsed = useRef(0);
  const fillRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    const paint = () => {
      const fraction = Math.min(elapsed.current / duration, 1);
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${fraction})`;
      progressRef.current?.setAttribute('aria-valuenow', String(Math.round(fraction * 100)));
    };
    paint();
    if (!playing || !visible) return;
    let frame;
    let previous = performance.now();
    const tick = (now) => {
      elapsed.current += Math.min(now - previous, 250);
      previous = now;
      paint();
      if (elapsed.current >= duration) {
        elapsed.current = 0;
        setSelected((index) => (index + 1) % stepCount);
        setRevision((value) => value + 1);
      } else {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [selected, playing, visible, duration, stepCount, revision]);

  const skip = (direction) => {
    elapsed.current = 0;
    setSelected((index) => (index + direction + stepCount) % stepCount);
    setRevision((value) => value + 1);
    setPlaying(true);
  };

  return {
    selected,
    playing,
    fillRef,
    progressRef,
    skip,
    togglePlaying: () => setPlaying((value) => !value),
  };
}

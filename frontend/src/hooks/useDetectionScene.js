import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

export function useDetectionScene(active) {
  const [dimensions, setDimensions] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [replay, setReplay] = useState(0);
  const [settled, setSettled] = useState(false);
  const [canPan, setCanPan] = useState(false);
  const panningState = useRef(false);
  const imageRef = useRef(null);
  const transformRef = useRef(null);
  const zoomLabel = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (!dimensions || !active || !imageRef.current) return;
    const measure = () => {
      const { left, top, width, height } = imageRef.current.getBoundingClientRect();
      setBounds((previous) =>
        previous &&
        previous.left === left &&
        previous.top === top &&
        previous.width === width &&
        previous.height === height
          ? previous
          : { left, top, width, height },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(imageRef.current);
    return () => observer.disconnect();
  }, [dimensions, replay, active]);

  useEffect(() => {
    // Finish drawing before viewport movement so screen-space cursors never drift.
    const finish = () => setSettled(true);
    const onKey = (event) => {
      if (['PageDown', 'PageUp', 'Home', 'End'].includes(event.key)) finish();
    };
    window.addEventListener('wheel', finish, { passive: true });
    window.addEventListener('resize', finish);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', finish);
      window.removeEventListener('resize', finish);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const onImageLoad = (event) => {
    const { naturalWidth: width, naturalHeight: height } = event.currentTarget;
    if (width && height) setDimensions({ width, height });
  };
  const inspect = () => setSettled(true);
  const play = () => {
    transformRef.current?.resetTransform(0);
    setSettled(false);
    setReplay((value) => value + 1);
  };
  const onTransform = (_reference, state) => {
    if (zoomLabel.current) zoomLabel.current.textContent = `${Math.round(state.scale * 100)}%`;
    const enabled = state.scale > 1.01;
    if (panningState.current !== enabled) {
      panningState.current = enabled;
      setCanPan(enabled);
    }
  };
  return {
    dimensions,
    bounds,
    replay,
    imageRef,
    transformRef,
    zoomLabel,
    reduced,
    canPan,
    settled: settled || reduced || !active,
    onImageLoad,
    inspect,
    play,
    onTransform,
  };
}

import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { CursorIcon } from '@phosphor-icons/react';
import { annotationColors, colors, easing, themeVariables } from '../../../styles/theme';

export default function DrawingRegion({ region, index, dimensions, bounds, settled }) {
  const [x1, y1, x2, y2] = region.bbox;
  const color = annotationColors[index % annotationColors.length];
  const delay = Math.min(index * 0.13, 1.5);
  const approach = 0.65;
  const drag = 1.4;
  const left = x1 / dimensions.width;
  const top = y1 / dimensions.height;
  const targetX = bounds.left + left * bounds.width;
  const targetY = bounds.top + top * bounds.height;
  const endX = bounds.left + (x2 / dimensions.width) * bounds.width;
  const endY = bounds.top + (y2 / dimensions.height) * bounds.height;
  const entry = (index * 0.381966 + 0.15) % 1;
  const origins = [
    [-40, window.innerHeight * entry],
    [window.innerWidth * entry, -40],
    [window.innerWidth + 40, window.innerHeight * entry],
    [window.innerWidth * entry, window.innerHeight + 40],
  ];
  const [startX, startY] = origins[index % origins.length];
  const duration = approach + drag + 0.35;
  const times = [0, approach / duration, (approach + drag) / duration, 1];
  const move = { duration, delay, times, ease: [easing, easing, easing] };
  const still = settled || index >= 24;
  return (
    <>
      <svg
        className="detection-region"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <motion.rect
          x={x1}
          y={y1}
          width={x2 - x1}
          height={y2 - y1}
          fill={color}
          fillOpacity="0.035"
          stroke={color}
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
          style={{ transformBox: 'fill-box', transformOrigin: '0% 0%' }}
          initial={still ? false : { scaleX: 0, scaleY: 0, opacity: 0 }}
          animate={{ scaleX: 1, scaleY: 1, opacity: 1 }}
          transition={{
            scaleX: {
              duration: still ? 0 : drag,
              delay: still ? 0 : delay + approach,
              ease: easing,
            },
            scaleY: {
              duration: still ? 0 : drag,
              delay: still ? 0 : delay + approach,
              ease: easing,
            },
            opacity: { duration: 0.08, delay: still ? 0 : delay + approach },
          }}
        />
      </svg>
      {!still &&
        createPortal(
          <motion.div
            className="drawing-cursor"
            style={{ ...themeVariables, color }}
            aria-hidden="true"
            initial={{ x: startX, y: startY, opacity: 0 }}
            animate={{
              x: [startX, targetX, endX, endX + 16],
              y: [startY, targetY, endY, endY + 12],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              x: move,
              y: move,
              opacity: { duration, delay, times: [0, 0.08, 0.9, 1], ease: easing },
            }}
          >
            <CursorIcon
              size={30}
              weight="fill"
              color={color}
              style={{ stroke: colors.surface, strokeWidth: 8 }}
            />
            <span style={{ backgroundColor: color }}>Region {region.box_id + 1}</span>
          </motion.div>,
          document.body,
        )}
      <motion.span
        className="detection-tag"
        style={{ left: `${left * 100}%`, top: `${top * 100}%`, color, borderColor: color }}
        initial={still ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: still ? 0 : delay + approach + drag, duration: still ? 0 : 0.16 }}
        aria-hidden="true"
      >
        {String(region.box_id + 1).padStart(2, '0')}
      </motion.span>
    </>
  );
}

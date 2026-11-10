import { useId } from 'react';
import { motion } from 'motion/react';

export default function Tabs({ items, value, onChange, controls, label, idPrefix = 'tab' }) {
  const layoutId = useId();
  const changeByKey = (event) => {
    const index = items.findIndex((item) => item.id === value);
    const next = {
      ArrowRight: (index + 1) % items.length,
      ArrowLeft: (index + items.length - 1) % items.length,
      Home: 0,
      End: items.length - 1,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onChange(items[next].id);
    event.currentTarget.querySelector(`[id="${idPrefix}-${items[next].id}"]`)?.focus();
  };
  return (
    <div className="tabs" role="tablist" aria-label={label} onKeyDown={changeByKey}>
      {items.map((item) => (
        <button
          key={item.id}
          id={`${idPrefix}-${item.id}`}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          aria-controls={controls}
          tabIndex={value === item.id ? 0 : -1}
          className="tab"
          onClick={() => onChange(item.id)}
        >
          {value === item.id && (
            <motion.span
              className="tab__active"
              layoutId={layoutId}
              transition={{ type: 'spring', stiffness: 400, damping: 38 }}
            />
          )}
          <span className={`tab__label ${item.id === 'custom' ? 'tab__chat' : ''}`}>
            {item.name}
          </span>
        </button>
      ))}
    </div>
  );
}

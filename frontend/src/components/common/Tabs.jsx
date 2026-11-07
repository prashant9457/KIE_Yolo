export default function Tabs({ items, value, onChange, controls, label }) {
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
    event.currentTarget.querySelector(`#tab-${items[next].id}`)?.focus();
  };
  return (
    <div className="result-tabs" role="tablist" aria-label={label} onKeyDown={changeByKey}>
      {items.map((item) => (
        <button
          key={item.id}
          id={`tab-${item.id}`}
          role="tab"
          aria-selected={value === item.id}
          aria-controls={controls}
          tabIndex={value === item.id ? 0 : -1}
          className={value === item.id ? 'active' : ''}
          onClick={() => onChange(item.id)}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}

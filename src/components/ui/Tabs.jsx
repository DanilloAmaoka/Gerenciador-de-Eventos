export const Tabs = ({ items, activeId, onChange, labelledBy }) => (
  <div className="tabs" role="tablist" aria-labelledby={labelledBy}>
    {items.map((item) => (
      <button
        key={item.id}
        type="button"
        className={item.id === activeId ? "tabs__item tabs__item--active" : "tabs__item"}
        role="tab"
        aria-selected={item.id === activeId}
        onClick={() => onChange(item)}
      >
        <span>{item.label}</span>
      </button>
    ))}
  </div>
);

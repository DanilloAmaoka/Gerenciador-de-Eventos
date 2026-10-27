export const MetricGrid = ({ items }) => (
  <div className="metric-grid">
    {items.map((item) => (
      <div className="metric" key={item.label}>
        <span>{item.label}</span>
        <strong>{item.value}</strong>
        {item.helper ? <small>{item.helper}</small> : null}
      </div>
    ))}
  </div>
);

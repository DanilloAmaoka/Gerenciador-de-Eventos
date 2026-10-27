export const InlineAlert = ({ tone = "info", title, children }) => (
  <div className={`inline-alert inline-alert--${tone}`} role="status">
    {title ? <strong>{title}</strong> : null}
    <span>{children}</span>
  </div>
);

export const IconButton = ({
  label,
  children,
  variant = "ghost",
  className = "",
  ...props
}) => (
  <button
    type="button"
    className={`icon-button icon-button--${variant} ${className}`}
    aria-label={label}
    title={label}
    {...props}
  >
    {children}
  </button>
);

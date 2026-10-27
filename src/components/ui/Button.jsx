export const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  className = "",
  disabled,
  ...props
}) => (
  <button
    type={type}
    className={`button button--${variant} button--${size} ${className}`}
    disabled={disabled || isLoading}
    {...props}
  >
    {isLoading ? <span className="button__spinner" aria-hidden="true" /> : icon}
    <span>{children}</span>
  </button>
);

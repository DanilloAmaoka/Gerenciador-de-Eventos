export const Card = ({ children, className = "", as: Component = "section", ...props }) => (
  <Component className={`card ${className}`} {...props}>
    {children}
  </Component>
);

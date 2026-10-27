import { useEffect, useRef } from "react";
import { useModalLock } from "../../hooks/useModalLock";
import { IconButton } from "./IconButton";

export const Drawer = ({ isOpen, title, children, onClose, side = "right" }) => {
  const drawerRef = useRef(null);

  useModalLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => drawerRef.current?.focus(), 0);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="drawer-layer">
      <button
        type="button"
        className="drawer-layer__backdrop"
        aria-label="Fechar painel lateral"
        onClick={onClose}
      />
      <aside
        className={`drawer drawer--${side}`}
        aria-label={title}
        tabIndex={-1}
        ref={drawerRef}
      >
        <header className="drawer__header">
          <h2>{title}</h2>
          <IconButton label="Fechar painel lateral" onClick={onClose}>
            ×
          </IconButton>
        </header>
        <div className="drawer__body">{children}</div>
      </aside>
    </div>
  );
};

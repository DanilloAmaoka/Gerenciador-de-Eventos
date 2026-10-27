import { useEffect, useRef, useState } from "react";
import { useModalLock } from "../../hooks/useModalLock";
import { Button } from "./Button";
import { IconButton } from "./IconButton";

export const Modal = ({
  isOpen,
  title,
  description,
  children,
  footer,
  onClose,
  size = "md",
  closeOnOverlay = true,
  hasUnsavedChanges = false
}) => {
  const [isConfirmingClose, setIsConfirmingClose] = useState(false);
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);

  useModalLock(isOpen);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    triggerRef.current = document.activeElement;

    window.setTimeout(() => {
      dialogRef.current?.focus();
    }, 0);

    return () => {
      triggerRef.current?.focus?.();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        requestClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  if (!isOpen) {
    return null;
  }

  function requestClose() {
    if (hasUnsavedChanges) {
      setIsConfirmingClose(true);
      return;
    }

    onClose?.();
  }

  const confirmClose = () => {
    setIsConfirmingClose(false);
    onClose?.();
  };

  return (
    <div className="modal-layer" role="presentation">
      <button
        type="button"
        className="modal-layer__backdrop"
        aria-label="Fechar janela modal"
        onClick={closeOnOverlay ? requestClose : undefined}
      />
      <section
        className={`modal modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <header className="modal__header">
          <div>
            <h2 id="modal-title">{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <IconButton label="Fechar janela modal" onClick={requestClose}>
            ×
          </IconButton>
        </header>
        <div className="modal__body">{children}</div>
        {footer ? <footer className="modal__footer">{footer}</footer> : null}
      </section>
      {isConfirmingClose ? (
        <section
          className="confirm-popover"
          role="dialog"
          aria-modal="true"
          aria-labelledby="discard-title"
        >
          <h3 id="discard-title">Descartar alterações?</h3>
          <p>Há informações preenchidas que ainda não foram salvas.</p>
          <div className="confirm-popover__actions">
            <Button variant="secondary" onClick={() => setIsConfirmingClose(false)}>
              Continuar editando
            </Button>
            <Button variant="danger" onClick={confirmClose}>
              Descartar alterações
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
};

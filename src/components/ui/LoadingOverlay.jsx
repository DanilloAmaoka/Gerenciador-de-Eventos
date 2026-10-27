export const LoadingOverlay = ({
  isVisible,
  message = "Processando...",
  inline = false
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className={inline ? "loading-overlay loading-overlay--inline" : "loading-overlay"}>
      <div className="loading-overlay__box" role="status" aria-live="polite">
        <span className="loading-overlay__spinner" aria-hidden="true" />
        <span>{message}</span>
      </div>
    </div>
  );
};

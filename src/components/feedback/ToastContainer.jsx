import { useFeedback } from "../../contexts/FeedbackContext";

export const ToastContainer = () => {
  const { toasts, closeToast } = useFeedback();

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.tone}`}>
          <div>
            <strong>{toast.title}</strong>
            {toast.message ? <p>{toast.message}</p> : null}
          </div>
          <button type="button" aria-label="Fechar aviso" onClick={() => closeToast(toast.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

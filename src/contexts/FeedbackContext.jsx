import { createContext, useCallback, useContext, useMemo, useState } from "react";

const FeedbackContext = createContext(null);

const AUTO_CLOSE_TIME = 3600;
const createFeedbackId = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

export const FeedbackProvider = ({ children }) => {
  const [centralFeedback, setCentralFeedback] = useState(null);
  const [toasts, setToasts] = useState([]);

  const closeCentralFeedback = useCallback(() => setCentralFeedback(null), []);

  const showCentralFeedback = useCallback((feedback) => {
    setCentralFeedback(feedback);

    window.setTimeout(() => {
      setCentralFeedback((current) => (current?.id === feedback.id ? null : current));
    }, feedback.duration || AUTO_CLOSE_TIME);
  }, []);

  const showToast = useCallback((toast) => {
    const id = createFeedbackId();
    const nextToast = { id, tone: "info", ...toast };

    setToasts((current) => [...current, nextToast]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, toast.duration || 4200);
  }, []);

  const notifySuccess = useCallback(
    ({ title, message }) => {
      showCentralFeedback({
        id: createFeedbackId(),
        tone: "success",
        title,
        message
      });
    },
    [showCentralFeedback]
  );

  const notifyError = useCallback(
    ({ title = "Não foi possível concluir", message }) => {
      showCentralFeedback({
        id: createFeedbackId(),
        tone: "danger",
        title,
        message
      });
    },
    [showCentralFeedback]
  );

  const closeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      centralFeedback,
      toasts,
      closeCentralFeedback,
      closeToast,
      notifyError,
      notifySuccess,
      showCentralFeedback,
      showToast
    }),
    [
      centralFeedback,
      closeCentralFeedback,
      closeToast,
      notifyError,
      notifySuccess,
      showCentralFeedback,
      showToast,
      toasts
    ]
  );

  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>;
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error("useFeedback deve ser usado dentro de FeedbackProvider.");
  }

  return context;
};

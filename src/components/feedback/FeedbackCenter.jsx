import { useFeedback } from "../../contexts/FeedbackContext";
import { Button } from "../ui/Button";

const FEEDBACK_SYMBOL = {
  success: "✓",
  danger: "!",
  warning: "!",
  info: "i"
};

export const FeedbackCenter = () => {
  const { centralFeedback, closeCentralFeedback } = useFeedback();

  if (!centralFeedback) {
    return null;
  }

  return (
    <div className="feedback-center" role="status" aria-live="polite">
      <div className={`feedback-card feedback-card--${centralFeedback.tone}`}>
        <span className="feedback-card__symbol" aria-hidden="true">
          {FEEDBACK_SYMBOL[centralFeedback.tone] || "i"}
        </span>
        <h2>{centralFeedback.title}</h2>
        {centralFeedback.message ? <p>{centralFeedback.message}</p> : null}
        <Button variant="secondary" size="sm" onClick={closeCentralFeedback}>
          Fechar
        </Button>
      </div>
    </div>
  );
};

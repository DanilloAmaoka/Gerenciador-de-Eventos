import { Button } from "./Button";

export const EmptyState = ({ title, message, actionLabel, onAction }) => (
  <div className="empty-state">
    <div className="empty-state__mark" aria-hidden="true">
      +
    </div>
    <h2>{title}</h2>
    {message ? <p>{message}</p> : null}
    {actionLabel && onAction ? (
      <Button variant="secondary" onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null}
  </div>
);

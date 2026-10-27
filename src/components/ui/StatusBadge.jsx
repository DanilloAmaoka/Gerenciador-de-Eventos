import { formatStatus } from "../../utils/formatters";

export const StatusBadge = ({ value, options = [], tone = "neutral" }) => {
  const option = options.find((item) => item.value === value);
  const resolvedTone = option?.tone || tone;

  return (
    <span className={`status-badge status-badge--${resolvedTone}`}>
      {formatStatus(value, options)}
    </span>
  );
};

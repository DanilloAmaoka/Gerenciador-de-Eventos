import { formatCurrency } from "../../utils/formatters";
import { getSectionActualCost, getSectionPlannedCost } from "../../utils/planningDisplay";

export const PlanningSectionCard = ({ section, records, isActive, onClick }) => {
  const plannedCost = getSectionPlannedCost(section.id, records);
  const actualCost = getSectionActualCost(section.id, records);
  const hasFinancialValue = plannedCost > 0 || actualCost > 0;

  return (
    <button
      type="button"
      className={
        isActive
          ? `planning-nav-card planning-nav-card--active planning-nav-card--${section.tone}`
          : `planning-nav-card planning-nav-card--${section.tone}`
      }
      onClick={onClick}
    >
      <span className="section-icon" aria-hidden="true">
        {section.icon}
      </span>
      <span className="planning-nav-card__content">
        <strong>{section.title}</strong>
        <small>{records.length} registro(s)</small>
      </span>
      {hasFinancialValue ? (
        <span className="planning-nav-card__cost">
          {formatCurrency(actualCost || plannedCost)}
        </span>
      ) : null}
    </button>
  );
};

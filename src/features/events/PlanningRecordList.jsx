import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  getPlanningFieldLabel,
  getPlanningRecordTitle,
  getPlanningValue
} from "../../utils/planningDisplay";

export const PlanningRecordList = ({ section, records, canManage, onEdit, onDelete, onCreate }) => {
  if (!records.length) {
    return (
      <EmptyState
        title={section.emptyTitle}
        message={section.emptyMessage}
        actionLabel={canManage ? section.addLabel : undefined}
        onAction={canManage ? onCreate : undefined}
      />
    );
  }

  return (
    <div className="planning-record-list">
      {records.map((record) => (
        <article className="planning-record-card" key={record.id}>
          <div className={`section-icon section-icon--${section.tone}`} aria-hidden="true">
            {section.icon}
          </div>
          <div className="planning-record-card__body">
            <div className="planning-record-card__title">
              <h3>{getPlanningRecordTitle(section.id, record)}</h3>
            </div>
            <dl className="planning-record-card__meta">
              {section.primaryFields.map((fieldKey) => (
                <div key={fieldKey}>
                  <dt>{getPlanningFieldLabel(section, fieldKey)}</dt>
                  <dd>
                    {fieldKey === "url" && record.url ? (
                      <a href={record.url} target="_blank" rel="noreferrer">
                        Abrir link
                      </a>
                    ) : (
                      getPlanningValue(section.id, record, fieldKey)
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          {canManage ? (
            <div className="planning-record-card__actions">
              <Button variant="ghost" size="sm" onClick={() => onEdit(record)}>
                Editar
              </Button>
              <Button variant="danger-ghost" size="sm" onClick={() => onDelete(record)}>
                Remover
              </Button>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
};

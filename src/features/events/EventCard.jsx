import { useNavigate } from "react-router-dom";
import { EVENT_STATUS } from "../../constants/eventOptions";
import { getEventPath } from "../../constants/routes";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

export const EventCard = ({ event, onArchive }) => {
  const navigate = useNavigate();

  return (
    <Card className="event-card" as="article">
      <div className="event-card__body">
        <div className="event-card__main">
          <StatusBadge value={event.status} options={EVENT_STATUS} />
          <h2>{event.name}</h2>
          <p>{event.description || "Evento sem descrição detalhada."}</p>
        </div>
        <dl className="event-card__details">
          <div>
            <dt>Data</dt>
            <dd>{formatDateTime(event.startDateTime)}</dd>
          </div>
          <div>
            <dt>Local</dt>
            <dd>{event.locationName || "Não informado"}</dd>
          </div>
          <div>
            <dt>Responsável</dt>
            <dd>{event.primaryResponsible || "Não informado"}</dd>
          </div>
          <div>
            <dt>Orçamento</dt>
            <dd>
              {Number(event.budgetLimit || 0) > 0
                ? formatCurrency(event.budgetLimit)
                : "Não definido"}
            </dd>
          </div>
        </dl>
      </div>
      <div className="event-card__actions">
        <Button variant="secondary" onClick={() => navigate(getEventPath(event.id))}>
          Abrir evento
        </Button>
        {onArchive ? (
          <Button variant="danger-ghost" onClick={() => onArchive(event)}>
            Arquivar
          </Button>
        ) : null}
      </div>
    </Card>
  );
};

import { useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { InlineAlert } from "../../components/ui/InlineAlert";
import { LoadingOverlay } from "../../components/ui/LoadingOverlay";
import { MetricGrid } from "../../components/ui/MetricGrid";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { EVENT_STATUS, ITEM_STATUS, TASK_STATUS } from "../../constants/eventOptions";
import { useEventPlanningData } from "../../hooks/useEventPlanningData";
import { useEvents } from "../../hooks/useEvents";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

export const ReportsPage = () => {
  const { events, isLoading, error } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState("");
  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId),
    [events, selectedEventId]
  );
  const { recordsBySection, financials } = useEventPlanningData(
    selectedEventId,
    selectedEvent?.budgetLimit
  );
  const items = recordsBySection.items || [];
  const tasks = recordsBySection.tasks || [];
  const schedule = recordsBySection.schedule || [];

  const metrics = useMemo(() => {
    const pendingTasks = tasks.filter(
      (task) => !["concluida", "cancelada"].includes(task.status)
    ).length;
    const missingItems = items.filter((item) =>
      ["necessario", "indisponivel"].includes(item.status)
    ).length;

    const baseMetrics = [
      { label: "Custo planejado", value: formatCurrency(financials.plannedCost) },
      { label: "Gasto realizado", value: formatCurrency(financials.actualCost) },
      { label: "Tarefas pendentes", value: pendingTasks },
      { label: "Itens em atenção", value: missingItems },
      { label: "Etapas do cronograma", value: schedule.length }
    ];

    if (financials.hasBudget) {
      baseMetrics.splice(2, 0, {
        label: "Saldo real",
        value: formatCurrency(financials.realBalance)
      });
    }

    return baseMetrics;
  }, [financials, items, schedule.length, tasks]);

  return (
    <section className="page-stack">
      <PageHeader
        title="Relatórios"
        description="Consultas práticas para acompanhamento de eventos."
      />

      {error ? <InlineAlert tone="danger">{error}</InlineAlert> : null}

      <Card>
        <label className="form-field" htmlFor="report-event">
          <span className="form-field__label">Evento</span>
          <select
            id="report-event"
            value={selectedEventId}
            onChange={(event) => setSelectedEventId(event.target.value)}
          >
            <option value="">Selecione um evento</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </label>
      </Card>

      {isLoading ? (
        <LoadingOverlay isVisible inline message="Carregando eventos..." />
      ) : selectedEvent ? (
        <section className="section-stack">
          <MetricGrid items={metrics} />
          <Card>
            <div className="card-heading">
              <div>
                <h2>Resumo completo do evento</h2>
                <p>{formatDateTime(selectedEvent.startDateTime)}</p>
              </div>
              <StatusBadge value={selectedEvent.status} options={EVENT_STATUS} />
            </div>
            <dl className="details-list">
              <div>
                <dt>Local</dt>
                <dd>{selectedEvent.locationName || "Não informado"}</dd>
              </div>
              <div>
                <dt>Responsável</dt>
                <dd>{selectedEvent.primaryResponsible || "Não informado"}</dd>
              </div>
              <div>
                <dt>Orçamento</dt>
                <dd>
                  {Number(selectedEvent.budgetLimit || 0) > 0
                    ? formatCurrency(selectedEvent.budgetLimit)
                    : "Não definido"}
                </dd>
              </div>
              <div>
                <dt>Público estimado</dt>
                <dd>{selectedEvent.estimatedAudience || 0} pessoas</dd>
              </div>
            </dl>
          </Card>

          <div className="overview-grid">
            <Card>
              <div className="card-heading">
                <h2>Tarefas e responsáveis</h2>
              </div>
              <ul className="compact-list">
                {tasks.slice(0, 8).map((task) => (
                  <li key={task.id}>
                    <div>
                      <strong>{task.title}</strong>
                      <span>{task.responsible || "Sem responsável"}</span>
                    </div>
                    <StatusBadge value={task.status} options={TASK_STATUS} />
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <div className="card-heading">
                <h2>Itens e materiais</h2>
              </div>
              <ul className="compact-list">
                {items.slice(0, 8).map((item) => (
                  <li key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.quantity || "Quantidade não informada"}</span>
                    </div>
                    <StatusBadge value={item.status} options={ITEM_STATUS} />
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>
      ) : (
        <InlineAlert>
          Selecione um evento para consultar resumo, orçamento, materiais, tarefas e cronograma.
        </InlineAlert>
      )}
    </section>
  );
};

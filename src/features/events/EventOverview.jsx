import { useMemo } from "react";
import { useEventRecords } from "../../hooks/useEventRecords";
import { Card } from "../../components/ui/Card";
import { MetricGrid } from "../../components/ui/MetricGrid";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { EVENT_STATUS, ITEM_STATUS, TASK_STATUS } from "../../constants/eventOptions";
import { formatCurrency, formatDateTime, formatStatus } from "../../utils/formatters";

export const EventOverview = ({ event }) => {
  const tasks = useEventRecords(event.id, "tasks");
  const items = useEventRecords(event.id, "items");
  const budget = useEventRecords(event.id, "budget");
  const schedule = useEventRecords(event.id, "schedule");

  const metrics = useMemo(() => {
    const pendingTasks = tasks.records.filter(
      (task) => !["concluida", "cancelada"].includes(task.status)
    ).length;
    const missingItems = items.records.filter((item) =>
      ["necessario", "indisponivel"].includes(item.status)
    ).length;
    const totalBudget = budget.records.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitValue || 0),
      0
    );

    return [
      { label: "Tarefas pendentes", value: pendingTasks },
      { label: "Itens em atenção", value: missingItems },
      { label: "Orçamento previsto", value: formatCurrency(totalBudget) },
      { label: "Etapas no cronograma", value: schedule.records.length }
    ];
  }, [budget.records, items.records, schedule.records.length, tasks.records]);

  const nextScheduleItems = schedule.records.slice(0, 4);
  const pendingTasks = tasks.records
    .filter((task) => !["concluida", "cancelada"].includes(task.status))
    .slice(0, 5);

  return (
    <section className="section-stack">
      <MetricGrid items={metrics} />

      <div className="overview-grid">
        <Card>
          <div className="card-heading">
            <h2>Resumo do evento</h2>
            <StatusBadge value={event.status} options={EVENT_STATUS} />
          </div>
          <dl className="details-list">
            <div>
              <dt>Início</dt>
              <dd>{formatDateTime(event.startDateTime)}</dd>
            </div>
            <div>
              <dt>Término</dt>
              <dd>{formatDateTime(event.endDateTime)}</dd>
            </div>
            <div>
              <dt>Local</dt>
              <dd>{event.locationName || "Não informado"}</dd>
            </div>
            <div>
              <dt>Público estimado</dt>
              <dd>{event.estimatedAudience || 0} pessoas</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <div className="card-heading">
            <h2>Pendências importantes</h2>
          </div>
          {pendingTasks.length ? (
            <ul className="compact-list">
              {pendingTasks.map((task) => (
                <li key={task.id}>
                  <div>
                    <strong>{task.title}</strong>
                    <span>{task.responsible || "Sem responsável definido"}</span>
                  </div>
                  <StatusBadge value={task.status} options={TASK_STATUS} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted-text">Nenhuma tarefa pendente registrada.</p>
          )}
        </Card>

        <Card>
          <div className="card-heading">
            <h2>Próximos horários</h2>
          </div>
          {nextScheduleItems.length ? (
            <ul className="compact-list">
              {nextScheduleItems.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.startTime} - {item.title}</strong>
                    <span>{item.location || item.responsible || "Detalhes não informados"}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted-text">Cronograma ainda não definido.</p>
          )}
        </Card>

        <Card>
          <div className="card-heading">
            <h2>Materiais em atenção</h2>
          </div>
          {items.records.length ? (
            <ul className="compact-list">
              {items.records.slice(0, 5).map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.origin || "Origem não informada"}</span>
                  </div>
                  <StatusBadge value={item.status} options={ITEM_STATUS} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted-text">Nenhum material registrado.</p>
          )}
        </Card>
      </div>
    </section>
  );
};

import { useMemo, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { InlineAlert } from "../../components/ui/InlineAlert";
import { LoadingOverlay } from "../../components/ui/LoadingOverlay";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { EVENT_STATUS } from "../../constants/eventOptions";
import { useAuth } from "../../contexts/AuthContext";
import { useEvents } from "../../hooks/useEvents";
import { formatDateTime, formatWeekday, toDate } from "../../utils/formatters";
import { CreateEventModal } from "../../features/events/CreateEventModal";
import { EventCard } from "../../features/events/EventCard";

export const HomePage = () => {
  const { upcomingEvents, events, isLoading, error, loadEvents } = useEvents();
  const { profile } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const canManage = ["administrador", "organizador", "colaborador"].includes(profile?.role);

  const weekEvents = useMemo(() => {
    const now = new Date();
    const weekLimit = new Date();
    weekLimit.setDate(now.getDate() + 7);

    return events
      .filter((event) => {
        const date = toDate(event.startDateTime);
        return date && date >= now && date <= weekLimit && !event.archived;
      })
      .slice(0, 6);
  }, [events]);

  const attentionEvents = useMemo(
    () =>
      events
        .filter((event) => ["planejado", "em_andamento"].includes(event.status) && !event.archived)
        .slice(0, 5),
    [events]
  );

  return (
    <section className="page-stack">
      <PageHeader
        title="Início"
        description="Próximos eventos, pendências relevantes e agenda da semana."
        actions={
          canManage ? (
            <Button onClick={() => setIsCreateOpen(true)}>
              Criar evento
            </Button>
          ) : null
        }
      />

      {error ? <InlineAlert tone="danger">{error}</InlineAlert> : null}

      {isLoading ? (
        <LoadingOverlay isVisible inline message="Carregando visão geral..." />
      ) : (
        <>
          <div className="dashboard-grid">
            <Card className="dashboard-card dashboard-card--wide">
              <div className="card-heading">
                <div>
                  <h2>Próximos eventos</h2>
                  <p>Ordenados pela data mais próxima.</p>
                </div>
              </div>
              {upcomingEvents.length ? (
                <div className="event-list">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Nenhum evento próximo"
                  message="Quando houver eventos futuros, eles aparecerão aqui."
                  actionLabel={canManage ? "Criar evento" : undefined}
                  onAction={canManage ? () => setIsCreateOpen(true) : undefined}
                />
              )}
            </Card>

            <Card>
              <div className="card-heading">
                <h2>Pendências importantes</h2>
              </div>
              {attentionEvents.length ? (
                <ul className="compact-list">
                  {attentionEvents.map((event) => (
                    <li key={event.id}>
                      <div>
                        <strong>{event.name}</strong>
                        <span>{formatDateTime(event.startDateTime)}</span>
                      </div>
                      <StatusBadge value={event.status} options={EVENT_STATUS} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted-text">Nenhuma pendência geral registrada.</p>
              )}
            </Card>

            <Card>
              <div className="card-heading">
                <h2>Agenda da semana</h2>
              </div>
              {weekEvents.length ? (
                <ul className="timeline-list">
                  {weekEvents.map((event) => (
                    <li key={event.id}>
                      <time>{formatWeekday(event.startDateTime)}</time>
                      <div>
                        <strong>{event.name}</strong>
                        <span>{event.locationName || "Local não informado"}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted-text">Nenhum compromisso nos próximos sete dias.</p>
              )}
            </Card>
          </div>
        </>
      )}

      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={loadEvents}
      />
    </section>
  );
};

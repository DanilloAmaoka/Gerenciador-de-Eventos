import { useMemo, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { InlineAlert } from "../../components/ui/InlineAlert";
import { LoadingOverlay } from "../../components/ui/LoadingOverlay";
import { PageHeader } from "../../components/ui/PageHeader";
import { ConfirmationDialog } from "../../components/feedback/ConfirmationDialog";
import { EVENT_STATUS } from "../../constants/eventOptions";
import { useAuth } from "../../contexts/AuthContext";
import { useFeedback } from "../../contexts/FeedbackContext";
import { useEvents } from "../../hooks/useEvents";
import { archiveEvent } from "../../services/eventsService";
import { CreateEventModal } from "../../features/events/CreateEventModal";
import { EventCard } from "../../features/events/EventCard";

export const EventsPage = () => {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    responsible: "",
    location: ""
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [archivingEvent, setArchivingEvent] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const { events, isLoading, error, searchEvents, loadEvents } = useEvents();
  const { user, profile } = useAuth();
  const { notifyError, notifySuccess } = useFeedback();
  const canManage = ["administrador", "organizador", "colaborador"].includes(profile?.role);

  const filteredEvents = useMemo(() => searchEvents(filters), [filters, searchEvents]);

  const updateFilter = (name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      responsible: "",
      location: ""
    });
  };

  const confirmArchive = async () => {
    if (!archivingEvent) {
      return;
    }

    setIsArchiving(true);

    try {
      await archiveEvent(archivingEvent.id, user);
      const archivedName = archivingEvent.name;
      setArchivingEvent(null);
      notifySuccess({
        title: "Evento arquivado",
        message: `${archivedName} foi removido da listagem ativa.`
      });
      await loadEvents();
    } catch {
      notifyError({
        message: "Não foi possível arquivar o evento. Tente novamente."
      });
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <section className="page-stack">
      <PageHeader
        title="Eventos"
        description="Pesquise, filtre e acesse as áreas completas de trabalho dos eventos."
        actions={
          canManage ? (
            <Button onClick={() => setIsCreateOpen(true)}>
              Novo evento
            </Button>
          ) : null
        }
      />

      <Card>
        <div className="filters-grid">
          <label className="form-field" htmlFor="event-search">
            <span className="form-field__label">Pesquisar</span>
            <input
              id="event-search"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Nome, local, responsável..."
            />
          </label>
          <label className="form-field" htmlFor="event-status">
            <span className="form-field__label">Status</span>
            <select
              id="event-status"
              value={filters.status}
              onChange={(event) => updateFilter("status", event.target.value)}
            >
              <option value="">Todos</option>
              {EVENT_STATUS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field" htmlFor="event-responsible">
            <span className="form-field__label">Responsável</span>
            <input
              id="event-responsible"
              value={filters.responsible}
              onChange={(event) => updateFilter("responsible", event.target.value)}
            />
          </label>
          <label className="form-field" htmlFor="event-location">
            <span className="form-field__label">Local</span>
            <input
              id="event-location"
              value={filters.location}
              onChange={(event) => updateFilter("location", event.target.value)}
            />
          </label>
          <Button variant="secondary" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </div>
      </Card>

      {error ? <InlineAlert tone="danger">{error}</InlineAlert> : null}

      {isLoading ? (
        <LoadingOverlay isVisible inline message="Carregando eventos..." />
      ) : filteredEvents.length ? (
        <div className="event-list">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onArchive={canManage ? setArchivingEvent : undefined}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum evento encontrado"
          message="Ajuste os filtros ou crie um novo evento para começar o planejamento."
          actionLabel={canManage ? "Novo evento" : undefined}
          onAction={canManage ? () => setIsCreateOpen(true) : undefined}
        />
      )}

      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={loadEvents}
      />

      <ConfirmationDialog
        isOpen={Boolean(archivingEvent)}
        title="Arquivar evento"
        message={
          archivingEvent
            ? `Você está prestes a arquivar "${archivingEvent.name}". O evento deixará a listagem ativa.`
            : ""
        }
        confirmLabel="Arquivar evento"
        isLoading={isArchiving}
        onCancel={() => setArchivingEvent(null)}
        onConfirm={confirmArchive}
      />
    </section>
  );
};

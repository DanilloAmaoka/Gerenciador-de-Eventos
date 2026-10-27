import { useState } from "react";
import { EVENT_STATUS } from "../../constants/eventOptions";
import { useAuth } from "../../contexts/AuthContext";
import { useFeedback } from "../../contexts/FeedbackContext";
import { updateEvent } from "../../services/eventsService";
import { formatDateTime } from "../../utils/formatters";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { EventForm } from "./EventForm";

export const PlanningSection = ({ event, onUpdated }) => {
  const { user, profile } = useAuth();
  const { notifyError, notifySuccess } = useFeedback();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDirtyForm, setHasDirtyForm] = useState(false);
  const canManage = ["administrador", "organizador", "colaborador"].includes(profile?.role);

  const saveEvent = async (values) => {
    setIsSaving(true);

    try {
      await updateEvent(event.id, values, user);
      setIsEditing(false);
      setHasDirtyForm(false);
      notifySuccess({
        title: "Planejamento salvo",
        message: "As informações gerais do evento foram atualizadas."
      });
      onUpdated?.();
    } catch {
      notifyError({
        message: "Não foi possível salvar o planejamento. Tente novamente."
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="section-stack">
      <div className="section-heading">
        <div>
          <h2>Planejamento</h2>
          <p>Informações gerais, objetivo, público, horários e responsáveis.</p>
        </div>
        {canManage ? (
          <Button onClick={() => setIsEditing(true)}>
            Editar planejamento
          </Button>
        ) : null}
      </div>

      <Card>
        <dl className="details-list details-list--wide">
          <div>
            <dt>Evento</dt>
            <dd>{event.name}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <StatusBadge value={event.status} options={EVENT_STATUS} />
            </dd>
          </div>
          <div>
            <dt>Tipo</dt>
            <dd>{event.type || "Não informado"}</dd>
          </div>
          <div>
            <dt>Responsável principal</dt>
            <dd>{event.primaryResponsible || "Não informado"}</dd>
          </div>
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
          <div className="details-list__full">
            <dt>Descrição ou objetivo</dt>
            <dd>{event.description || "Não informado"}</dd>
          </div>
          <div className="details-list__full">
            <dt>Observações</dt>
            <dd>{event.notes || "Não informado"}</dd>
          </div>
        </dl>
      </Card>

      <Modal
        isOpen={isEditing}
        title="Editar planejamento"
        description="Atualize as informações centrais deste evento."
        size="lg"
        onClose={() => setIsEditing(false)}
        hasUnsavedChanges={hasDirtyForm && !isSaving}
        closeOnOverlay={!isSaving}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" form="event-form" isLoading={isSaving}>
              Salvar alterações
            </Button>
          </>
        }
      >
        <EventForm event={event} onSubmit={saveEvent} onDirtyChange={setHasDirtyForm} />
      </Modal>
    </section>
  );
};

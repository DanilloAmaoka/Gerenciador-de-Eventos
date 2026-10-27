import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { getEventPath } from "../../constants/routes";
import { useAuth } from "../../contexts/AuthContext";
import { useFeedback } from "../../contexts/FeedbackContext";
import { createEvent } from "../../services/eventsService";
import { EventForm } from "./EventForm";

export const CreateEventModal = ({ isOpen, onClose, onCreated }) => {
  const { user } = useAuth();
  const { notifyError, notifySuccess } = useFeedback();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [hasDirtyForm, setHasDirtyForm] = useState(false);

  const closeModal = () => {
    setHasDirtyForm(false);
    onClose?.();
  };

  const saveEvent = async (values) => {
    setIsSaving(true);

    try {
      const eventId = await createEvent(values, user);
      closeModal();
      notifySuccess({
        title: "Evento criado",
        message: "A área de trabalho do novo evento já está disponível."
      });
      await onCreated?.();
      navigate(getEventPath(eventId));
    } catch {
      notifyError({
        message: "Não foi possível criar o evento. Verifique os dados e tente novamente."
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Novo evento"
      description="Crie apenas a identidade básica. O planejamento completo começa na página do evento."
      size="lg"
      onClose={closeModal}
      hasUnsavedChanges={hasDirtyForm && !isSaving}
      closeOnOverlay={!isSaving}
      footer={
        <>
          <Button variant="secondary" onClick={closeModal} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" form="event-form" isLoading={isSaving}>
            Criar evento
          </Button>
        </>
      }
    >
      <EventForm onSubmit={saveEvent} onDirtyChange={setHasDirtyForm} />
    </Modal>
  );
};

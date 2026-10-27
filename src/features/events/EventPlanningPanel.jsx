import { useMemo, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { InlineAlert } from "../../components/ui/InlineAlert";
import { LoadingOverlay } from "../../components/ui/LoadingOverlay";
import { Modal } from "../../components/ui/Modal";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ConfirmationDialog } from "../../components/feedback/ConfirmationDialog";
import { EVENT_STATUS } from "../../constants/eventOptions";
import { PLANNING_SECTIONS } from "../../constants/planningSections";
import { useAuth } from "../../contexts/AuthContext";
import { useFeedback } from "../../contexts/FeedbackContext";
import { useEventPlanningData } from "../../hooks/useEventPlanningData";
import {
  createEventRecord,
  deleteEventRecord,
  updateEventRecord
} from "../../services/eventRecordsService";
import { updateEvent } from "../../services/eventsService";
import { formatDateTime } from "../../utils/formatters";
import { getPlanningRecordTitle } from "../../utils/planningDisplay";
import { DynamicPlanningForm } from "./DynamicPlanningForm";
import { EventFinancialSummary } from "./EventFinancialSummary";
import { EventForm } from "./EventForm";
import { PlanningRecordList } from "./PlanningRecordList";
import { PlanningSectionCard } from "./PlanningSectionCard";

export const EventPlanningPanel = ({ event, onEventUpdated }) => {
  const [activeSectionId, setActiveSectionId] = useState("food");
  const [editingEvent, setEditingEvent] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasDirtyForm, setHasDirtyForm] = useState(false);
  const { user, profile } = useAuth();
  const { notifyError, notifySuccess } = useFeedback();
  const { recordsBySection, isLoading, error, financials, loadPlanningData } =
    useEventPlanningData(event.id, event.budgetLimit);
  const canManage = ["administrador", "organizador", "colaborador"].includes(profile?.role);

  const activeSection = useMemo(
    () => PLANNING_SECTIONS.find((section) => section.id === activeSectionId) || PLANNING_SECTIONS[0],
    [activeSectionId]
  );

  const activeRecords = recordsBySection[activeSection.id] || [];

  const openCreateRecord = () => {
    setEditingRecord(null);
    setHasDirtyForm(false);
    setIsRecordFormOpen(true);
  };

  const openEditRecord = (record) => {
    setEditingRecord(record);
    setHasDirtyForm(false);
    setIsRecordFormOpen(true);
  };

  const closeRecordForm = () => {
    setIsRecordFormOpen(false);
    setEditingRecord(null);
    setHasDirtyForm(false);
  };

  const saveEvent = async (values) => {
    setIsSaving(true);

    try {
      await updateEvent(event.id, values, user);
      setEditingEvent(false);
      setHasDirtyForm(false);
      notifySuccess({
        title: "Evento atualizado",
        message: "As informações principais foram salvas."
      });
      await onEventUpdated?.();
    } catch {
      notifyError({
        message: "Não foi possível salvar o evento. Tente novamente."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveRecord = async (values) => {
    setIsSaving(true);

    try {
      if (editingRecord) {
        await updateEventRecord(activeSection.collection, editingRecord.id, values, user);
        closeRecordForm();
        notifySuccess({
          title: "Registro atualizado",
          message: `${activeSection.singular} foi atualizado.`
        });
      } else {
        await createEventRecord(activeSection.collection, event.id, values, user);
        closeRecordForm();
        notifySuccess({
          title: "Registro adicionado",
          message: `${activeSection.singular} foi vinculado ao evento.`
        });
      }

      await loadPlanningData();
    } catch {
      notifyError({
        message: "Não foi possível salvar o registro. Verifique os dados e tente novamente."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingRecord) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteEventRecord(activeSection.collection, deletingRecord.id);
      const removedTitle = getPlanningRecordTitle(activeSection.id, deletingRecord);
      setDeletingRecord(null);
      notifySuccess({
        title: "Registro removido",
        message: `${removedTitle} foi removido do planejamento.`
      });
      await loadPlanningData();
    } catch {
      notifyError({
        message: "Não foi possível remover o registro. Tente novamente."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="event-planning-panel">
      <section className="event-hero">
        <div className="event-hero__content">
          <span className="event-hero__eyebrow">Planejamento do evento</span>
          <h1>{event.name}</h1>
          <p>{event.description || "Organize todas as áreas necessárias para este evento."}</p>
          <div className="event-hero__meta">
            <span>{formatDateTime(event.startDateTime)}</span>
            <span>{event.locationName || "Local não definido"}</span>
            <span>{event.primaryResponsible || "Responsável não definido"}</span>
          </div>
        </div>
        <div className="event-hero__side">
          <StatusBadge value={event.status} options={EVENT_STATUS} />
          {canManage ? (
            <Button
              variant="secondary"
              onClick={() => {
                setHasDirtyForm(false);
                setEditingEvent(true);
              }}
            >
              Editar evento
            </Button>
          ) : null}
        </div>
      </section>

      <EventFinancialSummary financials={financials} />

      {error ? <InlineAlert tone="danger">{error}</InlineAlert> : null}

      {isLoading ? (
        <LoadingOverlay isVisible inline message="Carregando planejamento..." />
      ) : (
        <>
          <section className="planning-navigation" aria-label="Áreas do planejamento">
            {PLANNING_SECTIONS.map((section) => (
              <PlanningSectionCard
                key={section.id}
                section={section}
                records={recordsBySection[section.id] || []}
                isActive={section.id === activeSection.id}
                onClick={() => setActiveSectionId(section.id)}
              />
            ))}
          </section>

          <Card className="planning-section-panel">
            <div className="section-heading">
              <div>
                <span className={`section-icon section-icon--${activeSection.tone}`} aria-hidden="true">
                  {activeSection.icon}
                </span>
                <h2>{activeSection.title}</h2>
                <p>{activeSection.description}</p>
              </div>
              {canManage ? (
                <Button onClick={openCreateRecord}>
                  {activeSection.addLabel}
                </Button>
              ) : null}
            </div>

            {activeSection.id === "documents" ? (
              <InlineAlert title="Compatível com Firebase Spark">
                Registre links externos para documentos e imagens, evitando armazenar arquivos pesados no Firebase.
              </InlineAlert>
            ) : null}

            <PlanningRecordList
              section={activeSection}
              records={activeRecords}
              canManage={canManage}
              onCreate={openCreateRecord}
              onEdit={openEditRecord}
              onDelete={setDeletingRecord}
            />
          </Card>
        </>
      )}

      <Modal
        isOpen={editingEvent}
        title="Editar evento"
        description="Atualize somente as informações principais do evento."
        size="lg"
        onClose={() => setEditingEvent(false)}
        hasUnsavedChanges={hasDirtyForm && !isSaving}
        closeOnOverlay={!isSaving}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingEvent(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" form="event-form" isLoading={isSaving}>
              Salvar evento
            </Button>
          </>
        }
      >
        <EventForm event={event} onSubmit={saveEvent} onDirtyChange={setHasDirtyForm} />
      </Modal>

      <Modal
        isOpen={isRecordFormOpen}
        title={editingRecord ? `Editar ${activeSection.singular}` : activeSection.addLabel}
        description="Comece pelos dados essenciais. Campos adicionais aparecem quando fizerem sentido."
        size="lg"
        onClose={closeRecordForm}
        hasUnsavedChanges={hasDirtyForm && !isSaving}
        closeOnOverlay={!isSaving}
        footer={
          <>
            <Button variant="secondary" onClick={closeRecordForm} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" form="planning-record-form" isLoading={isSaving}>
              Salvar
            </Button>
          </>
        }
      >
        <DynamicPlanningForm
          section={activeSection}
          record={editingRecord}
          onSubmit={saveRecord}
          onDirtyChange={setHasDirtyForm}
        />
      </Modal>

      <ConfirmationDialog
        isOpen={Boolean(deletingRecord)}
        title="Remover registro"
        message={
          deletingRecord
            ? `Você está prestes a remover "${getPlanningRecordTitle(
                activeSection.id,
                deletingRecord
              )}" do planejamento.`
            : ""
        }
        confirmLabel="Remover registro"
        isLoading={isDeleting}
        onCancel={() => setDeletingRecord(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

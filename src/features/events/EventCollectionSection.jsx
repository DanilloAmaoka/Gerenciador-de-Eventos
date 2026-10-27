import { useMemo, useState } from "react";
import { RECORD_CONFIGS } from "../../constants/recordConfigs";
import { useAuth } from "../../contexts/AuthContext";
import { useFeedback } from "../../contexts/FeedbackContext";
import { useEventRecords } from "../../hooks/useEventRecords";
import {
  createEventRecord,
  deleteEventRecord,
  updateEventRecord
} from "../../services/eventRecordsService";
import { formatCurrency } from "../../utils/formatters";
import { getRecordLabel, groupBy } from "../../utils/records";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { EmptyState } from "../../components/ui/EmptyState";
import { InlineAlert } from "../../components/ui/InlineAlert";
import { LoadingOverlay } from "../../components/ui/LoadingOverlay";
import { MetricGrid } from "../../components/ui/MetricGrid";
import { Modal } from "../../components/ui/Modal";
import { ConfirmationDialog } from "../../components/feedback/ConfirmationDialog";
import { RecordForm } from "./RecordForm";

export const EventCollectionSection = ({ eventId, recordType }) => {
  const config = RECORD_CONFIGS[recordType];
  const { records, isLoading, error, loadRecords } = useEventRecords(eventId, recordType);
  const { user, profile } = useAuth();
  const { notifyError, notifySuccess } = useFeedback();
  const [editingRecord, setEditingRecord] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasDirtyForm, setHasDirtyForm] = useState(false);

  const canManage = ["administrador", "organizador", "colaborador"].includes(profile?.role);

  const budgetMetrics = useMemo(() => {
    if (recordType !== "budget") {
      return [];
    }

    const total = records.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitValue || 0),
      0
    );
    const byCategory = groupBy(records, "category");

    return [
      { label: "Total geral", value: formatCurrency(total) },
      { label: "Categorias", value: Object.keys(byCategory).length },
      { label: "Despesas", value: records.length }
    ];
  }, [recordType, records]);

  if (!config) {
    return null;
  }

  const openCreateModal = () => {
    setEditingRecord(null);
    setHasDirtyForm(false);
    setIsFormOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setHasDirtyForm(false);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingRecord(null);
    setHasDirtyForm(false);
  };

  const saveRecord = async (values) => {
    setIsSaving(true);

    try {
      if (editingRecord) {
        await updateEventRecord(config.collection, editingRecord.id, values, user);
        closeForm();
        notifySuccess({
          title: "Alterações salvas",
          message: `O registro de ${config.singular} foi atualizado.`
        });
      } else {
        await createEventRecord(config.collection, eventId, values, user);
        closeForm();
        notifySuccess({
          title: "Registro adicionado",
          message: `O novo registro de ${config.singular} foi vinculado ao evento.`
        });
      }

      await loadRecords();
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
      await deleteEventRecord(config.collection, deletingRecord.id);
      const removedLabel = getRecordLabel(deletingRecord, config.singular);
      setDeletingRecord(null);
      notifySuccess({
        title: "Registro removido",
        message: `${removedLabel} foi removido do evento.`
      });
      await loadRecords();
    } catch {
      notifyError({
        message: "Não foi possível remover o registro. Tente novamente."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="section-stack">
      <div className="section-heading">
        <div>
          <h2>{config.title}</h2>
          <p>{config.emptyMessage}</p>
        </div>
        {canManage ? (
          <Button onClick={openCreateModal}>
            {config.addLabel}
          </Button>
        ) : null}
      </div>

      {recordType === "documents" ? (
        <InlineAlert title="Arquivos no plano gratuito">
          Para manter compatibilidade com o Firebase Spark, registre links externos em vez de
          enviar arquivos pesados diretamente para o Firebase.
        </InlineAlert>
      ) : null}

      {budgetMetrics.length ? <MetricGrid items={budgetMetrics} /> : null}

      <Card>
        {isLoading ? (
          <LoadingOverlay isVisible inline message="Carregando registros..." />
        ) : error ? (
          <InlineAlert tone="danger">{error}</InlineAlert>
        ) : records.length ? (
          <DataTable
            columns={config.columns}
            rows={records}
            onEdit={canManage ? openEditModal : undefined}
            onDelete={canManage ? setDeletingRecord : undefined}
          />
        ) : (
          <EmptyState
            title={config.emptyTitle}
            message={config.emptyMessage}
            actionLabel={canManage ? config.addLabel : undefined}
            onAction={canManage ? openCreateModal : undefined}
          />
        )}
      </Card>

      <Modal
        isOpen={isFormOpen}
        title={editingRecord ? `Editar ${config.singular}` : config.addLabel}
        description="Preencha somente as informações necessárias para esta etapa do evento."
        size="lg"
        onClose={closeForm}
        hasUnsavedChanges={hasDirtyForm && !isSaving}
        closeOnOverlay={!isSaving}
        footer={
          <>
            <Button variant="secondary" onClick={closeForm} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" form="record-form" isLoading={isSaving}>
              Salvar
            </Button>
          </>
        }
      >
        <RecordForm
          config={config}
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
            ? `Você está prestes a remover "${getRecordLabel(
                deletingRecord,
                config.singular
              )}" deste evento.`
            : ""
        }
        confirmLabel="Remover registro"
        isLoading={isDeleting}
        onCancel={() => setDeletingRecord(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
};

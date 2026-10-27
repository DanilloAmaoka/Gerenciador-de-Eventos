import { useCallback, useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { EmptyState } from "../../components/ui/EmptyState";
import { InlineAlert } from "../../components/ui/InlineAlert";
import { LoadingOverlay } from "../../components/ui/LoadingOverlay";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { ConfirmationDialog } from "../../components/feedback/ConfirmationDialog";
import { useAuth } from "../../contexts/AuthContext";
import { useFeedback } from "../../contexts/FeedbackContext";
import {
  createTemplate,
  deleteTemplate,
  listTemplates,
  updateTemplate
} from "../../services/templatesService";
import { RecordForm } from "../../features/events/RecordForm";

const TEMPLATE_CONFIG = {
  title: "Modelos",
  singular: "modelo",
  defaults: {},
  columns: [
    { key: "name", label: "Modelo" },
    { key: "type", label: "Tipo" },
    { key: "description", label: "Descrição" }
  ],
  fields: [
    { name: "name", label: "Nome do modelo", type: "text", required: true },
    { name: "type", label: "Tipo de evento", type: "text", required: true },
    { name: "description", label: "Descrição", type: "textarea" },
    {
      name: "defaultFood",
      label: "Alimentação padrão",
      type: "textarea",
      helper: "Uma linha por alimento, bebida ou preparação recorrente."
    },
    {
      name: "defaultPeople",
      label: "Pessoas ou funções padrão",
      type: "textarea",
      helper: "Uma linha por função, equipe ou participante recorrente."
    },
    {
      name: "defaultTasks",
      label: "Tarefas padrão",
      type: "textarea",
      helper: "Use uma linha para cada tarefa sugerida."
    },
    {
      name: "defaultItems",
      label: "Itens e materiais padrão",
      type: "textarea",
      helper: "Use uma linha para cada item recorrente."
    },
    {
      name: "defaultExpenses",
      label: "Despesas comuns",
      type: "textarea",
      helper: "Uma linha por gasto que normalmente ocorre nesse tipo de evento."
    },
    {
      name: "defaultSchedule",
      label: "Cronograma padrão",
      type: "textarea",
      helper: "Exemplo: 08:00 - Recepção."
    }
  ]
};

export const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deletingTemplate, setDeletingTemplate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasDirtyForm, setHasDirtyForm] = useState(false);
  const { user, profile } = useAuth();
  const { notifyError, notifySuccess } = useFeedback();
  const canManage = ["administrador", "organizador", "colaborador"].includes(profile?.role);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setTemplates(await listTemplates());
    } catch {
      setError("Não foi possível carregar os modelos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const openCreateModal = () => {
    setEditingTemplate(null);
    setHasDirtyForm(false);
    setIsFormOpen(true);
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setHasDirtyForm(false);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTemplate(null);
    setHasDirtyForm(false);
  };

  const saveTemplate = async (values) => {
    setIsSaving(true);

    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, values, user);
        notifySuccess({
          title: "Modelo atualizado",
          message: "As alterações do modelo foram salvas."
        });
      } else {
        await createTemplate(values, user);
        notifySuccess({
          title: "Modelo criado",
          message: "O modelo está disponível para planejamento futuro."
        });
      }

      closeForm();
      await loadTemplates();
    } catch {
      notifyError({
        message: "Não foi possível salvar o modelo. Tente novamente."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingTemplate) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteTemplate(deletingTemplate.id);
      const removedName = deletingTemplate.name;
      setDeletingTemplate(null);
      notifySuccess({
        title: "Modelo removido",
        message: `${removedName} foi removido.`
      });
      await loadTemplates();
    } catch {
      notifyError({
        message: "Não foi possível remover o modelo."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="page-stack">
      <PageHeader
        title="Modelos"
        description="Estruturas reutilizáveis para eventos recorrentes ou semelhantes."
        actions={canManage ? <Button onClick={openCreateModal}>Novo modelo</Button> : null}
      />

      {error ? <InlineAlert tone="danger">{error}</InlineAlert> : null}

      <Card>
        {isLoading ? (
          <LoadingOverlay isVisible inline message="Carregando modelos..." />
        ) : templates.length ? (
          <DataTable
            columns={TEMPLATE_CONFIG.columns}
            rows={templates}
            onEdit={canManage ? openEditModal : undefined}
            onDelete={canManage ? setDeletingTemplate : undefined}
          />
        ) : (
          <EmptyState
            title="Nenhum modelo criado"
            message="Use modelos para preservar estruturas de eventos recorrentes."
            actionLabel={canManage ? "Novo modelo" : undefined}
            onAction={canManage ? openCreateModal : undefined}
          />
        )}
      </Card>

      <Modal
        isOpen={isFormOpen}
        title={editingTemplate ? "Editar modelo" : "Novo modelo"}
        description="Registre apenas estruturas reutilizáveis, sem vincular histórico de eventos anteriores."
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
              Salvar modelo
            </Button>
          </>
        }
      >
        <RecordForm
          config={TEMPLATE_CONFIG}
          record={editingTemplate}
          onSubmit={saveTemplate}
          onDirtyChange={setHasDirtyForm}
        />
      </Modal>

      <ConfirmationDialog
        isOpen={Boolean(deletingTemplate)}
        title="Remover modelo"
        message={
          deletingTemplate
            ? `Você está prestes a remover "${deletingTemplate.name}".`
            : ""
        }
        confirmLabel="Remover modelo"
        isLoading={isDeleting}
        onCancel={() => setDeletingTemplate(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
};

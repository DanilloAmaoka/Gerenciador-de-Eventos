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
import { ROLE_OPTIONS } from "../../constants/eventOptions";
import { useAuth } from "../../contexts/AuthContext";
import { useFeedback } from "../../contexts/FeedbackContext";
import { RecordForm } from "../../features/events/RecordForm";
import {
  createLocation,
  deleteLocation,
  listLocations,
  updateLocation
} from "../../services/locationsService";
import { listUsers, saveUserProfile } from "../../services/usersService";

const LOCATION_CONFIG = {
  singular: "local",
  defaults: {},
  columns: [
    { key: "name", label: "Local" },
    { key: "address", label: "Endereço/referência" },
    { key: "capacity", label: "Capacidade" },
    { key: "notes", label: "Observações" }
  ],
  fields: [
    { name: "name", label: "Nome do local", type: "text", required: true },
    { name: "address", label: "Endereço ou referência", type: "text" },
    { name: "capacity", label: "Capacidade estimada", type: "number", min: 0 },
    { name: "resources", label: "Recursos disponíveis", type: "textarea" },
    { name: "notes", label: "Observações", type: "textarea" }
  ]
};

const USER_CONFIG = {
  singular: "perfil de usuário",
  defaults: { role: "consulta" },
  columns: [
    { key: "name", label: "Nome" },
    { key: "email", label: "E-mail" },
    { key: "role", label: "Perfil" }
  ],
  fields: [
    {
      name: "uid",
      label: "Identificador do usuário",
      type: "text",
      required: true,
      helper: "Use o identificador da conta já autorizada para acesso."
    },
    { name: "name", label: "Nome", type: "text", required: true },
    { name: "email", label: "E-mail", type: "email", required: true },
    { name: "role", label: "Perfil", type: "select", options: ROLE_OPTIONS, required: true },
    { name: "notes", label: "Observações", type: "textarea" }
  ]
};

const SettingsCollection = ({
  title,
  description,
  config,
  loadItems,
  createItem,
  updateItem,
  deleteItem,
  deleteLabel
}) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasDirtyForm, setHasDirtyForm] = useState(false);
  const { user } = useAuth();
  const { notifyError, notifySuccess } = useFeedback();

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setItems(await loadItems());
    } catch {
      setError("Não foi possível carregar os registros.");
    } finally {
      setIsLoading(false);
    }
  }, [loadItems]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openCreateModal = () => {
    setEditingItem(null);
    setHasDirtyForm(false);
    setIsFormOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setHasDirtyForm(false);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setHasDirtyForm(false);
  };

  const saveItem = async (values) => {
    setIsSaving(true);

    try {
      if (editingItem) {
        await updateItem(editingItem.id, values, user);
      } else {
        await createItem(values, user);
      }

      closeForm();
      notifySuccess({
        title: editingItem ? "Registro atualizado" : "Registro criado",
        message: `${config.singular} salvo com sucesso.`
      });
      await refresh();
    } catch {
      notifyError({
        message: "Não foi possível salvar o registro. Tente novamente."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingItem || !deleteItem) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteItem(deletingItem.id);
      const removedName = deletingItem.name || deletingItem.email || "registro";
      setDeletingItem(null);
      notifySuccess({
        title: "Registro removido",
        message: `${removedName} foi removido.`
      });
      await refresh();
    } catch {
      notifyError({
        message: "Não foi possível remover o registro."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <div className="card-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <Button onClick={openCreateModal}>Adicionar</Button>
      </div>

      {error ? <InlineAlert tone="danger">{error}</InlineAlert> : null}

      {isLoading ? (
        <LoadingOverlay isVisible inline message="Carregando registros..." />
      ) : items.length ? (
        <DataTable
          columns={config.columns}
          rows={items}
          onEdit={openEditModal}
          onDelete={deleteItem ? setDeletingItem : undefined}
        />
      ) : (
        <EmptyState
          title="Nenhum registro"
          message={description}
          actionLabel="Adicionar"
          onAction={openCreateModal}
        />
      )}

      <Modal
        isOpen={isFormOpen}
        title={editingItem ? `Editar ${config.singular}` : `Adicionar ${config.singular}`}
        description="Cadastros auxiliares ficam disponíveis para organização dos eventos."
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
          record={editingItem}
          onSubmit={saveItem}
          onDirtyChange={setHasDirtyForm}
        />
      </Modal>

      <ConfirmationDialog
        isOpen={Boolean(deletingItem)}
        title={deleteLabel || "Remover registro"}
        message={
          deletingItem
            ? `Você está prestes a remover "${deletingItem.name || deletingItem.email}".`
            : ""
        }
        confirmLabel={deleteLabel || "Remover registro"}
        isLoading={isDeleting}
        onCancel={() => setDeletingItem(null)}
        onConfirm={confirmDelete}
      />
    </Card>
  );
};

export const SettingsPage = () => (
  <section className="page-stack">
    <PageHeader
      title="Configurações"
      description="Cadastros auxiliares, perfis e preferências administrativas."
    />

    <InlineAlert>
      Permissões visuais não substituem as regras de segurança do banco de dados.
    </InlineAlert>

    <SettingsCollection
      title="Locais reutilizáveis"
      description="Ambientes e referências que podem ser usados no planejamento dos eventos."
      config={LOCATION_CONFIG}
      loadItems={listLocations}
      createItem={createLocation}
      updateItem={updateLocation}
      deleteItem={deleteLocation}
      deleteLabel="Remover local"
    />

    <SettingsCollection
      title="Usuários e permissões"
      description="Perfis autorizados para administração, organização, colaboração ou consulta."
      config={USER_CONFIG}
      loadItems={listUsers}
      createItem={(values, user) => saveUserProfile(values, user?.uid)}
      updateItem={(_, values, user) => saveUserProfile(values, user?.uid)}
    />
  </section>
);

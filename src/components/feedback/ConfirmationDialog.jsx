import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

export const ConfirmationDialog = ({
  isOpen,
  title = "Confirmar ação",
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isLoading = false,
  onCancel,
  onConfirm
}) => (
  <Modal
    isOpen={isOpen}
    title={title}
    description={message}
    size="sm"
    closeOnOverlay={!isLoading}
    onClose={onCancel}
    footer={
      <>
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
          {confirmLabel}
        </Button>
      </>
    }
  >
    <p className="modal-note">
      Esta operação será processada imediatamente após a confirmação.
    </p>
  </Modal>
);

import { Button } from '@/shared/ui/button';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  cancelLabel?: string;
  confirmLabel?: string;
  description?: string;
  isLoading?: boolean;
  isOpen: boolean;
  title: string;
  variant?: 'danger' | 'primary';
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  cancelLabel = 'Отмена',
  confirmLabel = 'Подтвердить',
  description,
  isLoading = false,
  isOpen,
  title,
  variant = 'danger',
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={isLoading ? undefined : onClose}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button isLoading={isLoading} type="button" variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}

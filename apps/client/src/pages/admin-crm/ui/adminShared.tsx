import type { ChangeEventHandler, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { LinkButton } from '@/shared/ui';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { Button } from '@/shared/ui';
import styles from './AdminCrmPages.module.css';

export function AdminPageShell({
  title,
  description,
  backTo,
  backLabel = 'Назад',
  actions,
  isLoading,
  error,
  children,
}: {
  title: string;
  description?: string;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
  isLoading?: boolean;
  error?: unknown;
  children: ReactNode;
}) {
  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageIntro}>
          {backTo ? (
            <div className={styles.inlineActions}>
              <LinkButton size="sm" to={backTo} variant="secondary">
                {backLabel}
              </LinkButton>
            </div>
          ) : null}
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className={styles.pageActions}>{actions}</div> : null}
      </header>
      {isLoading ? <AdminStateCard text="Загрузка..." /> : null}
      {error ? <AdminStateCard text={getApiErrorMessage(error, 'Не удалось загрузить данные')} tone="error" /> : null}
      {!isLoading && !error ? children : null}
    </div>
  );
}

export function AdminPanel({
  title,
  description,
  actions,
  children,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={styles.panel}>
      {title || description || actions ? (
        <header className={styles.panelHeader}>
          <div className={styles.panelHeaderContent}>
            {title ? <h3>{title}</h3> : null}
            {description ? <p>{description}</p> : null}
          </div>
          {actions ? <div className={styles.panelHeaderActions}>{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function AdminStatsGrid({ items }: { items: Array<{ label: string; value: number | string }> }) {
  return (
    <section className={styles.statsGrid}>
      {items.map((item) => (
        <article className={styles.statCard} key={item.label}>
          <span className={styles.statLabel}>{item.label}</span>
          <strong className={styles.statValue}>{item.value}</strong>
        </article>
      ))}
    </section>
  );
}

export function AdminFiltersBar({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <AdminPanel>
      <div className={styles.filtersBar}>
        <div className={styles.toolbarFields}>{children}</div>
        {actions ? <div className={styles.filtersActions}>{actions}</div> : null}
      </div>
    </AdminPanel>
  );
}

export function AdminDataTable<T>({
  columns,
  items,
  getRowKey,
  emptyTitle = 'Данные не найдены',
  onRowClick,
}: {
  columns: Array<{ key: string; title: string; render: (item: T) => ReactNode }>;
  items: T[];
  getRowKey: (item: T) => string;
  emptyTitle?: string;
  onRowClick?: (item: T) => void;
}) {
  if (!items.length) {
    return <AdminEmptyState title={emptyTitle} />;
  }

  return (
    <section className={styles.dataTableCard}>
      <div className={styles.dataTableHeader} style={{ ['--columns' as string]: columns.length }}>
        {columns.map((column) => (
          <strong key={column.key}>{column.title}</strong>
        ))}
      </div>
      {items.map((item) => {
        const content = columns.map((column) => (
          <div className={styles.dataTableCell} key={column.key}>
            {column.render(item)}
          </div>
        ));

        return onRowClick ? (
          <button className={styles.dataTableRowButton} key={getRowKey(item)} style={{ ['--columns' as string]: columns.length }} type="button" onClick={() => onRowClick(item)}>
            {content}
          </button>
        ) : (
          <div className={styles.dataTableRow} key={getRowKey(item)} style={{ ['--columns' as string]: columns.length }}>
            {content}
          </div>
        );
      })}
    </section>
  );
}

export function AdminStatusBadge({ label, tone = 'neutral' }: { label: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'muted' }) {
  return <span className={`${styles.adminStatusBadge} ${styles[`statusTone${capitalize(tone)}`]}`}>{label}</span>;
}

export function AdminDrawer({
  title,
  description,
  isOpen,
  children,
  onClose,
}: {
  title: string;
  description?: string;
  isOpen: boolean;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.drawerOverlay} role="presentation" onMouseDown={onClose}>
      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <header className={styles.drawerHeader}>
          <div>
            <h3>{title}</h3>
            {description ? <p>{description}</p> : null}
          </div>
          <Button size="sm" type="button" variant="secondary" onClick={onClose}>
            Закрыть
          </Button>
        </header>
        <div className={styles.drawerBody}>{children}</div>
      </aside>
    </div>
  );
}

export function AdminConfirmModal({
  title,
  description,
  isOpen,
  isLoading,
  confirmLabel = 'Подтвердить',
  onClose,
  onConfirm,
}: {
  title: string;
  description?: string;
  isOpen: boolean;
  isLoading?: boolean;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} role="presentation" onMouseDown={onClose}>
      <section className={styles.confirmModal} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
        <div className={styles.formActions}>
          <Button isLoading={isLoading} type="button" variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
        </div>
      </section>
    </div>
  );
}

export function AdminFormField({
  label,
  children,
  full,
  hint,
}: {
  label: string;
  children: ReactNode;
  full?: boolean;
  hint?: string;
}) {
  return (
    <label className={`${styles.formField} ${full ? styles.formFieldFull : ''}`}>
      <span>{label}</span>
      {children}
      {hint ? <small className={styles.fieldHint}>{hint}</small> : null}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement> & { onValueChange?: (value: string) => void }) {
  const { onValueChange, onChange, ...rest } = props;
  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange?.(event);
    onValueChange?.(event.target.value);
  };
  return <input {...rest} onChange={handleChange} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement> & { onValueChange?: (value: string) => void }) {
  const { onValueChange, onChange, ...rest } = props;
  const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    onChange?.(event);
    onValueChange?.(event.target.value);
  };
  return <select {...rest} onChange={handleChange} />;
}

export function TextareaInput(props: TextareaHTMLAttributes<HTMLTextAreaElement> & { onValueChange?: (value: string) => void }) {
  const { onValueChange, onChange, ...rest } = props;
  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    onChange?.(event);
    onValueChange?.(event.target.value);
  };
  return <textarea {...rest} onChange={handleChange} />;
}

export function AdminEntityCard({
  title,
  subtitle,
  description,
  image,
  fallback,
  meta,
  actions,
  status,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  image?: ReactNode;
  fallback?: string;
  meta?: Array<{ label: string; value: ReactNode }>;
  actions?: ReactNode;
  status?: ReactNode;
}) {
  return (
    <article className={styles.entityCard}>
      <div className={styles.entityMedia}>{image ?? <span className={styles.entityFallback}>{fallback ?? title.slice(0, 2)}</span>}</div>
      <div className={styles.entityBody}>
        <div className={styles.entityTitleRow}>
          <h3 className={styles.entityTitle}>{title}</h3>
          {status}
        </div>
        {subtitle ? <p className={styles.entitySubtitle}>{subtitle}</p> : null}
        {description ? <p className={styles.entityDescription}>{description}</p> : null}
        {meta?.length ? (
          <dl className={styles.entityMeta}>
            {meta.map((item) => (
              <div className={styles.entityMetaRow} key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {actions ? <div className={styles.entityActions}>{actions}</div> : null}
      </div>
    </article>
  );
}

export function AdminEmptyState({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className={styles.emptyState}>
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {actions ? <div className={styles.inlineActions}>{actions}</div> : null}
    </div>
  );
}

export function AdminStateCard({ text, tone = 'default' }: { text: string; tone?: 'default' | 'error' }) {
  return <div className={`${styles.stateCard} ${tone === 'error' ? styles.stateError : ''}`}>{text}</div>;
}

export function formatCurrency(value: number) {
  return `${Number(value || 0).toLocaleString('ru-RU')} ₽`;
}

export function formatDateTime(value?: string) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function formatDate(value?: string) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' }).format(new Date(value));
}

export function formatName(entity: { firstName?: string | null; lastName?: string | null; fullName?: string | null }) {
  if (entity.fullName?.trim()) {
    return entity.fullName.trim();
  }

  const composed = [entity.firstName, entity.lastName].filter(Boolean).join(' ').trim();
  return composed || 'Без имени';
}

export function getErrorText(error: unknown, fallback = 'Ошибка сохранения') {
  return getApiErrorMessage(error, fallback);
}

export function dedupeUrls(urls: string[]) {
  return [...new Set(urls.filter(Boolean))];
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '');
}

export function toggleId(values: string[], id: string) {
  return values.includes(id) ? values.filter((value) => value !== id) : [...values, id];
}

export function cleanFilters<T extends Record<string, string | undefined>>(filters: T) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value)) as Partial<T>;
}

export function toDateInput(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toDateTimeInput(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function capitalize(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}

export function fromDateTimeInput(value: string) {
  return value ? new Date(value).toISOString() : '';
}

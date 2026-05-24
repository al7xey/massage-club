import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { MasterDto } from '@/entities/master';
import { type ServiceDto } from '@/entities/service';
import type { StudioDto } from '@/entities/studio';
import {
  useBlockSuperAdminUserMutation,
  useCreateAdminMasterMutation,
  useCreateAdminStudioMutation,
  useCreateSuperAdminServiceMutation,
  useDeleteAdminMasterMutation,
  useDeleteSuperAdminServiceMutation,
  useDeleteSuperAdminUserMutation,
  useGetAdminDashboardQuery,
  useGetAdminMasterQuery,
  useGetAdminMastersQuery,
  useGetAdminServicesQuery,
  useGetAdminStudiosQuery,
  useGetSuperAdminServiceQuery,
  useGetSuperAdminServicesQuery,
  useGetSuperAdminUsersQuery,
  useUnblockSuperAdminUserMutation,
  useUpdateAdminMasterMutation,
  useUpdateAdminStudioMutation,
  useUpdateSuperAdminServiceMutation,
} from '@/features/admin';
import { useAuth } from '@/features/auth';
import { resolveMediaUrl } from '@/shared/lib/media';
import { appRoutes } from '@/shared/routes';
import { Button, LinkButton } from '@/shared/ui';
import { MasterForm, ServiceForm, StudioForm } from './AdminForms';
import { SimpleScheduleWorkspace } from './AdminScheduleWorkspace';
import styles from './AdminCrmPages.module.css';
import { AdminConfirmModal, AdminEmptyState, AdminEntityCard, AdminPageShell, AdminPanel, AdminStateCard, AdminStatsGrid, cleanFilters, formatCurrency, formatName } from './adminShared';

export function AdminDashboardPage() {
  const dashboard = useGetAdminDashboardQuery();

  return (
    <AdminPageShell
      title="Обзор"
      description="Короткий рабочий обзор без лишних таблиц."
      error={dashboard.error}
      isLoading={dashboard.isLoading}
    >
      <AdminStatsGrid
        items={[
          { label: 'Записи сегодня', value: dashboard.data?.todayAppointments ?? 0 },
          { label: 'Свободные окна', value: dashboard.data?.freeWindowsToday ?? 0 },
          { label: 'Активные мастера', value: dashboard.data?.activeMasters ?? dashboard.data?.masters ?? 0 },
          { label: 'Отмены за день', value: dashboard.data?.cancellationsToday ?? 0 },
          { label: 'Обращения', value: dashboard.data?.pendingRequests ?? 0 },
          { label: 'Сертификаты к проверке', value: dashboard.data?.certificatesToReview ?? 0 },
        ]}
      />
      <AdminPanel>
        <div className={styles.inlineActions}>
          <LinkButton to="/admin/schedule">Перейти к расписанию</LinkButton>
          <LinkButton to="/admin/appointments" variant="secondary">Создать запись</LinkButton>
          <LinkButton to="/admin/requests" variant="secondary">Открыть обращения</LinkButton>
        </div>
      </AdminPanel>
    </AdminPageShell>
  );
}

export function SuperAdminDashboardPage() {
  const dashboard = useGetAdminDashboardQuery();
  const services = useGetSuperAdminServicesQuery();
  const users = useGetSuperAdminUsersQuery();

  return (
    <AdminPageShell
      title="Обзор"
      description="Все основные сущности в одном простом рабочем экране."
      error={dashboard.error ?? services.error ?? users.error}
      isLoading={dashboard.isLoading || services.isLoading || users.isLoading}
    >
      <AdminStatsGrid
        items={[
          { label: 'Студии', value: dashboard.data?.activeStudios ?? 0 },
          { label: 'Записи сегодня', value: dashboard.data?.todayAppointments ?? 0 },
          { label: 'Выручка', value: formatCurrency(dashboard.data?.revenueRub ?? 0) },
          { label: 'Активные подписки', value: dashboard.data?.activeSubscriptions ?? 0 },
          { label: 'Загрузка мастеров', value: dashboard.data?.masters ? `${Math.round(((dashboard.data?.todayAppointments ?? 0) / Math.max(dashboard.data.masters, 1)) * 100)}%` : '0%' },
          { label: 'Отмены', value: dashboard.data?.cancellationsToday ?? 0 },
          { label: 'Услуги', value: services.data?.length ?? 0 },
          { label: 'Проблемные зоны', value: (dashboard.data?.scheduleConflicts ?? 0) + (dashboard.data?.certificatesToReview ?? 0) },
        ]}
      />
    </AdminPageShell>
  );
}

export function AdminMastersPage() {
  return <MastersWorkspace mode="admin" />;
}

export function SuperAdminMastersPage() {
  return <MastersWorkspace mode="super-admin" />;
}

export function AdminSchedulePage() {
  return (
    <AdminPageShell title="Расписание" description="Рабочие часы мастеров по дням недели: с какого по какое время мастер может принимать клиентов.">
      <SimpleScheduleWorkspace mode="admin" />
    </AdminPageShell>
  );
}

export function SuperAdminSchedulePage() {
  return (
    <AdminPageShell title="Расписание" description="Рабочие часы мастеров по дням недели без лишнего календаря и записей.">
      <SimpleScheduleWorkspace mode="super-admin" />
    </AdminPageShell>
  );
}

export function AdminMasterDetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const master = useGetAdminMasterQuery(id, { skip: !id });
  const studios = useGetAdminStudiosQuery();
  const services = useGetAdminServicesQuery();
  const [updateMaster, updateState] = useUpdateAdminMasterMutation();
  const [deleteMaster, deleteState] = useDeleteAdminMasterMutation();
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');

  const backTo = isSuperAdminPath ? '/super-admin/masters' : '/admin/masters';

  const remove = async () => {
    if (!id) return;
    await deleteMaster(id).unwrap();
    navigate(backTo, { replace: true });
  };

  return (
    <AdminPageShell
      backTo={backTo}
      description="Карточка мастера и связанное с ним расписание."
      error={master.error ?? studios.error ?? services.error}
      isLoading={master.isLoading || studios.isLoading || services.isLoading}
      title={master.data ? formatName(master.data) : 'Мастер'}
    >
      {master.data ? (
        <div className={styles.stack}>
          <AdminPanel title="Настройка мастера">
            <MasterForm
              isSubmitting={updateState.isLoading}
              master={master.data}
              secondaryAction={
                <Button type="button" variant="danger" onClick={() => setDeleteOpen(true)}>
                  Удалить
                </Button>
              }
              services={services.data ?? []}
              studios={studios.data ?? []}
              submitLabel="Сохранить"
              onSubmit={(body) => updateMaster({ id, body }).unwrap()}
            />
          </AdminPanel>
          <AdminConfirmModal
            confirmLabel="Удалить"
            description="Если у мастера есть будущие записи, сервер не позволит физическое удаление."
            isLoading={deleteState.isLoading}
            isOpen={isDeleteOpen}
            title="Удалить мастера?"
            onClose={() => setDeleteOpen(false)}
            onConfirm={() => void remove()}
          />
        </div>
      ) : (
        <AdminEmptyState title="Мастер не найден" />
      )}
    </AdminPageShell>
  );
}

export function AdminStudiosPage() {
  const studios = useGetAdminStudiosQuery();
  const [createStudio, createState] = useCreateAdminStudioMutation();
  const [updateStudio, updateState] = useUpdateAdminStudioMutation();

  return (
    <AdminPageShell
      title="Студии"
      description="Простые карточки филиалов, без скрытого контента и обрезанного скролла."
      error={studios.error}
      isLoading={studios.isLoading}
    >
      <div className={styles.twoColumn}>
        <div className={styles.mainColumn}>
          <div className={styles.grid}>
            {(studios.data ?? []).map((studio) => (
              <AdminPanel key={studio.id} title={studio.name}>
                <StudioForm
                  isSubmitting={updateState.isLoading}
                  studio={studio}
                  submitLabel="Сохранить"
                  onSubmit={(body) => updateStudio({ id: studio.id, body }).unwrap()}
                />
              </AdminPanel>
            ))}
            {!studios.data?.length ? <AdminEmptyState title="Студий пока нет" /> : null}
          </div>
        </div>
        <div className={styles.sideColumn}>
          <AdminPanel title="Новая студия">
            <StudioForm
              isSubmitting={createState.isLoading}
              submitLabel="Добавить студию"
              onSubmit={(body) =>
                createStudio({
                  ...body,
                  address: body.address || 'Адрес не указан',
                  city: body.city || 'Москва',
                  name: body.name || 'Новая студия',
                }).unwrap()
              }
            />
          </AdminPanel>
        </div>
      </div>
    </AdminPageShell>
  );
}

export function SuperAdminServicesPage() {
  const services = useGetSuperAdminServicesQuery();
  const [createService, createState] = useCreateSuperAdminServiceMutation();
  const [deleteService, deleteState] = useDeleteSuperAdminServiceMutation();

  return (
    <AdminPageShell
      title="Услуги"
      description="Базовая цена вводится один раз, скидочные значения считаются автоматически."
      error={services.error}
      isLoading={services.isLoading}
    >
      <div className={styles.twoColumn}>
        <div className={styles.mainColumn}>
          <div className={styles.grid}>
            {(services.data ?? []).map((service) => (
              <AdminEntityCard
                key={service.id}
                actions={
                  <>
                    <LinkButton size="sm" to={appRoutes.superAdminServiceDetails(service.id)} variant="secondary">
                      Настроить
                    </LinkButton>
                    <Button size="sm" type="button" variant="ghost" isLoading={deleteState.isLoading} onClick={() => void deleteService(service.id).unwrap()}>
                      Удалить
                    </Button>
                  </>
                }
                description={service.shortDescription || service.description}
                fallback={service.title.slice(0, 2)}
                image={renderImage(service.imageUrl ?? service.galleryUrls?.[0])}
                meta={[
                  { label: 'Цена', value: formatCurrency(service.priceRub) },
                  { label: 'Super', value: formatCurrency(Math.round(service.priceRub * 0.7)) },
                  { label: 'Длительность', value: `${service.durationMinutes} мин` },
                ]}
                title={service.title}
              />
            ))}
          </div>
        </div>
        <div className={styles.sideColumn}>
          <AdminPanel title="Новая услуга">
            <ServiceForm
              isSubmitting={createState.isLoading}
              submitLabel="Создать услугу"
              onSubmit={(body) =>
                createService({
                  ...body,
                  description: body.description || 'Описание услуги',
                  durationMinutes: body.durationMinutes ?? 60,
                  priceRub: body.priceRub ?? 0,
                  slug: body.slug || undefined,
                  title: body.title || 'Новая услуга',
                }).unwrap()
              }
            />
          </AdminPanel>
        </div>
      </div>
    </AdminPageShell>
  );
}

export function SuperAdminServiceDetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const service = useGetSuperAdminServiceQuery(id, { skip: !id });
  const [updateService, updateState] = useUpdateSuperAdminServiceMutation();
  const [deleteService, deleteState] = useDeleteSuperAdminServiceMutation();
  const [isDeleteOpen, setDeleteOpen] = useState(false);

  const remove = async () => {
    if (!id) return;
    await deleteService(id).unwrap();
    navigate('/super-admin/services', { replace: true });
  };

  return (
    <AdminPageShell
      backTo="/super-admin/services"
      description="Форма услуги без ручного ввода скидочных цен."
      error={service.error}
      isLoading={service.isLoading}
      title={service.data?.title ?? 'Услуга'}
    >
      {service.data ? (
        <AdminPanel title="Настройка услуги">
          <ServiceForm
            isSubmitting={updateState.isLoading}
            secondaryAction={
              <Button type="button" variant="danger" onClick={() => setDeleteOpen(true)}>
                Удалить
              </Button>
            }
            service={service.data}
            submitLabel="Сохранить"
            onSubmit={(body) => updateService({ id: service.data!.id, body }).unwrap()}
          />
          <AdminConfirmModal
            confirmLabel="Удалить"
            description="Если услуга связана с записями, сервер отключит её вместо удаления."
            isLoading={deleteState.isLoading}
            isOpen={isDeleteOpen}
            title="Удалить услугу?"
            onClose={() => setDeleteOpen(false)}
            onConfirm={() => void remove()}
          />
        </AdminPanel>
      ) : (
        <AdminEmptyState title="Услуга не найдена" />
      )}
    </AdminPageShell>
  );
}

export function SuperAdminUsersPage() {
  const [filters, setFilters] = useState({ search: '', status: '' });
  const users = useGetSuperAdminUsersQuery(cleanFilters(filters));
  const { user: currentUser } = useAuth();
  const [blockUser] = useBlockSuperAdminUserMutation();
  const [unblockUser] = useUnblockSuperAdminUserMutation();
  const [deleteUser, deleteState] = useDeleteSuperAdminUserMutation();

  return (
    <AdminPageShell title="Пользователи" description="Поиск, блокировка и удаление без перегруженных экранов." error={users.error} isLoading={users.isLoading}>
      <AdminPanel>
        <div className={styles.toolbarFields}>
          <label className={styles.toolbarField}>
            <span>Поиск</span>
            <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} />
          </label>
          <label className={styles.toolbarField}>
            <span>Статус</span>
            <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
              <option value="">Все</option>
              <option value="active">Активные</option>
              <option value="blocked">Заблокированные</option>
            </select>
          </label>
        </div>
      </AdminPanel>

      {(users.data ?? []).length ? (
        <section className={styles.tableCard}>
          <div className={styles.userTableHeader}>
            <strong className={styles.userTableTitle}>Пользователь</strong>
            <strong className={styles.userTableTitle}>Контакты</strong>
            <strong className={styles.userTableTitle}>Статус</strong>
            <strong className={styles.userTableTitle}>Действия</strong>
          </div>
          {(users.data ?? []).map((item) => {
            const isSelf = currentUser?.id === item.id;
            const isBlocked = item.status === 'blocked';
            return (
              <div className={styles.userRow} key={item.id}>
                <div className={styles.userCell}>
                  <div className={styles.userName}>{item.fullName || 'Без имени'}</div>
                  <div className={styles.userMeta}>{item.role}</div>
                </div>
                <div className={styles.userCell}>
                  <div className={styles.tableCellPrimary}>{item.email || item.phone || 'Контакты не указаны'}</div>
                  <div className={styles.tableCellSecondary}>{item.phone && item.email ? item.phone : item.createdAt ? `Создан: ${new Date(item.createdAt).toLocaleDateString('ru-RU')}` : '—'}</div>
                </div>
                <div className={styles.userCell}>
                  <span className={`${styles.statusPill} ${isBlocked ? styles.dangerPill : ''}`}>{isBlocked ? 'Заблокирован' : 'Активен'}</span>
                </div>
                <div className={styles.userCell}>
                  <div className={styles.inlineActions}>
                    {isBlocked ? (
                      <Button disabled={isSelf} size="sm" type="button" variant="secondary" onClick={() => void unblockUser(item.id).unwrap()}>
                        Разблокировать
                      </Button>
                    ) : (
                      <Button disabled={isSelf} size="sm" type="button" variant="secondary" onClick={() => void blockUser(item.id).unwrap()}>
                        Заблокировать
                      </Button>
                    )}
                    <Button disabled={isSelf} size="sm" type="button" variant="ghost" isLoading={deleteState.isLoading} onClick={() => void deleteUser(item.id).unwrap()}>
                      Удалить
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <AdminEmptyState title="Пользователи не найдены" />
      )}
    </AdminPageShell>
  );
}

function MastersWorkspace({ mode }: { mode: 'admin' | 'super-admin' }) {
  const [search, setSearch] = useState('');
  const masters = useGetAdminMastersQuery(search ? { search } : undefined);
  const studios = useGetAdminStudiosQuery();
  const services = useGetAdminServicesQuery();
  const [createMaster, createState] = useCreateAdminMasterMutation();
  const [deleteMaster, deleteState] = useDeleteAdminMasterMutation();
  const basePath = mode === 'super-admin' ? '/super-admin/masters' : '/admin/masters';

  return (
    <AdminPageShell
      title="Мастера"
      description="Карточки мастеров, быстрый поиск и переход прямо в расписание."
      error={masters.error ?? studios.error ?? services.error}
      isLoading={masters.isLoading || studios.isLoading || services.isLoading}
    >
      <div className={styles.twoColumn}>
        <div className={styles.mainColumn}>
          <AdminPanel>
            <div className={styles.toolbarFields}>
              <label className={styles.toolbarField}>
                <span>Поиск</span>
                <input value={search} onChange={(event) => setSearch(event.target.value)} />
              </label>
            </div>
          </AdminPanel>
          <div className={styles.grid}>
            {(masters.data ?? []).map((master) => (
              <AdminEntityCard
                key={master.id}
                actions={
                  <>
                    <LinkButton size="sm" to={`${basePath}/${master.id}`} variant="secondary">
                      Настроить
                    </LinkButton>
                    <LinkButton size="sm" to={mode === 'super-admin' ? '/super-admin/schedule' : '/admin/schedule'} variant="secondary">
                      Расписание
                    </LinkButton>
                    <Button size="sm" type="button" variant="ghost" isLoading={deleteState.isLoading} onClick={() => void deleteMaster(master.id).unwrap()}>
                      Удалить
                    </Button>
                  </>
                }
                description={master.bio || 'Описание пока не заполнено'}
                fallback={getInitials(formatName(master))}
                image={renderImage(master.photoUrl ?? master.photoUrls?.[0], 'portrait')}
                meta={[
                  { label: 'Специализация', value: master.specialization || '—' },
                  { label: 'Опыт', value: `${master.experienceYears ?? 0} лет` },
                  { label: 'Студии', value: masterStudios(master).map((studio) => studio.name).join(', ') || 'Не назначены' },
                ]}
                subtitle={master.phone || 'Телефон не указан'}
                title={formatName(master)}
              />
            ))}
            {!masters.data?.length ? <AdminEmptyState title="Мастера не найдены" /> : null}
          </div>
        </div>
        <div className={styles.sideColumn}>
          <AdminPanel title="Новый мастер">
            <MasterForm
              isSubmitting={createState.isLoading}
              services={services.data ?? []}
              studios={studios.data ?? []}
              submitLabel="Создать мастера"
              onSubmit={(body) => createMaster({ ...body, fullName: body.fullName || 'Новый мастер' }).unwrap()}
            />
          </AdminPanel>
        </div>
      </div>
    </AdminPageShell>
  );
}

function renderImage(url?: string | null, fit: 'cover' | 'portrait' = 'cover') {
  const resolved = resolveMediaUrl(url);
  return resolved ? <img alt="" data-fit={fit} src={resolved} /> : undefined;
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function masterStudios(master: MasterDto) {
  return master.studios?.length ? master.studios : master.studio ? [master.studio] : [];
}

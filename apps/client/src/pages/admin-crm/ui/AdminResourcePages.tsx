import { useMemo, useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import type { UserRole } from '@massage/shared';
import type { ServiceDto } from '@/entities/service';
import { getSubscriptionPlanSortIndex, getSubscriptionPlanTitle } from '@/entities/subscription';
import {
  type AdminAppointmentDto,
  type AdminAppointmentStatus,
  type AdminCertificateDto,
  type AdminCertificateStatus,
  type AdminPaymentDto,
  type AdminPaymentStatus,
  type AdminRequestDto,
  type AdminRequestStatus,
  type AdminNetworkSettingsDto,
  type AdminSubscriptionDto,
  type AdminSubscriptionPlanDto,
  type AdminSubscriptionStatus,
  type AdminUserDto,
  type UpsertAppointmentPayload,
  type UpsertCertificatePayload,
  type UpsertServicePayload,
  type UpsertSubscriptionPlanPayload,
  useCancelAdminAppointmentMutation,
  useCreateAdminAppointmentMutation,
  useCreateAdminCertificateMutation,
  useCreateAdminServiceMutation,
  useCreateSuperAdminTariffMutation,
  useDeleteAdminCertificateMutation,
  useDeleteAdminServiceMutation,
  useDeleteSuperAdminTariffMutation,
  useGetAdminAppointmentsQuery,
  useGetAdminCertificatesQuery,
  useGetAdminClientsQuery,
  useGetAdminDashboardQuery,
  useGetAdminMastersQuery,
  useGetAdminPaymentsQuery,
  useGetAdminRequestsQuery,
  useGetAdminServicesQuery,
  useGetAdminStudiosQuery,
  useGetAdminSubscriptionsQuery,
  useGetAdminUsersQuery,
  useGetSuperAdminAnalyticsQuery,
  useGetSuperAdminAuditLogQuery,
  useGetSuperAdminCertificatesQuery,
  useGetSuperAdminPaymentsQuery,
  useGetSuperAdminRequestsQuery,
  useGetSuperAdminSettingsQuery,
  useGetSuperAdminSubscriptionsQuery,
  useGetSuperAdminTariffsQuery,
  useGetSuperAdminUsersQuery,
  useUpdateAdminAppointmentMutation,
  useUpdateAdminCertificateMutation,
  useUpdateAdminRequestMutation,
  useUpdateAdminServiceMutation,
  useUpdateAdminStudioMutation,
  useUpdateSuperAdminPaymentStatusMutation,
  useUpdateSuperAdminRequestMutation,
  useUpdateSuperAdminSettingsMutation,
  useUpdateSuperAdminSubscriptionStatusMutation,
  useUpdateSuperAdminTariffMutation,
  useUpdateSuperAdminUserRoleMutation,
} from '@/features/admin';
import { Button, LinkButton } from '@/shared/ui';
import { ServiceForm, StudioForm } from './AdminForms';
import styles from './AdminCrmPages.module.css';
import {
  AdminConfirmModal,
  AdminDataTable,
  AdminDrawer,
  AdminEmptyState,
  AdminFiltersBar,
  AdminFormField,
  AdminPageShell,
  AdminPanel,
  AdminStatsGrid,
  AdminStatusBadge,
  SelectInput,
  TextInput,
  TextareaInput,
  cleanFilters,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatName,
  fromDateTimeInput,
  getErrorText,
  toDateInput,
  toDateTimeInput,
} from './adminShared';

type AdminMode = 'admin' | 'super-admin';

const appointmentStatusOptions: Array<{ value: AdminAppointmentStatus; label: string }> = [
  { value: 'SCHEDULED', label: 'pending' },
  { value: 'CONFIRMED', label: 'confirmed' },
  { value: 'COMPLETED', label: 'completed' },
  { value: 'CANCELLED', label: 'cancelled' },
];

const subscriptionStatuses: AdminSubscriptionStatus[] = ['ACTIVE', 'FROZEN', 'AUTO_RENEWAL_DISABLED', 'PAYMENT_ISSUE', 'EXPIRED', 'CANCELLED'];
const paymentStatuses: AdminPaymentStatus[] = ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED'];
const certificateStatuses: AdminCertificateStatus[] = ['ACTIVE', 'REDEEMED', 'EXPIRED', 'CANCELLED'];
const requestStatuses: AdminRequestStatus[] = ['OPEN', 'IN_PROGRESS', 'CLOSED'];

export function AdminServicesPage() {
  return <ServicesWorkspace mode="admin" />;
}

export function AdminAppointmentsPage() {
  return <AppointmentsWorkspace mode="admin" />;
}

export function SuperAdminAppointmentsPage() {
  return <AppointmentsWorkspace mode="super-admin" />;
}

export function AdminClientsPage() {
  return <ClientsWorkspace mode="admin" />;
}

export function SuperAdminClientsPage() {
  return <ClientsWorkspace mode="super-admin" />;
}

export function AdminCertificatesPage() {
  return <CertificatesWorkspace mode="admin" />;
}

export function SuperAdminCertificatesPage() {
  return <CertificatesWorkspace mode="super-admin" />;
}

export function AdminRequestsPage() {
  return <RequestsWorkspace mode="admin" />;
}

export function SuperAdminRequestsPage() {
  return <RequestsWorkspace mode="super-admin" />;
}

export function AdminStudioProfilePage() {
  const studios = useGetAdminStudiosQuery();
  const [updateStudio, updateState] = useUpdateAdminStudioMutation();
  const studio = studios.data?.[0];

  return (
    <AdminPageShell
      title="Профиль студии"
      description="Данные филиала, которые видит операционный администратор."
      error={studios.error}
      isLoading={studios.isLoading}
    >
      {studio ? (
        <AdminPanel title={studio.name} description={`${studio.city}, ${studio.address}`}>
          <StudioForm
            isSubmitting={updateState.isLoading}
            studio={studio}
            submitLabel="Сохранить профиль"
            onSubmit={(body) => updateStudio({ id: studio.id, body }).unwrap()}
          />
        </AdminPanel>
      ) : (
        <AdminEmptyState title="Студия не назначена" description="Попросите superadmin назначить администратора к студии." />
      )}
    </AdminPageShell>
  );
}

export function SuperAdminTariffsPage() {
  const tariffs = useGetSuperAdminTariffsQuery();
  const [createTariff, createState] = useCreateSuperAdminTariffMutation();
  const [updateTariff, updateState] = useUpdateSuperAdminTariffMutation();
  const [deleteTariff, deleteState] = useDeleteSuperAdminTariffMutation();
  const [selected, setSelected] = useState<AdminSubscriptionPlanDto | null>(null);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminSubscriptionPlanDto | null>(null);
  const tariffItems = useMemo(
    () =>
      [...(tariffs.data ?? [])]
        .sort((left, right) => getSubscriptionPlanSortIndex(left.code) - getSubscriptionPlanSortIndex(right.code))
        .map((tariff) => ({ ...tariff, name: getSubscriptionPlanTitle(tariff.code, tariff.name) })),
    [tariffs.data],
  );

  return (
    <AdminPageShell
      title="Тарифы"
      description="Стоимость, посещения, семейность, заморозка и перенос остатков."
      actions={<Button onClick={() => setCreateOpen(true)}>Создать тариф</Button>}
      error={tariffs.error}
      isLoading={tariffs.isLoading}
    >
      <AdminDataTable
        columns={[
          { key: 'name', title: 'Тариф', render: (item) => <strong>{getSubscriptionPlanTitle(item.code, item.name)}</strong> },
          { key: 'price', title: 'Цена', render: (item) => formatCurrency(item.monthlyPriceRub) },
          { key: 'credits', title: 'Посещения', render: (item) => item.includedCredits },
          { key: 'family', title: 'Тип', render: (item) => ((item.familyMembersLimit ?? 1) > 1 ? `Семейный, ${item.familyMembersLimit ?? 1}` : 'Индивидуальный') },
          { key: 'status', title: 'Статус', render: (item) => <AdminStatusBadge label={item.isActive ? 'active' : 'inactive'} tone={item.isActive ? 'success' : 'muted'} /> },
          {
            key: 'actions',
            title: 'Действия',
            render: (item) => (
              <div className={styles.inlineActions}>
                <Button size="sm" variant="secondary" onClick={() => setSelected(item)}>
                  Изменить
                </Button>
                <Button size="sm" variant="danger" onClick={() => setDeleteTarget(item)}>
                  Отключить
                </Button>
              </div>
            ),
          },
        ]}
        emptyTitle="Тарифы не найдены"
        getRowKey={(item) => item.id}
        items={tariffItems}
      />

      <AdminDrawer title={selected ? 'Редактирование тарифа' : 'Новый тариф'} isOpen={Boolean(selected) || isCreateOpen} onClose={() => { setSelected(null); setCreateOpen(false); }}>
        <TariffForm
          isSubmitting={createState.isLoading || updateState.isLoading}
          tariff={selected ?? undefined}
          onSubmit={(body) => (selected ? updateTariff({ id: selected.id, body }).unwrap() : createTariff(body).unwrap()).then(() => {
            setSelected(null);
            setCreateOpen(false);
          })}
        />
      </AdminDrawer>

      <AdminConfirmModal
        confirmLabel="Отключить"
        description="Тариф останется в истории подписок, но пропадёт из активной продажи."
        isLoading={deleteState.isLoading}
        isOpen={Boolean(deleteTarget)}
        title="Отключить тариф?"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && void deleteTariff(deleteTarget.id).unwrap().then(() => setDeleteTarget(null))}
      />
    </AdminPageShell>
  );
}

export function AdminSubscriptionsPage() {
  return <SubscriptionsWorkspace mode="admin" />;
}

export function SuperAdminSubscriptionsPage() {
  return <SubscriptionsWorkspace mode="super-admin" />;
}

export function AdminPaymentsPage() {
  return <PaymentsWorkspace mode="admin" />;
}

export function SuperAdminPaymentsPage() {
  return <PaymentsWorkspace mode="super-admin" />;
}

export function SuperAdminAnalyticsPage() {
  const analytics = useGetSuperAdminAnalyticsQuery();
  const appointments = useGetAdminAppointmentsQuery();
  const payments = useGetSuperAdminPaymentsQuery();
  const services = useGetAdminServicesQuery();
  const studios = useGetAdminStudiosQuery();

  const paidPayments = payments.data?.filter((payment) => payment.status === 'PAID') ?? [];
  const topServices = buildTopServices(appointments.data ?? [], services.data ?? []);
  const studioLoad = buildStudioLoad(appointments.data ?? [], studios.data ?? []);

  return (
    <AdminPageShell
      title="Аналитика"
      description="Простые показатели по сети без тяжёлой BI-системы."
      error={analytics.error ?? appointments.error ?? payments.error}
      isLoading={analytics.isLoading || appointments.isLoading || payments.isLoading}
    >
      <AdminStatsGrid
        items={[
          { label: 'Выручка', value: formatCurrency(analytics.data?.paymentsRub ?? sumPayments(paidPayments)) },
          { label: 'Записи', value: analytics.data?.appointments ?? appointments.data?.length ?? 0 },
          { label: 'Отмены', value: appointments.data?.filter((item) => item.status === 'CANCELLED').length ?? 0 },
          { label: 'Активные подписки', value: analytics.data?.activeSubscriptions ?? 0 },
          { label: 'Сертификаты', value: analytics.data?.giftCertificates ?? 0 },
          { label: 'Клиенты', value: analytics.data?.users ?? 0 },
        ]}
      />
      <div className={styles.twoColumn}>
        <SimpleBars title="Популярные услуги" items={topServices} />
        <SimpleBars title="Сравнение студий" items={studioLoad} />
      </div>
    </AdminPageShell>
  );
}

export function SuperAdminAuditLogPage() {
  const logs = useGetSuperAdminAuditLogQuery();

  return (
    <AdminPageShell title="Журнал действий" description="Ключевые ручные изменения и операции администраторов." error={logs.error} isLoading={logs.isLoading}>
      <AdminDataTable
        columns={[
          { key: 'date', title: 'Дата', render: (item) => formatDateTime(item.createdAt) },
          { key: 'user', title: 'Пользователь', render: (item) => item.actorId ?? 'system' },
          { key: 'role', title: 'Роль', render: (item) => item.actorRole },
          { key: 'action', title: 'Действие', render: (item) => <strong>{item.action}</strong> },
          { key: 'entity', title: 'Сущность', render: (item) => `${item.entityType}${item.entityId ? ` / ${item.entityId.slice(0, 8)}` : ''}` },
        ]}
        emptyTitle="Журнал пока пуст"
        getRowKey={(item) => item.id}
        items={logs.data ?? []}
      />
    </AdminPageShell>
  );
}

export function SuperAdminSettingsPage() {
  const settings = useGetSuperAdminSettingsQuery();
  const [updateSettings, state] = useUpdateSuperAdminSettingsMutation();

  return (
    <AdminPageShell title="Настройки" description="Только параметры, которые реально используются в панели." error={settings.error} isLoading={settings.isLoading}>
      {settings.data ? (
        <SettingsForm
          isSubmitting={state.isLoading}
          settings={settings.data}
          onSubmit={(body) => updateSettings(body).unwrap()}
        />
      ) : (
        <AdminEmptyState title="Настройки не найдены" />
      )}
    </AdminPageShell>
  );
}

function ServicesWorkspace({ mode }: { mode: AdminMode }) {
  const [filters, setFilters] = useState({ search: '', status: '', category: '' });
  void mode;
  const services = useGetAdminServicesQuery();
  const [createService, createState] = useCreateAdminServiceMutation();
  const [updateService, updateState] = useUpdateAdminServiceMutation();
  const [deleteService, deleteState] = useDeleteAdminServiceMutation();
  const [selected, setSelected] = useState<ServiceDto | null>(null);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ServiceDto | null>(null);

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return (services.data ?? []).filter((service) => {
      const matchesSearch = !search || `${service.title} ${service.description}`.toLowerCase().includes(search);
      const matchesStatus = !filters.status || String(Boolean(service.isActive)) === filters.status;
      const matchesCategory = !filters.category || service.category?.id === filters.category;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [filters, services.data]);

  const categories = uniqueOptions((services.data ?? []).map((service) => ({ value: service.category?.id ?? '', label: service.category?.name ?? '' })));

  return (
    <AdminPageShell
      title="Услуги"
      description="Поиск, цена, длительность, активность и изображение услуги."
      actions={<Button onClick={() => setCreateOpen(true)}>Добавить услугу</Button>}
      error={services.error}
      isLoading={services.isLoading}
    >
      <AdminFiltersBar>
        <AdminFormField label="Поиск">
          <TextInput value={filters.search} onValueChange={(search) => setFilters((current) => ({ ...current, search }))} />
        </AdminFormField>
        <AdminFormField label="Категория">
          <SelectInput value={filters.category} onValueChange={(category) => setFilters((current) => ({ ...current, category }))}>
            <option value="">Все</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </SelectInput>
        </AdminFormField>
        <AdminFormField label="Активность">
          <SelectInput value={filters.status} onValueChange={(status) => setFilters((current) => ({ ...current, status }))}>
            <option value="">Все</option>
            <option value="true">active</option>
            <option value="false">inactive</option>
          </SelectInput>
        </AdminFormField>
      </AdminFiltersBar>
      <AdminDataTable
        columns={[
          { key: 'title', title: 'Услуга', render: (item) => <strong>{item.title}</strong> },
          { key: 'category', title: 'Категория', render: (item) => item.category?.name ?? '—' },
          { key: 'duration', title: 'Длительность', render: (item) => `${item.durationMinutes} мин` },
          { key: 'price', title: 'Цена', render: (item) => formatCurrency(item.priceRub) },
          { key: 'status', title: 'Статус', render: (item) => <AdminStatusBadge label={item.isActive === false ? 'inactive' : 'active'} tone={item.isActive === false ? 'muted' : 'success'} /> },
          {
            key: 'actions',
            title: 'Действия',
            render: (item) => (
              <div className={styles.inlineActions}>
                <Button size="sm" variant="secondary" onClick={() => setSelected(item)}>
                  Изменить
                </Button>
                <Button size="sm" variant="danger" onClick={() => setDeleteTarget(item)}>
                  Отключить
                </Button>
              </div>
            ),
          },
        ]}
        emptyTitle="Услуги не найдены"
        getRowKey={(item) => item.id}
        items={filtered}
      />
      <AdminDrawer title={selected ? 'Редактирование услуги' : 'Новая услуга'} isOpen={Boolean(selected) || isCreateOpen} onClose={() => { setSelected(null); setCreateOpen(false); }}>
        <ServiceForm
          isSubmitting={createState.isLoading || updateState.isLoading}
          service={selected ?? undefined}
          submitLabel={selected ? 'Сохранить' : 'Создать услугу'}
          onSubmit={(body: UpsertServicePayload) => (selected ? updateService({ id: selected.id, body }).unwrap() : createService(body).unwrap()).then(() => {
            setSelected(null);
            setCreateOpen(false);
          })}
        />
      </AdminDrawer>
      <AdminConfirmModal
        confirmLabel="Отключить"
        description="Если услуга связана с записями, сервер оставит её в истории и выключит активность."
        isLoading={deleteState.isLoading}
        isOpen={Boolean(deleteTarget)}
        title="Отключить услугу?"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && void deleteService(deleteTarget.id).unwrap().then(() => setDeleteTarget(null))}
      />
    </AdminPageShell>
  );
}

function AppointmentsWorkspace({ mode }: { mode: AdminMode }) {
  const [filters, setFilters] = useState({ search: '', date: toDateInput(new Date()), studioId: '', masterId: '', serviceId: '', status: '' });
  const queryFilters = cleanFilters({
    date: filters.date,
    studioId: filters.studioId,
    masterId: filters.masterId,
    serviceId: filters.serviceId,
    status: filters.status as AdminAppointmentStatus | '',
  }) as { date?: string; studioId?: string; masterId?: string; serviceId?: string; status?: AdminAppointmentStatus };
  const appointments = useGetAdminAppointmentsQuery(queryFilters);
  const clients = useGetAdminClientsQuery();
  const masters = useGetAdminMastersQuery();
  const studios = useGetAdminStudiosQuery();
  const services = useGetAdminServicesQuery();
  const [createAppointment, createState] = useCreateAdminAppointmentMutation();
  const [updateAppointment, updateState] = useUpdateAdminAppointmentMutation();
  const [cancelAppointment, cancelState] = useCancelAdminAppointmentMutation();
  const [selected, setSelected] = useState<AdminAppointmentDto | null>(null);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<AdminAppointmentDto | null>(null);

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return (appointments.data ?? []).filter((item) => !search || `${item.user?.fullName ?? ''} ${item.user?.phone ?? ''}`.toLowerCase().includes(search));
  }, [appointments.data, filters.search]);

  return (
    <AdminPageShell
      title="Записи"
      description="Рабочий список всех записей с фильтрами, статусами и переносом."
      actions={<Button onClick={() => setCreateOpen(true)}>Создать запись</Button>}
      error={appointments.error ?? clients.error ?? masters.error ?? studios.error ?? services.error}
      isLoading={appointments.isLoading || clients.isLoading || masters.isLoading || studios.isLoading || services.isLoading}
    >
      <AdminFiltersBar actions={<LinkButton to={mode === 'super-admin' ? '/super-admin/schedule' : '/admin/schedule'} variant="secondary">Открыть расписание</LinkButton>}>
        <AdminFormField label="Клиент">
          <TextInput value={filters.search} onValueChange={(search) => setFilters((current) => ({ ...current, search }))} />
        </AdminFormField>
        <AdminFormField label="Дата">
          <TextInput type="date" value={filters.date} onValueChange={(date) => setFilters((current) => ({ ...current, date }))} />
        </AdminFormField>
        <AdminFormField label="Студия">
          <SelectInput value={filters.studioId} onValueChange={(studioId) => setFilters((current) => ({ ...current, studioId }))}>
            <option value="">Все</option>
            {(studios.data ?? []).map((studio) => <option key={studio.id} value={studio.id}>{studio.name}</option>)}
          </SelectInput>
        </AdminFormField>
        <AdminFormField label="Мастер">
          <SelectInput value={filters.masterId} onValueChange={(masterId) => setFilters((current) => ({ ...current, masterId }))}>
            <option value="">Все</option>
            {(masters.data ?? []).map((master) => <option key={master.id} value={master.id}>{formatName(master)}</option>)}
          </SelectInput>
        </AdminFormField>
        <AdminFormField label="Услуга">
          <SelectInput value={filters.serviceId} onValueChange={(serviceId) => setFilters((current) => ({ ...current, serviceId }))}>
            <option value="">Все</option>
            {(services.data ?? []).map((service) => <option key={service.id} value={service.id}>{service.title}</option>)}
          </SelectInput>
        </AdminFormField>
        <AdminFormField label="Статус">
          <SelectInput value={filters.status} onValueChange={(status) => setFilters((current) => ({ ...current, status }))}>
            <option value="">Все</option>
            {appointmentStatusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </SelectInput>
        </AdminFormField>
      </AdminFiltersBar>
      <AdminDataTable
        columns={[
          { key: 'client', title: 'Клиент', render: (item) => <strong>{item.user?.fullName || 'Клиент'}</strong> },
          { key: 'time', title: 'Дата и время', render: (item) => formatDateTime(item.startsAt) },
          { key: 'service', title: 'Услуга', render: (item) => item.service?.title ?? '—' },
          { key: 'master', title: 'Мастер', render: (item) => formatName(item.master) },
          { key: 'studio', title: 'Студия', render: (item) => item.studio?.name ?? '—' },
          { key: 'status', title: 'Статус', render: (item) => <AppointmentStatusBadge status={item.status as AdminAppointmentStatus} /> },
        ]}
        emptyTitle="Записи не найдены"
        getRowKey={(item) => item.id}
        items={filtered}
        onRowClick={setSelected}
      />
      <AdminDrawer
        title={selected ? 'Карточка записи' : 'Новая запись'}
        description={selected ? `${selected.user?.phone ?? 'Телефон не указан'} · ${formatCurrency(selected.priceRub)}` : undefined}
        isOpen={Boolean(selected) || isCreateOpen}
        onClose={() => { setSelected(null); setCreateOpen(false); }}
      >
        <AppointmentForm
          appointment={selected ?? undefined}
          clients={clients.data ?? []}
          isSubmitting={createState.isLoading || updateState.isLoading}
          masters={masters.data ?? []}
          services={services.data ?? []}
          studios={studios.data ?? []}
          onCancel={selected ? () => setCancelTarget(selected) : undefined}
          onSubmit={(body) => (selected ? updateAppointment({ id: selected.id, body }).unwrap() : createAppointment(body).unwrap()).then(() => {
            setSelected(null);
            setCreateOpen(false);
          })}
        />
      </AdminDrawer>
      <AdminConfirmModal
        confirmLabel="Отменить запись"
        description="Запись получит статус cancelled, действие попадёт в журнал."
        isLoading={cancelState.isLoading}
        isOpen={Boolean(cancelTarget)}
        title="Отменить запись?"
        onClose={() => setCancelTarget(null)}
        onConfirm={() => cancelTarget && void cancelAppointment({ id: cancelTarget.id, reason: 'Отменено администратором' }).unwrap().then(() => {
          setCancelTarget(null);
          setSelected(null);
        })}
      />
    </AdminPageShell>
  );
}

function ClientsWorkspace({ mode }: { mode: AdminMode }) {
  const [search, setSearch] = useState('');
  const clients = useGetAdminClientsQuery(search ? { search } : undefined);
  const appointments = useGetAdminAppointmentsQuery();
  const subscriptions = mode === 'super-admin' ? useGetSuperAdminSubscriptionsQuery() : useGetAdminSubscriptionsQuery();
  const payments = mode === 'super-admin' ? useGetSuperAdminPaymentsQuery() : useGetAdminPaymentsQuery();
  const certificates = mode === 'super-admin' ? useGetSuperAdminCertificatesQuery() : useGetAdminCertificatesQuery();
  const [selected, setSelected] = useState<AdminUserDto | null>(null);

  return (
    <AdminPageShell title="Клиенты" description="Контакты, записи, подписки, сертификаты, платежи и заметки." error={clients.error} isLoading={clients.isLoading}>
      <AdminFiltersBar>
        <AdminFormField label="Поиск по имени, телефону или email">
          <TextInput value={search} onValueChange={setSearch} />
        </AdminFormField>
      </AdminFiltersBar>
      <AdminDataTable
        columns={[
          { key: 'name', title: 'Клиент', render: (item) => <strong>{item.fullName || 'Без имени'}</strong> },
          { key: 'phone', title: 'Телефон', render: (item) => item.phone ?? '—' },
          { key: 'email', title: 'Email', render: (item) => item.email ?? '—' },
          { key: 'status', title: 'Статус', render: (item) => <AdminStatusBadge label={item.status} tone={item.status === 'active' ? 'success' : 'danger'} /> },
        ]}
        emptyTitle="Клиенты не найдены"
        getRowKey={(item) => item.id}
        items={clients.data ?? []}
        onRowClick={setSelected}
      />
      <AdminDrawer title={selected?.fullName || 'Клиент'} isOpen={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected ? (
          <ClientDetails
            appointments={(appointments.data ?? []).filter((item) => item.user?.id === selected.id)}
            certificates={(certificates.data ?? []).filter((item) => item.buyer?.id === selected.id)}
            client={selected}
            payments={(payments.data ?? []).filter((item) => item.user?.id === selected.id)}
            subscriptions={(subscriptions.data ?? []).filter((item) => item.user?.id === selected.id)}
          />
        ) : null}
      </AdminDrawer>
    </AdminPageShell>
  );
}

function CertificatesWorkspace({ mode }: { mode: AdminMode }) {
  const [filters, setFilters] = useState({ search: '', status: '' });
  const certificateFilters = cleanFilters({ search: filters.search, status: filters.status as AdminCertificateStatus | '' }) as {
    search?: string;
    status?: AdminCertificateStatus;
  };
  const certificates = mode === 'super-admin' ? useGetSuperAdminCertificatesQuery(certificateFilters) : useGetAdminCertificatesQuery(certificateFilters);
  const [createCertificate, createState] = useCreateAdminCertificateMutation();
  const [updateCertificate, updateState] = useUpdateAdminCertificateMutation();
  const [deleteCertificate, deleteState] = useDeleteAdminCertificateMutation();
  const [selected, setSelected] = useState<AdminCertificateDto | null>(null);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminCertificateDto | null>(null);

  return (
    <AdminPageShell
      title="Сертификаты"
      description="Проверка, погашение, отмена и просмотр покупателя/получателя."
      actions={mode === 'super-admin' ? <Button onClick={() => setCreateOpen(true)}>Создать сертификат</Button> : undefined}
      error={certificates.error}
      isLoading={certificates.isLoading}
    >
      <AdminFiltersBar>
        <AdminFormField label="Код или получатель">
          <TextInput value={filters.search} onValueChange={(search) => setFilters((current) => ({ ...current, search }))} />
        </AdminFormField>
        <AdminFormField label="Статус">
          <SelectInput value={filters.status} onValueChange={(status) => setFilters((current) => ({ ...current, status }))}>
            <option value="">Все</option>
            {certificateStatuses.map((status) => <option key={status} value={status}>{status.toLowerCase()}</option>)}
          </SelectInput>
        </AdminFormField>
      </AdminFiltersBar>
      <AdminDataTable
        columns={[
          { key: 'code', title: 'Код', render: (item) => <strong>{item.code}</strong> },
          { key: 'amount', title: 'Номинал', render: (item) => formatCurrency(item.amountRub) },
          { key: 'recipient', title: 'Получатель', render: (item) => item.recipientName },
          { key: 'expires', title: 'Срок', render: (item) => formatDate(item.expiresAt) },
          { key: 'status', title: 'Статус', render: (item) => <CertificateStatusBadge status={item.status} /> },
        ]}
        emptyTitle="Сертификаты не найдены"
        getRowKey={(item) => item.id}
        items={certificates.data ?? []}
        onRowClick={setSelected}
      />
      <AdminDrawer title={selected ? `Сертификат ${selected.code}` : 'Новый сертификат'} isOpen={Boolean(selected) || isCreateOpen} onClose={() => { setSelected(null); setCreateOpen(false); }}>
        <CertificateForm
          certificate={selected ?? undefined}
          canCreate={mode === 'super-admin'}
          isSubmitting={createState.isLoading || updateState.isLoading}
          onDelete={mode === 'super-admin' && selected ? () => setDeleteTarget(selected) : undefined}
          onSubmit={(body) => (selected ? updateCertificate({ id: selected.id, body }).unwrap() : createCertificate(body).unwrap()).then(() => {
            setSelected(null);
            setCreateOpen(false);
          })}
        />
      </AdminDrawer>
      <AdminConfirmModal
        confirmLabel="Удалить"
        description="Физическое удаление доступно только superadmin. Если есть связи, сервер вернёт ошибку."
        isLoading={deleteState.isLoading}
        isOpen={Boolean(deleteTarget)}
        title="Удалить сертификат?"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && void deleteCertificate(deleteTarget.id).unwrap().then(() => setDeleteTarget(null))}
      />
    </AdminPageShell>
  );
}

function RequestsWorkspace({ mode }: { mode: AdminMode }) {
  const [filters, setFilters] = useState({ search: '', status: '' });
  const requestFilters = cleanFilters({ search: filters.search, status: filters.status as AdminRequestStatus | '' }) as {
    search?: string;
    status?: AdminRequestStatus;
  };
  const requests = mode === 'super-admin' ? useGetSuperAdminRequestsQuery(requestFilters) : useGetAdminRequestsQuery(requestFilters);
  const [updateAdminRequest, adminState] = useUpdateAdminRequestMutation();
  const [updateSuperRequest, superState] = useUpdateSuperAdminRequestMutation();
  const [selected, setSelected] = useState<AdminRequestDto | null>(null);

  const update = mode === 'super-admin' ? updateSuperRequest : updateAdminRequest;
  const isSubmitting = adminState.isLoading || superState.isLoading;

  return (
    <AdminPageShell title="Обращения" description="Очередь клиентских обращений и смена статуса обработки." error={requests.error} isLoading={requests.isLoading}>
      <AdminFiltersBar>
        <AdminFormField label="Поиск">
          <TextInput value={filters.search} onValueChange={(search) => setFilters((current) => ({ ...current, search }))} />
        </AdminFormField>
        <AdminFormField label="Статус">
          <SelectInput value={filters.status} onValueChange={(status) => setFilters((current) => ({ ...current, status }))}>
            <option value="">Все</option>
            {requestStatuses.map((status) => <option key={status} value={status}>{status.toLowerCase()}</option>)}
          </SelectInput>
        </AdminFormField>
      </AdminFiltersBar>
      <AdminDataTable
        columns={[
          { key: 'client', title: 'Клиент', render: (item) => <strong>{item.user?.fullName || 'Клиент'}</strong> },
          { key: 'subject', title: 'Тема', render: (item) => item.subject },
          { key: 'date', title: 'Дата', render: (item) => formatDateTime(item.createdAt) },
          { key: 'status', title: 'Статус', render: (item) => <RequestStatusBadge status={item.status} /> },
        ]}
        emptyTitle="Обращения не найдены"
        getRowKey={(item) => item.id}
        items={requests.data ?? []}
        onRowClick={setSelected}
      />
      <AdminDrawer title={selected?.subject ?? 'Обращение'} isOpen={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected ? (
          <RequestDetails
            isSubmitting={isSubmitting}
            request={selected}
            onSubmit={(status) => update({ id: selected.id, body: { status } }).unwrap().then(() => setSelected(null))}
          />
        ) : null}
      </AdminDrawer>
    </AdminPageShell>
  );
}

function SubscriptionsWorkspace({ mode }: { mode: AdminMode }) {
  const [filters, setFilters] = useState({ search: '', status: '' });
  const subscriptions = mode === 'super-admin' ? useGetSuperAdminSubscriptionsQuery() : useGetAdminSubscriptionsQuery();
  const [updateStatus, state] = useUpdateSuperAdminSubscriptionStatusMutation();
  const filtered = filterByClientAndStatus(subscriptions.data ?? [], filters);

  return (
    <AdminPageShell title="Подписки" description="Остатки посещений, статус, история начислений и ручные изменения." error={subscriptions.error} isLoading={subscriptions.isLoading}>
      <AdminFiltersBar>
        <AdminFormField label="Клиент">
          <TextInput value={filters.search} onValueChange={(search) => setFilters((current) => ({ ...current, search }))} />
        </AdminFormField>
        <AdminFormField label="Статус">
          <SelectInput value={filters.status} onValueChange={(status) => setFilters((current) => ({ ...current, status }))}>
            <option value="">Все</option>
            {subscriptionStatuses.map((status) => <option key={status} value={status}>{status.toLowerCase()}</option>)}
          </SelectInput>
        </AdminFormField>
      </AdminFiltersBar>
      <AdminDataTable
        columns={[
          { key: 'client', title: 'Клиент', render: (item) => <strong>{item.user.fullName || 'Клиент'}</strong> },
          { key: 'plan', title: 'Тариф', render: (item) => item.plan.name },
          { key: 'period', title: 'Период', render: (item) => `${formatDate(item.startsAt)} — ${formatDate(item.endsAt)}` },
          { key: 'credits', title: 'Остаток', render: (item) => item.plan.includedCredits },
          { key: 'status', title: 'Статус', render: (item) => <SubscriptionStatusBadge status={item.status} /> },
          {
            key: 'actions',
            title: 'Действия',
            render: (item) =>
              mode === 'super-admin' ? (
                <SelectInput
                  disabled={state.isLoading}
                  value={item.status}
                  onValueChange={(status) => void updateStatus({ id: item.id, status: status as AdminSubscriptionStatus }).unwrap()}
                >
                  {subscriptionStatuses.map((status) => <option key={status} value={status}>{status.toLowerCase()}</option>)}
                </SelectInput>
              ) : 'Просмотр',
          },
        ]}
        emptyTitle="Подписки не найдены"
        getRowKey={(item) => item.id}
        items={filtered}
      />
    </AdminPageShell>
  );
}

function PaymentsWorkspace({ mode }: { mode: AdminMode }) {
  const [filters, setFilters] = useState({ search: '', status: '', type: '' });
  const payments = mode === 'super-admin' ? useGetSuperAdminPaymentsQuery() : useGetAdminPaymentsQuery();
  const [updateStatus, state] = useUpdateSuperAdminPaymentStatusMutation();
  const filtered = (payments.data ?? []).filter((payment) => {
    const search = filters.search.trim().toLowerCase();
    const matchesSearch = !search || `${payment.user.fullName} ${payment.user.email ?? ''} ${payment.user.phone ?? ''}`.toLowerCase().includes(search);
    const matchesStatus = !filters.status || payment.status === filters.status;
    const matchesType = !filters.type || payment.purpose.toLowerCase().includes(filters.type);
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <AdminPageShell title="Платежи" description="Платежи по подпискам, сертификатам и разовым услугам." error={payments.error} isLoading={payments.isLoading}>
      <AdminFiltersBar>
        <AdminFormField label="Клиент">
          <TextInput value={filters.search} onValueChange={(search) => setFilters((current) => ({ ...current, search }))} />
        </AdminFormField>
        <AdminFormField label="Статус">
          <SelectInput value={filters.status} onValueChange={(status) => setFilters((current) => ({ ...current, status }))}>
            <option value="">Все</option>
            {paymentStatuses.map((status) => <option key={status} value={status}>{status.toLowerCase()}</option>)}
          </SelectInput>
        </AdminFormField>
        <AdminFormField label="Тип">
          <SelectInput value={filters.type} onValueChange={(type) => setFilters((current) => ({ ...current, type }))}>
            <option value="">Все</option>
            <option value="subscription">Подписка</option>
            <option value="certificate">Сертификат</option>
            <option value="appointment">Разовая услуга</option>
          </SelectInput>
        </AdminFormField>
      </AdminFiltersBar>
      <AdminDataTable
        columns={[
          { key: 'client', title: 'Клиент', render: (item) => <strong>{item.user.fullName || 'Клиент'}</strong> },
          { key: 'amount', title: 'Сумма', render: (item) => formatCurrency(item.amountRub) },
          { key: 'purpose', title: 'Тип', render: (item) => item.purpose },
          { key: 'date', title: 'Дата', render: (item) => formatDateTime(item.createdAt) },
          { key: 'status', title: 'Статус', render: (item) => <PaymentStatusBadge status={item.status} /> },
          {
            key: 'actions',
            title: 'Действия',
            render: (item) =>
              mode === 'super-admin' ? (
                <SelectInput
                  disabled={state.isLoading}
                  value={item.status}
                  onValueChange={(status) => void updateStatus({ id: item.id, status: status as AdminPaymentStatus }).unwrap()}
                >
                  {paymentStatuses.map((status) => <option key={status} value={status}>{status.toLowerCase()}</option>)}
                </SelectInput>
              ) : 'Просмотр',
          },
        ]}
        emptyTitle="Платежи не найдены"
        getRowKey={(item) => item.id}
        items={filtered}
      />
    </AdminPageShell>
  );
}

export function SuperAdminUsersPageExtended() {
  const [filters, setFilters] = useState({ search: '', status: '', role: '' });
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/super-admin');
  const adminUsers = useGetAdminUsersQuery(cleanFilters({ search: filters.search, status: filters.status }), { skip: isSuperAdminPath });
  const superAdminUsers = useGetSuperAdminUsersQuery(cleanFilters({ search: filters.search, status: filters.status }), { skip: !isSuperAdminPath });
  const users = isSuperAdminPath ? superAdminUsers : adminUsers;
  const studios = useGetAdminStudiosQuery();
  const [updateRole, roleState] = useUpdateSuperAdminUserRoleMutation();

  const filtered = (users.data ?? []).filter((user) => !filters.role || user.role === filters.role);

  return (
    <AdminPageShell title="Пользователи и роли" description="Роли, контакты и информация о подписке клиента." error={users.error ?? studios.error} isLoading={users.isLoading || studios.isLoading}>
      <AdminFiltersBar>
        <AdminFormField label="Поиск">
          <TextInput value={filters.search} onValueChange={(search) => setFilters((current) => ({ ...current, search }))} />
        </AdminFormField>
        <AdminFormField label="Роль">
          <SelectInput value={filters.role} onValueChange={(role) => setFilters((current) => ({ ...current, role }))}>
            <option value="">Все</option>
            <option value="CLIENT">client</option>
            <option value="ADMIN">admin</option>
            <option value="SUPER_ADMIN">superadmin</option>
          </SelectInput>
        </AdminFormField>
        <AdminFormField label="Статус">
          <SelectInput value={filters.status} onValueChange={(status) => setFilters((current) => ({ ...current, status }))}>
            <option value="">Все</option>
            <option value="active">active</option>
            <option value="blocked">blocked</option>
          </SelectInput>
        </AdminFormField>
      </AdminFiltersBar>
      <AdminDataTable
        columns={[
          { key: 'user', title: 'Пользователь', render: (item) => <strong>{item.fullName || item.email || 'Без имени'}</strong> },
          { key: 'contacts', title: 'Контакты', render: (item) => item.email || item.phone || '—' },
          {
            key: 'subscription',
            title: 'Подписка',
            render: (item) => (
              <div className={styles.tableCellStack}>
                <AdminStatusBadge label={item.hasActiveSubscription ? 'есть' : 'нет'} tone={item.hasActiveSubscription ? 'success' : 'muted'} />
                {item.subscriptionPlanName ? <span>{item.subscriptionPlanName}</span> : null}
              </div>
            ),
          },
          {
            key: 'role',
            title: 'Роль',
            render: (item) => (
              <SelectInput
                disabled={!isSuperAdminPath || roleState.isLoading}
                value={item.role}
                onValueChange={(role) => void updateRole({ id: item.id, role: role as UserRole, studioIds: item.adminStudios?.map((studio) => studio.id) }).unwrap()}
              >
                <option value="CLIENT">client</option>
                <option value="ADMIN">admin</option>
                <option value="SUPER_ADMIN">superadmin</option>
              </SelectInput>
            ),
          },
          {
            key: 'studio',
            title: 'Студия admin',
            render: (item) =>
              item.role === 'ADMIN' ? (
                <SelectInput
                  disabled={!isSuperAdminPath || roleState.isLoading}
                  value={item.adminStudios?.[0]?.id ?? ''}
                  onValueChange={(studioId) => void updateRole({ id: item.id, role: item.role, studioIds: studioId ? [studioId] : [] }).unwrap()}
                >
                  <option value="">Не назначена</option>
                  {(studios.data ?? []).map((studio) => <option key={studio.id} value={studio.id}>{studio.name}</option>)}
                </SelectInput>
              ) : '—',
          },
          { key: 'status', title: 'Статус', render: (item) => <AdminStatusBadge label={item.status} tone={item.status === 'active' ? 'success' : 'danger'} /> },
        ]}
        emptyTitle="Пользователи не найдены"
        getRowKey={(item) => item.id}
        items={filtered}
      />
    </AdminPageShell>
  );
}

function AppointmentForm({
  appointment,
  clients,
  masters,
  services,
  studios,
  isSubmitting,
  onSubmit,
  onCancel,
}: {
  appointment?: AdminAppointmentDto;
  clients: AdminUserDto[];
  masters: Array<{ id: string; firstName?: string | null; lastName?: string | null; fullName?: string | null }>;
  services: ServiceDto[];
  studios: Array<{ id: string; name: string }>;
  isSubmitting?: boolean;
  onSubmit: (body: UpsertAppointmentPayload) => Promise<unknown>;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState(() => ({
    clientId: appointment?.user?.id ?? clients[0]?.id ?? '',
    serviceId: appointment?.service?.id ?? services[0]?.id ?? '',
    masterId: appointment?.master?.id ?? masters[0]?.id ?? '',
    studioId: appointment?.studio?.id ?? studios[0]?.id ?? '',
    startsAt: toDateTimeInput(appointment?.startsAt),
    status: (appointment?.status as AdminAppointmentStatus | undefined) ?? 'SCHEDULED',
    priceRub: String(appointment?.priceRub ?? services[0]?.priceRub ?? 0),
    note: appointment?.note ?? '',
  }));
  const [message, setMessage] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    try {
      await onSubmit({
        clientId: values.clientId,
        serviceId: values.serviceId,
        masterId: values.masterId,
        studioId: values.studioId,
        startsAt: fromDateTimeInput(values.startsAt),
        status: values.status,
        priceRub: Number(values.priceRub) || 0,
        note: values.note.trim() || undefined,
      });
    } catch (error) {
      setMessage(getErrorText(error, 'Не удалось сохранить запись'));
    }
  };

  return (
    <form className={styles.formGrid} onSubmit={submit}>
      <AdminFormField label="Клиент">
        <SelectInput required value={values.clientId} onValueChange={(clientId) => setValues((current) => ({ ...current, clientId }))}>
          {clients.map((client) => <option key={client.id} value={client.id}>{client.fullName || client.phone || client.email}</option>)}
        </SelectInput>
      </AdminFormField>
      <AdminFormField label="Услуга">
        <SelectInput required value={values.serviceId} onValueChange={(serviceId) => {
          const service = services.find((item) => item.id === serviceId);
          setValues((current) => ({ ...current, serviceId, priceRub: String(service?.priceRub ?? current.priceRub) }));
        }}>
          {services.map((service) => <option key={service.id} value={service.id}>{service.title}</option>)}
        </SelectInput>
      </AdminFormField>
      <AdminFormField label="Мастер">
        <SelectInput required value={values.masterId} onValueChange={(masterId) => setValues((current) => ({ ...current, masterId }))}>
          {masters.map((master) => <option key={master.id} value={master.id}>{formatName(master)}</option>)}
        </SelectInput>
      </AdminFormField>
      <AdminFormField label="Студия">
        <SelectInput required value={values.studioId} onValueChange={(studioId) => setValues((current) => ({ ...current, studioId }))}>
          {studios.map((studio) => <option key={studio.id} value={studio.id}>{studio.name}</option>)}
        </SelectInput>
      </AdminFormField>
      <AdminFormField label="Дата и время">
        <TextInput required type="datetime-local" value={values.startsAt} onValueChange={(startsAt) => setValues((current) => ({ ...current, startsAt }))} />
      </AdminFormField>
      <AdminFormField label="Статус">
        <SelectInput value={values.status} onValueChange={(status) => setValues((current) => ({ ...current, status: status as AdminAppointmentStatus }))}>
          {appointmentStatusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
        </SelectInput>
      </AdminFormField>
      <AdminFormField label="Цена">
        <TextInput min="0" type="number" value={values.priceRub} onValueChange={(priceRub) => setValues((current) => ({ ...current, priceRub }))} />
      </AdminFormField>
      <AdminFormField full label="Комментарий администратора">
        <TextareaInput value={values.note} onValueChange={(note) => setValues((current) => ({ ...current, note }))} />
      </AdminFormField>
      <div className={styles.formActions}>
        <Button isLoading={isSubmitting} type="submit">Сохранить</Button>
        {onCancel ? <Button type="button" variant="danger" onClick={onCancel}>Отменить запись</Button> : null}
        {message ? <span className={styles.formMessage}>{message}</span> : null}
      </div>
    </form>
  );
}

function TariffForm({ tariff, isSubmitting, onSubmit }: { tariff?: AdminSubscriptionPlanDto; isSubmitting?: boolean; onSubmit: (body: UpsertSubscriptionPlanPayload) => Promise<unknown> }) {
  const [values, setValues] = useState(() => ({
    code: tariff?.code ?? '',
    name: tariff?.name ?? '',
    description: tariff?.description ?? '',
    monthlyPriceRub: String(tariff?.monthlyPriceRub ?? 0),
    periodDays: String(tariff?.periodDays ?? 30),
    discountPercent: String(tariff?.discountPercent ?? 0),
    certificateDiscountPercent: String(tariff?.certificateDiscountPercent ?? 0),
    includedCredits: String(tariff?.includedCredits ?? 4),
    freezeCountPerYear: String(tariff?.freezeCountPerYear ?? 0),
    freezeDays: String(tariff?.freezeDays ?? 0),
    familyMembersLimit: String(tariff?.familyMembersLimit ?? 1),
    isActive: tariff?.isActive ?? true,
  }));
  const [message, setMessage] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    try {
      await onSubmit({
        code: values.code.trim(),
        name: values.name.trim(),
        description: values.description.trim(),
        monthlyPriceRub: Number(values.monthlyPriceRub) || 0,
        periodDays: Number(values.periodDays) || 30,
        discountPercent: Number(values.discountPercent) || 0,
        certificateDiscountPercent: Number(values.certificateDiscountPercent) || 0,
        includedCredits: Number(values.includedCredits) || 0,
        freezeCountPerYear: Number(values.freezeCountPerYear) || 0,
        freezeDays: Number(values.freezeDays) || 0,
        familyMembersLimit: Number(values.familyMembersLimit) || 1,
        isActive: values.isActive,
      });
    } catch (error) {
      setMessage(getErrorText(error, 'Не удалось сохранить тариф'));
    }
  };

  return (
    <form className={styles.formGrid} onSubmit={submit}>
      <AdminFormField label="Код"><TextInput required value={values.code} onValueChange={(code) => setValues((current) => ({ ...current, code }))} /></AdminFormField>
      <AdminFormField label="Название"><TextInput required value={values.name} onValueChange={(name) => setValues((current) => ({ ...current, name }))} /></AdminFormField>
      <AdminFormField label="Цена"><TextInput min="0" type="number" value={values.monthlyPriceRub} onValueChange={(monthlyPriceRub) => setValues((current) => ({ ...current, monthlyPriceRub }))} /></AdminFormField>
      <AdminFormField label="Период, дней"><TextInput min="1" type="number" value={values.periodDays} onValueChange={(periodDays) => setValues((current) => ({ ...current, periodDays }))} /></AdminFormField>
      <AdminFormField label="Включено услуг"><TextInput min="0" type="number" value={values.includedCredits} onValueChange={(includedCredits) => setValues((current) => ({ ...current, includedCredits }))} /></AdminFormField>
      <AdminFormField label="Скидка, %"><TextInput min="0" type="number" value={values.discountPercent} onValueChange={(discountPercent) => setValues((current) => ({ ...current, discountPercent }))} /></AdminFormField>
      <AdminFormField label="Участников"><TextInput min="1" type="number" value={values.familyMembersLimit} onValueChange={(familyMembersLimit) => setValues((current) => ({ ...current, familyMembersLimit }))} /></AdminFormField>
      <AdminFormField label="Заморозка, дней"><TextInput min="0" type="number" value={values.freezeDays} onValueChange={(freezeDays) => setValues((current) => ({ ...current, freezeDays }))} /></AdminFormField>
      <AdminFormField full label="Описание"><TextareaInput value={values.description} onValueChange={(description) => setValues((current) => ({ ...current, description }))} /></AdminFormField>
      <div className={styles.formActions}>
        <label className={styles.checkboxCard}>
          <input checked={values.isActive} type="checkbox" onChange={(event) => setValues((current) => ({ ...current, isActive: event.target.checked }))} />
          <span>Активен</span>
        </label>
        <Button isLoading={isSubmitting} type="submit">Сохранить</Button>
        {message ? <span className={styles.formMessage}>{message}</span> : null}
      </div>
    </form>
  );
}

function CertificateForm({
  certificate,
  canCreate,
  isSubmitting,
  onSubmit,
  onDelete,
}: {
  certificate?: AdminCertificateDto;
  canCreate: boolean;
  isSubmitting?: boolean;
  onSubmit: (body: UpsertCertificatePayload) => Promise<unknown>;
  onDelete?: () => void;
}) {
  const [values, setValues] = useState(() => ({
    recipientName: certificate?.recipientName ?? '',
    recipientContact: certificate?.recipientContact ?? '',
    amountRub: String(certificate?.amountRub ?? 3000),
    format: certificate?.format ?? 'EMAIL',
    message: certificate?.message ?? '',
    status: certificate?.status ?? 'ACTIVE',
  }));
  const [message, setMessage] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    try {
      await onSubmit({
        recipientName: values.recipientName.trim(),
        recipientContact: values.recipientContact.trim(),
        amountRub: Number(values.amountRub) || 0,
        format: values.format as 'EMAIL' | 'PAPER',
        message: values.message.trim(),
        status: values.status as AdminCertificateStatus,
      });
    } catch (error) {
      setMessage(getErrorText(error, 'Не удалось сохранить сертификат'));
    }
  };

  return (
    <form className={styles.formGrid} onSubmit={submit}>
      {certificate ? (
        <div className={`${styles.formSection} ${styles.formFieldFull}`}>
          <span className={styles.statusPill}>Код: {certificate.code}</span>
          <span className={styles.fieldHint}>Покупатель: {certificate.buyer?.fullName ?? 'создан вручную'}</span>
        </div>
      ) : null}
      <AdminFormField label="Получатель"><TextInput disabled={!canCreate && !certificate} required value={values.recipientName} onValueChange={(recipientName) => setValues((current) => ({ ...current, recipientName }))} /></AdminFormField>
      <AdminFormField label="Email/телефон"><TextInput disabled={!canCreate && !certificate} required value={values.recipientContact} onValueChange={(recipientContact) => setValues((current) => ({ ...current, recipientContact }))} /></AdminFormField>
      <AdminFormField label="Номинал"><TextInput disabled={!canCreate && !certificate} min="1000" type="number" value={values.amountRub} onValueChange={(amountRub) => setValues((current) => ({ ...current, amountRub }))} /></AdminFormField>
      <AdminFormField label="Статус">
        <SelectInput value={values.status} onValueChange={(status) => setValues((current) => ({ ...current, status: status as AdminCertificateStatus }))}>
          {certificateStatuses.map((status) => <option key={status} value={status}>{status.toLowerCase()}</option>)}
        </SelectInput>
      </AdminFormField>
      <AdminFormField full label="Сообщение"><TextareaInput value={values.message} onValueChange={(nextMessage) => setValues((current) => ({ ...current, message: nextMessage }))} /></AdminFormField>
      <div className={styles.formActions}>
        <Button isLoading={isSubmitting} type="submit">{certificate ? 'Сохранить' : 'Создать'}</Button>
        {onDelete ? <Button type="button" variant="danger" onClick={onDelete}>Удалить</Button> : null}
        {message ? <span className={styles.formMessage}>{message}</span> : null}
      </div>
    </form>
  );
}

function RequestDetails({ request, isSubmitting, onSubmit }: { request: AdminRequestDto; isSubmitting?: boolean; onSubmit: (status: AdminRequestStatus) => Promise<unknown> }) {
  const [status, setStatus] = useState<AdminRequestStatus>(request.status);
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    try {
      await onSubmit(status);
    } catch (error) {
      setMessage(getErrorText(error, 'Не удалось обновить обращение'));
    }
  };

  return (
    <form className={styles.formGrid} onSubmit={submit}>
      <div className={`${styles.formSection} ${styles.formFieldFull}`}>
        <span className={styles.fieldHint}>Клиент</span>
        <strong>{request.user?.fullName || request.user?.email || request.user?.phone || 'Клиент'}</strong>
        <p className={styles.uploadText}>{request.message}</p>
      </div>
      <AdminFormField label="Статус">
        <SelectInput value={status} onValueChange={(value) => setStatus(value as AdminRequestStatus)}>
          {requestStatuses.map((item) => <option key={item} value={item}>{item.toLowerCase()}</option>)}
        </SelectInput>
      </AdminFormField>
      <AdminFormField full label="Ответ клиенту" hint="Пока сохраняется статус. Текст можно использовать как заготовку ответа.">
        <TextareaInput value={answer} onValueChange={setAnswer} />
      </AdminFormField>
      <div className={styles.formActions}>
        <Button isLoading={isSubmitting} type="submit">Сохранить статус</Button>
        {message ? <span className={styles.formMessage}>{message}</span> : null}
      </div>
    </form>
  );
}

function ClientDetails({
  client,
  appointments,
  subscriptions,
  payments,
  certificates,
}: {
  client: AdminUserDto;
  appointments: AdminAppointmentDto[];
  subscriptions: AdminSubscriptionDto[];
  payments: AdminPaymentDto[];
  certificates: AdminCertificateDto[];
}) {
  return (
    <div className={styles.stack}>
      <AdminPanel title="Контакты">
        <dl className={styles.entityMeta}>
          <div className={styles.entityMetaRow}><dt>ФИО</dt><dd>{client.fullName || '—'}</dd></div>
          <div className={styles.entityMetaRow}><dt>Телефон</dt><dd>{client.phone ?? '—'}</dd></div>
          <div className={styles.entityMetaRow}><dt>Email</dt><dd>{client.email ?? '—'}</dd></div>
        </dl>
      </AdminPanel>
      <AdminPanel title="Активная подписка">
        {subscriptions[0] ? <p className={styles.uploadText}>{subscriptions[0].plan.name} · {subscriptions[0].status} · до {formatDate(subscriptions[0].endsAt)}</p> : <AdminEmptyState title="Активной подписки нет" />}
      </AdminPanel>
      <AdminPanel title="История записей">
        {appointments.length ? appointments.slice(0, 5).map((item) => <p className={styles.uploadText} key={item.id}>{formatDateTime(item.startsAt)} · {item.service.title} · {item.status}</p>) : <AdminEmptyState title="Записей нет" />}
      </AdminPanel>
      <AdminPanel title="Платежи и сертификаты">
        <p className={styles.uploadText}>Платежей: {payments.length}</p>
        <p className={styles.uploadText}>Сертификатов: {certificates.length}</p>
      </AdminPanel>
    </div>
  );
}

function SettingsForm({
  settings,
  isSubmitting,
  onSubmit,
}: {
  settings: AdminNetworkSettingsDto;
  isSubmitting?: boolean;
  onSubmit: (body: Partial<AdminNetworkSettingsDto>) => Promise<unknown>;
}) {
  const [values, setValues] = useState(() => ({
    ...settings,
    scheduleStepMinutes: String(settings.scheduleStepMinutes),
    defaultAppointmentDurationMinutes: String(settings.defaultAppointmentDurationMinutes ?? 60),
    minAppointmentDurationMinutes: String(settings.minAppointmentDurationMinutes ?? 5),
    maxAppointmentDurationMinutes: String(settings.maxAppointmentDurationMinutes ?? 180),
    certificateValidityDays: String(settings.certificateValidityDays),
  }));
  const [message, setMessage] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    try {
      await onSubmit({
        ...values,
        scheduleStepMinutes: Number(values.scheduleStepMinutes),
        defaultAppointmentDurationMinutes: Number(values.defaultAppointmentDurationMinutes),
        minAppointmentDurationMinutes: Number(values.minAppointmentDurationMinutes),
        maxAppointmentDurationMinutes: Number(values.maxAppointmentDurationMinutes),
        certificateValidityDays: Number(values.certificateValidityDays),
      } as Partial<AdminNetworkSettingsDto>);
      setMessage('Настройки сохранены');
    } catch (error) {
      setMessage(getErrorText(error, 'Не удалось сохранить настройки'));
    }
  };

  return (
    <AdminPanel>
      <form className={styles.formGrid} onSubmit={submit}>
        <AdminFormField label="Название сети"><TextInput value={values.networkName} onValueChange={(networkName) => setValues((current) => ({ ...current, networkName }))} /></AdminFormField>
        <AdminFormField label="Основной цвет"><TextInput type="color" value={values.primaryColor} onValueChange={(primaryColor) => setValues((current) => ({ ...current, primaryColor }))} /></AdminFormField>
        <AdminFormField label="Email"><TextInput type="email" value={values.contactEmail} onValueChange={(contactEmail) => setValues((current) => ({ ...current, contactEmail }))} /></AdminFormField>
        <AdminFormField label="Телефон поддержки"><TextInput value={values.supportPhone} onValueChange={(supportPhone) => setValues((current) => ({ ...current, supportPhone }))} /></AdminFormField>
        <AdminFormField label="Часы работы"><TextInput value={values.defaultWorkingHours} onValueChange={(defaultWorkingHours) => setValues((current) => ({ ...current, defaultWorkingHours }))} /></AdminFormField>
        <AdminFormField label="Шаг расписания">
          <SelectInput value={values.scheduleStepMinutes} onValueChange={(scheduleStepMinutes) => setValues((current) => ({ ...current, scheduleStepMinutes }))}>
            <option value="5">5 минут</option>
            <option value="10">10 минут</option>
            <option value="15">15 минут</option>
            <option value="30">30 минут</option>
            <option value="60">60 минут</option>
          </SelectInput>
        </AdminFormField>
        <AdminFormField label="Длительность по умолчанию">
          <TextInput min="5" step="5" type="number" value={values.defaultAppointmentDurationMinutes} onValueChange={(defaultAppointmentDurationMinutes) => setValues((current) => ({ ...current, defaultAppointmentDurationMinutes }))} />
        </AdminFormField>
        <AdminFormField label="Минимум минут">
          <TextInput min="5" step="5" type="number" value={values.minAppointmentDurationMinutes} onValueChange={(minAppointmentDurationMinutes) => setValues((current) => ({ ...current, minAppointmentDurationMinutes }))} />
        </AdminFormField>
        <AdminFormField label="Максимум минут">
          <TextInput min="5" step="5" type="number" value={values.maxAppointmentDurationMinutes} onValueChange={(maxAppointmentDurationMinutes) => setValues((current) => ({ ...current, maxAppointmentDurationMinutes }))} />
        </AdminFormField>
        <label className={styles.checkboxCard}>
          <input checked={Boolean(values.allowCustomAppointmentDuration)} type="checkbox" onChange={(event) => setValues((current) => ({ ...current, allowCustomAppointmentDuration: event.target.checked }))} />
          <span>Разрешить нестандартную длительность записи</span>
        </label>
        <AdminFormField label="Срок сертификатов, дней"><TextInput min="1" type="number" value={values.certificateValidityDays} onValueChange={(certificateValidityDays) => setValues((current) => ({ ...current, certificateValidityDays }))} /></AdminFormField>
        <AdminFormField label="Дефолтный статус">
          <SelectInput value={values.defaultAppointmentStatus} onValueChange={(defaultAppointmentStatus) => setValues((current) => ({ ...current, defaultAppointmentStatus: defaultAppointmentStatus as AdminAppointmentStatus }))}>
            {appointmentStatusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </SelectInput>
        </AdminFormField>
        <AdminFormField full label="Правила отмены"><TextareaInput value={values.cancellationRules} onValueChange={(cancellationRules) => setValues((current) => ({ ...current, cancellationRules }))} /></AdminFormField>
        <div className={styles.formActions}>
          <Button isLoading={isSubmitting} type="submit">Сохранить настройки</Button>
          {message ? <span className={styles.formMessage}>{message}</span> : null}
        </div>
      </form>
    </AdminPanel>
  );
}

function AppointmentStatusBadge({ status }: { status: AdminAppointmentStatus }) {
  const tone = status === 'COMPLETED' ? 'success' : status === 'CANCELLED' ? 'danger' : status === 'CONFIRMED' ? 'warning' : 'neutral';
  const label = appointmentStatusOptions.find((item) => item.value === status)?.label ?? status.toLowerCase();
  return <AdminStatusBadge label={label} tone={tone} />;
}

function SubscriptionStatusBadge({ status }: { status: AdminSubscriptionStatus }) {
  const tone = status === 'ACTIVE' ? 'success' : status === 'CANCELLED' || status === 'EXPIRED' ? 'danger' : 'warning';
  return <AdminStatusBadge label={status.toLowerCase()} tone={tone} />;
}

function PaymentStatusBadge({ status }: { status: AdminPaymentStatus }) {
  const tone = status === 'PAID' ? 'success' : status === 'FAILED' || status === 'CANCELLED' ? 'danger' : status === 'REFUNDED' ? 'muted' : 'warning';
  return <AdminStatusBadge label={status.toLowerCase()} tone={tone} />;
}

function CertificateStatusBadge({ status }: { status: AdminCertificateStatus }) {
  const tone = status === 'ACTIVE' ? 'success' : status === 'REDEEMED' ? 'muted' : 'danger';
  return <AdminStatusBadge label={status.toLowerCase()} tone={tone} />;
}

function RequestStatusBadge({ status }: { status: AdminRequestStatus }) {
  const tone = status === 'CLOSED' ? 'muted' : status === 'IN_PROGRESS' ? 'warning' : 'danger';
  return <AdminStatusBadge label={status.toLowerCase()} tone={tone} />;
}

function SimpleBars({ title, items }: { title: string; items: Array<{ label: string; value: number }> }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <AdminPanel title={title}>
      <div className={styles.stack}>
        {items.map((item) => (
          <div className={styles.entityMetaRow} key={item.label}>
            <dt>{item.label}</dt>
            <dd>
              <div style={{ height: 8, borderRadius: 999, background: '#edf2e8', overflow: 'hidden' }}>
                <div style={{ width: `${Math.max((item.value / max) * 100, 8)}%`, height: '100%', background: '#6f8d4e' }} />
              </div>
              {item.value}
            </dd>
          </div>
        ))}
      </div>
    </AdminPanel>
  );
}

function buildTopServices(appointments: AdminAppointmentDto[], services: ServiceDto[]) {
  return services
    .map((service) => ({ label: service.title, value: appointments.filter((appointment) => appointment.service?.id === service.id).length }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 5);
}

function buildStudioLoad(appointments: AdminAppointmentDto[], studios: Array<{ id: string; name: string }>) {
  return studios
    .map((studio) => ({ label: studio.name, value: appointments.filter((appointment) => appointment.studio?.id === studio.id).length }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 5);
}

function sumPayments(payments: AdminPaymentDto[]) {
  return payments.reduce((sum, payment) => sum + payment.amountRub, 0);
}

function filterByClientAndStatus<T extends { user: { fullName?: string | null; email?: string | null; phone?: string | null }; status: string }>(
  items: T[],
  filters: { search: string; status: string },
) {
  const search = filters.search.trim().toLowerCase();
  return items.filter((item) => {
    const matchesSearch = !search || `${item.user.fullName ?? ''} ${item.user.email ?? ''} ${item.user.phone ?? ''}`.toLowerCase().includes(search);
    const matchesStatus = !filters.status || item.status === filters.status;
    return matchesSearch && matchesStatus;
  });
}

function uniqueOptions(options: Array<{ value: string; label: string }>) {
  const seen = new Set<string>();
  return options.filter((option) => {
    if (!option.value || seen.has(option.value)) return false;
    seen.add(option.value);
    return true;
  });
}

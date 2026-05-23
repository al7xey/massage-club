import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { AppointmentDto } from '@/entities/appointment';
import type { MasterDto } from '@/entities/master';
import type { ServiceDto } from '@/entities/service';
import type { StudioDto } from '@/entities/studio';
import {
  type AdminDashboardDto,
  type AdminSummaryDto,
  type AdminUserDto,
  type AuditLogDto,
  type DateAvailabilityDto,
  type ScheduleOverviewDto,
  type SiteContentDto,
  type UpsertMasterPayload,
  type UpsertServicePayload,
  type UpsertStudioPayload,
  type WeeklyScheduleDayDto,
  useBlockSuperAdminUserMutation,
  useCancelSuperAdminAppointmentMutation,
  useCreateAdminDateAvailabilityMutation,
  useCreateAdminMasterMutation,
  useCreateAdminStudioMutation,
  useCreateSuperAdminServiceMutation,
  useDeactivateAdminMasterMutation,
  useDeactivateSuperAdminServiceMutation,
  useDeleteAdminDateAvailabilityMutation,
  useGetAdminDashboardQuery,
  useGetAdminDateAvailabilityQuery,
  useGetAdminMasterQuery,
  useGetAdminMastersQuery,
  useGetAdminScheduleOverviewQuery,
  useGetAdminServicesQuery,
  useGetAdminStudiosQuery,
  useGetAdminWeeklyScheduleQuery,
  useGetSuperAdminAppointmentsQuery,
  useGetSuperAdminAuditLogQuery,
  useGetSuperAdminServicesQuery,
  useGetSuperAdminSiteContentQuery,
  useGetSuperAdminUsersQuery,
  useGetAdminSummaryQuery,
  useUnblockSuperAdminUserMutation,
  useUpdateAdminMasterMutation,
  useUpdateAdminMasterPhotoMutation,
  useUpdateAdminStudioMutation,
  useUpdateAdminWeeklyScheduleMutation,
  useUpdateSuperAdminAppointmentMutation,
  useUpdateSuperAdminServiceMutation,
  useUpdateSuperAdminServicePhotoMutation,
  useUpdateSuperAdminSiteContentMutation,
  useUploadAdminImageMutation,
} from '@/features/admin';
import { appRoutes } from '@/shared/routes';
import { Button, cx } from '@/shared/ui';
import styles from './AdminCrmPages.module.css';

const statusOptions = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;
const availabilityStatuses: DateAvailabilityDto['status'][] = ['available', 'custom', 'unavailable', 'vacation', 'sick', 'other'];
const dayNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

export function AdminDashboardPage() {
  const dashboard = useGetAdminDashboardQuery();
  const schedule = useGetAdminScheduleOverviewQuery();

  return (
    <CrmPage
      title="Рабочее место администратора"
      description="Быстрый обзор мастеров, студий, сегодняшних записей и расписания."
      isLoading={dashboard.isLoading}
      error={dashboard.error}
    >
      <DashboardCards dashboard={dashboard.data} />
      <section className={styles.panel}>
        <PanelHeader title="Ближайшая загрузка" subtitle="Сводка по активным мастерам и записям на неделю" />
        <ScheduleCRMView data={schedule.data} isLoading={schedule.isLoading} compact />
      </section>
    </CrmPage>
  );
}

export function SuperAdminDashboardPage() {
  const dashboard = useGetAdminDashboardQuery();
  const summary = useGetAdminSummaryQuery();

  return (
    <CrmPage
      title="Центр управления сетью"
      description="CRM-обзор публичного сайта, операций, клиентов и административных изменений."
      isLoading={dashboard.isLoading || summary.isLoading}
      error={dashboard.error ?? summary.error}
    >
      <DashboardCards dashboard={dashboard.data} summary={summary.data} />
    </CrmPage>
  );
}

export function AdminMastersPage() {
  return <MastersWorkspace mode="admin" />;
}

export function SuperAdminMastersPage() {
  return <MastersWorkspace mode="super-admin" />;
}

export function AdminMasterDetailsPage() {
  const { id = '' } = useParams();
  const master = useGetAdminMasterQuery(id, { skip: !id });
  const studios = useGetAdminStudiosQuery();
  const services = useGetAdminServicesQuery();
  const [updateMaster, updateMasterState] = useUpdateAdminMasterMutation();
  const [updatePhoto] = useUpdateAdminMasterPhotoMutation();

  if (!id) {
    return <ErrorState title="Мастер не найден" />;
  }

  return (
    <CrmPage
      title={master.data ? fullName(master.data) : 'Карточка мастера'}
      description="Профиль, фото, услуги, студии, недельный шаблон и исключения по датам."
      isLoading={master.isLoading || studios.isLoading || services.isLoading}
      error={master.error ?? studios.error ?? services.error}
    >
      {master.data ? (
        <>
          <section className={styles.panel}>
            <PanelHeader title="Профиль мастера" subtitle="Эти данные используются в админке и на публичной карточке." />
            <MasterForm
              master={master.data}
              services={services.data ?? []}
              studios={studios.data ?? []}
              isSubmitting={updateMasterState.isLoading}
              submitLabel="Сохранить профиль"
              onSubmit={(body) => updateMaster({ id, body }).unwrap()}
              onPhotoUploaded={(photoUrl) => updatePhoto({ id, photoUrl }).unwrap()}
            />
          </section>
          <section className={styles.twoColumn}>
            <MasterWeeklyScheduleEditor masterId={id} studios={studios.data ?? []} />
            <MasterDateAvailabilityEditor masterId={id} studios={studios.data ?? []} />
          </section>
        </>
      ) : (
        <EmptyState title="Мастер не найден" />
      )}
    </CrmPage>
  );
}

export function AdminSchedulePage() {
  const [filters, setFilters] = useState({ from: todayInput(), to: addDaysInput(todayInput(), 6), studioId: '', masterId: '', serviceId: '' });
  const studios = useGetAdminStudiosQuery();
  const masters = useGetAdminMastersQuery();
  const services = useGetAdminServicesQuery();
  const schedule = useGetAdminScheduleOverviewQuery(cleanFilters(filters));

  return (
    <CrmPage title="Расписание" description="CRM-календарь мастеров, смен, свободных окон и записей." isLoading={studios.isLoading || masters.isLoading || services.isLoading} error={studios.error ?? masters.error ?? services.error}>
      <section className={styles.panel}>
        <div className={styles.filters}>
          <label>
            С
            <input type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} />
          </label>
          <label>
            По
            <input type="date" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} />
          </label>
          <label>
            Студия
            <select value={filters.studioId} onChange={(event) => setFilters((current) => ({ ...current, studioId: event.target.value }))}>
              <option value="">Все студии</option>
              {(studios.data ?? []).map((studio) => (
                <option key={studio.id} value={studio.id}>
                  {studio.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Мастер
            <select value={filters.masterId} onChange={(event) => setFilters((current) => ({ ...current, masterId: event.target.value }))}>
              <option value="">Все мастера</option>
              {(masters.data ?? []).map((master) => (
                <option key={master.id} value={master.id}>
                  {fullName(master)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Услуга
            <select value={filters.serviceId} onChange={(event) => setFilters((current) => ({ ...current, serviceId: event.target.value }))}>
              <option value="">Все услуги</option>
              {(services.data ?? []).map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
      <ScheduleCRMView data={schedule.data} isLoading={schedule.isLoading} />
    </CrmPage>
  );
}

export function AdminStudiosPage() {
  const studios = useGetAdminStudiosQuery();
  const [createStudio, createState] = useCreateAdminStudioMutation();

  return (
    <CrmPage title="Студии" description="Адреса и контактные данные филиалов, доступные мастерам и публичному сайту." isLoading={studios.isLoading} error={studios.error}>
      <section className={styles.panel}>
        <PanelHeader title="Добавить студию" />
        <StudioForm
          submitLabel="Добавить"
          isSubmitting={createState.isLoading}
          onSubmit={(body) => createStudio(body as Required<Pick<UpsertStudioPayload, 'address' | 'city' | 'name'>> & UpsertStudioPayload).unwrap()}
        />
      </section>
      <section className={styles.grid}>
        {(studios.data ?? []).map((studio) => (
          <StudioEditableCard key={studio.id} studio={studio} />
        ))}
      </section>
    </CrmPage>
  );
}

export function SuperAdminServicesPage() {
  const services = useGetSuperAdminServicesQuery();
  const [createService, createState] = useCreateSuperAdminServiceMutation();

  return (
    <CrmPage title="Услуги" description="Публичные карточки услуг, цены, длительность, фото, правила и SEO-описания." isLoading={services.isLoading} error={services.error}>
      <section className={styles.panel}>
        <PanelHeader title="Новая услуга" subtitle="После сохранения карточка появится в каталоге и форме записи." />
        <ServiceForm isSubmitting={createState.isLoading} submitLabel="Создать услугу" onSubmit={(body) => createService(requiredServicePayload(body)).unwrap()} />
      </section>
      <section className={styles.grid}>
        {(services.data ?? []).map((service) => (
          <ServiceCardEditable key={service.id} service={service} />
        ))}
      </section>
    </CrmPage>
  );
}

export function SuperAdminServiceDetailsPage() {
  const { id = '' } = useParams();
  const services = useGetSuperAdminServicesQuery();
  const service = services.data?.find((item) => item.id === id || item.slug === id);
  const [updateService, updateState] = useUpdateSuperAdminServiceMutation();
  const [updatePhoto] = useUpdateSuperAdminServicePhotoMutation();

  return (
    <CrmPage title={service?.title ?? 'Услуга'} description="Редактирование публичной карточки услуги." isLoading={services.isLoading} error={services.error}>
      {service ? (
        <section className={styles.panel}>
          <PanelHeader title="Карточка услуги" subtitle="Изменения сохраняются в backend и сразу используются публичным сайтом." />
          <ServiceForm
            service={service}
            isSubmitting={updateState.isLoading}
            submitLabel="Сохранить услугу"
            onSubmit={(body) => updateService({ id: service.id, body }).unwrap()}
            onPhotoUploaded={(imageUrl) => updatePhoto({ id: service.id, imageUrl }).unwrap()}
          />
        </section>
      ) : (
        <EmptyState title="Услуга не найдена" />
      )}
    </CrmPage>
  );
}

export function SuperAdminAppointmentsPage() {
  const [filters, setFilters] = useState({ date: '', status: '', studioId: '', masterId: '' });
  const appointments = useGetSuperAdminAppointmentsQuery(cleanFilters(filters));
  const masters = useGetAdminMastersQuery();
  const studios = useGetAdminStudiosQuery();

  return (
    <CrmPage title="Записи" description="Перенос, отмена и статусы клиентских записей." isLoading={appointments.isLoading || masters.isLoading || studios.isLoading} error={appointments.error ?? masters.error ?? studios.error}>
      <section className={styles.panel}>
        <div className={styles.filters}>
          <label>
            Дата
            <input type="date" value={filters.date} onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))} />
          </label>
          <label>
            Статус
            <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
              <option value="">Все</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            Студия
            <select value={filters.studioId} onChange={(event) => setFilters((current) => ({ ...current, studioId: event.target.value }))}>
              <option value="">Все</option>
              {(studios.data ?? []).map((studio) => (
                <option key={studio.id} value={studio.id}>
                  {studio.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Мастер
            <select value={filters.masterId} onChange={(event) => setFilters((current) => ({ ...current, masterId: event.target.value }))}>
              <option value="">Все</option>
              {(masters.data ?? []).map((master) => (
                <option key={master.id} value={master.id}>
                  {fullName(master)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
      <AppointmentTable appointments={appointments.data ?? []} />
    </CrmPage>
  );
}

export function SuperAdminUsersPage() {
  const [filters, setFilters] = useState({ search: '', status: '' });
  const users = useGetSuperAdminUsersQuery(cleanFilters(filters));

  return (
    <CrmPage title="Пользователи" description="Поиск клиентов и сотрудников, блокировка и разблокировка аккаунтов." isLoading={users.isLoading} error={users.error}>
      <section className={styles.panel}>
        <div className={styles.filters}>
          <label>
            Поиск
            <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Имя, телефон или email" />
          </label>
          <label>
            Статус
            <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
              <option value="">Все</option>
              <option value="active">Активные</option>
              <option value="blocked">Заблокированные</option>
            </select>
          </label>
        </div>
      </section>
      <UserTable users={users.data ?? []} />
    </CrmPage>
  );
}

export function SuperAdminSiteContentPage() {
  const content = useGetSuperAdminSiteContentQuery();

  return (
    <CrmPage title="Контент сайта" description="Редактируемые тексты, контакты, футер и блоки публичного сайта." isLoading={content.isLoading} error={content.error}>
      <SiteContentEditor items={content.data ?? []} />
    </CrmPage>
  );
}

export function SuperAdminAuditLogPage() {
  const auditLog = useGetSuperAdminAuditLogQuery();

  return (
    <CrmPage title="Журнал действий" description="Все критичные изменения мастеров, услуг, контента, записей и пользователей." isLoading={auditLog.isLoading} error={auditLog.error}>
      <AuditLogTable items={auditLog.data ?? []} />
    </CrmPage>
  );
}

function MastersWorkspace({ mode }: { mode: 'admin' | 'super-admin' }) {
  const [search, setSearch] = useState('');
  const masters = useGetAdminMastersQuery(search ? { search } : undefined);
  const studios = useGetAdminStudiosQuery();
  const services = useGetAdminServicesQuery();
  const [createMaster, createState] = useCreateAdminMasterMutation();

  return (
    <CrmPage
      title="Мастера"
      description={mode === 'super-admin' ? 'Полный CRUD мастеров, привязка к студиям и услугам.' : 'Управление профилями мастеров и расписанием.'}
      isLoading={masters.isLoading || studios.isLoading || services.isLoading}
      error={masters.error ?? studios.error ?? services.error}
    >
      <section className={styles.panel}>
        <PanelHeader title="Добавить мастера" />
        <MasterForm
          services={services.data ?? []}
          studios={studios.data ?? []}
          isSubmitting={createState.isLoading}
          submitLabel="Создать мастера"
          onSubmit={(body) => createMaster(requiredMasterPayload(body)).unwrap()}
        />
      </section>
      <section className={styles.panel}>
        <div className={styles.filters}>
          <label>
            Поиск мастера
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Имя или телефон" />
          </label>
        </div>
      </section>
      {(masters.data ?? []).length ? (
        <section className={styles.grid}>
          {(masters.data ?? []).map((master) => (
            <AdminMasterCard key={master.id} master={master} mode={mode} />
          ))}
        </section>
      ) : (
        <EmptyState title="Мастера не найдены" />
      )}
    </CrmPage>
  );
}

function CrmPage({
  children,
  description,
  error,
  isLoading,
  title,
}: {
  children: ReactNode;
  description?: string;
  error?: unknown;
  isLoading?: boolean;
  title: string;
}) {
  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
      </header>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState /> : null}
      {!isLoading && !error ? children : null}
    </div>
  );
}

function DashboardCards({ dashboard, summary }: { dashboard?: AdminDashboardDto; summary?: AdminSummaryDto }) {
  const cards = [
    ['Активные мастера', dashboard?.masters ?? 0],
    ['Студии', dashboard?.activeStudios ?? 0],
    ['Сегодня записей', dashboard?.todayAppointments ?? 0],
    ['Конфликты расписания', dashboard?.scheduleConflicts ?? 0],
    ...(summary
      ? [
          ['Пользователи', summary.users],
          ['Выручка, ₽', summary.paymentsRub],
          ['Абонементы', summary.activeSubscriptions],
          ['Сертификаты', summary.giftCertificates],
        ]
      : []),
  ];

  return (
    <section className={styles.statsGrid}>
      {cards.map(([label, value]) => (
        <article className={styles.statCard} key={label}>
          <span>{label}</span>
          <strong>{formatNumber(value)}</strong>
        </article>
      ))}
    </section>
  );
}

function AdminMasterCard({ master, mode }: { master: MasterDto; mode: 'admin' | 'super-admin' }) {
  const [deactivate, state] = useDeactivateAdminMasterMutation();
  const detailsPath = mode === 'super-admin' ? `/super-admin/masters/${master.id}` : appRoutes.adminMasterDetails(master.id);

  return (
    <article className={styles.masterCard}>
      <div className={styles.media}>{master.photoUrl ? <img src={master.photoUrl} alt="" /> : <span>{initials(fullName(master))}</span>}</div>
      <div className={styles.cardBody}>
        <div className={styles.cardTitleRow}>
          <h3>{fullName(master)}</h3>
          <StatusPill active={master.isActive} />
        </div>
        <p>{master.specialization || 'Специализация не указана'}</p>
        <dl className={styles.metaList}>
          <div>
            <dt>Опыт</dt>
            <dd>{master.experienceYears ?? 0} лет</dd>
          </div>
          <div>
            <dt>Студии</dt>
            <dd>{(master.studios?.length ? master.studios : master.studio ? [master.studio] : []).map((studio) => studio.name).join(', ') || 'Не назначены'}</dd>
          </div>
          <div>
            <dt>Услуги</dt>
            <dd>{master.services?.map((service) => service.title).slice(0, 3).join(', ') || 'Не выбраны'}</dd>
          </div>
        </dl>
        <div className={styles.cardActions}>
          <Link className={styles.linkButton} to={detailsPath}>
            Редактировать
          </Link>
          <Link className={styles.linkButtonSecondary} to={detailsPath}>
            Расписание
          </Link>
          {master.isActive ? (
            <Button size="sm" variant="danger" isLoading={state.isLoading} onClick={() => void deactivate(master.id)}>
              Скрыть
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function MasterForm({
  isSubmitting,
  master,
  onPhotoUploaded,
  onSubmit,
  services,
  studios,
  submitLabel,
}: {
  isSubmitting?: boolean;
  master?: MasterDto;
  onPhotoUploaded?: (photoUrl: string) => Promise<unknown>;
  onSubmit: (body: UpsertMasterPayload) => Promise<unknown>;
  services: ServiceDto[];
  studios: StudioDto[];
  submitLabel: string;
}) {
  const [values, setValues] = useState(() => masterValues(master, studios));
  const [message, setMessage] = useState('');

  useEffect(() => {
    setValues(masterValues(master, studios));
  }, [master, studios]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    try {
      await onSubmit({
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        description: values.description.trim(),
        specialization: values.specialization.trim(),
        experienceYears: Number(values.experienceYears) || 0,
        photoUrl: values.photoUrl.trim(),
        isActive: values.isActive,
        studioIds: values.studioIds,
        serviceIds: values.serviceIds,
      });
      setMessage('Сохранено');
    } catch (error) {
      setMessage(getErrorText(error));
    }
  };

  return (
    <form className={styles.formGrid} onSubmit={submit}>
      <label>
        Имя
        <input required value={values.fullName} onChange={(event) => setValues((current) => ({ ...current, fullName: event.target.value }))} />
      </label>
      <label>
        Телефон
        <input value={values.phone} onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))} />
      </label>
      <label>
        Специализация
        <input value={values.specialization} onChange={(event) => setValues((current) => ({ ...current, specialization: event.target.value }))} />
      </label>
      <label>
        Опыт, лет
        <input min="0" type="number" value={values.experienceYears} onChange={(event) => setValues((current) => ({ ...current, experienceYears: event.target.value }))} />
      </label>
      <label className={styles.fullRow}>
        Описание
        <textarea rows={4} value={values.description} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))} />
      </label>
      <label className={styles.fullRow}>
        Фото
        <input value={values.photoUrl} onChange={(event) => setValues((current) => ({ ...current, photoUrl: event.target.value }))} placeholder="/uploads/..." />
      </label>
      {onPhotoUploaded ? (
        <ImageUploader
          label="Загрузить фото мастера"
          onUploaded={async (url) => {
            await onPhotoUploaded(url);
            setValues((current) => ({ ...current, photoUrl: url }));
          }}
        />
      ) : null}
      <fieldset className={styles.checkGroup}>
        <legend>Студии</legend>
        {studios.map((studio) => (
          <label key={studio.id}>
            <input
              type="checkbox"
              checked={values.studioIds.includes(studio.id)}
              onChange={() => setValues((current) => ({ ...current, studioIds: toggleId(current.studioIds, studio.id) }))}
            />
            {studio.name}
          </label>
        ))}
      </fieldset>
      <fieldset className={styles.checkGroup}>
        <legend>Услуги</legend>
        {services.map((service) => (
          <label key={service.id}>
            <input
              type="checkbox"
              checked={values.serviceIds.includes(service.id)}
              onChange={() => setValues((current) => ({ ...current, serviceIds: toggleId(current.serviceIds, service.id) }))}
            />
            {service.title}
          </label>
        ))}
      </fieldset>
      <label className={styles.switch}>
        <input type="checkbox" checked={values.isActive} onChange={(event) => setValues((current) => ({ ...current, isActive: event.target.checked }))} />
        Активен на сайте
      </label>
      <div className={styles.formActions}>
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
        {message ? <span>{message}</span> : null}
      </div>
    </form>
  );
}

function MasterWeeklyScheduleEditor({ masterId, studios }: { masterId: string; studios: StudioDto[] }) {
  const schedule = useGetAdminWeeklyScheduleQuery(masterId);
  const [updateSchedule, updateState] = useUpdateAdminWeeklyScheduleMutation();
  const [days, setDays] = useState<WeeklyScheduleDayDto[]>(() => defaultScheduleDays(studios[0]?.id));
  const [message, setMessage] = useState('');

  useEffect(() => {
    setDays(schedule.data?.length ? schedule.data : defaultScheduleDays(studios[0]?.id));
  }, [schedule.data, studios]);

  const save = async () => {
    setMessage('');
    try {
      const response = await updateSchedule({ id: masterId, days }).unwrap();
      setMessage(response.warnings?.length ? 'Сохранено, есть предупреждения по будущим записям' : 'Расписание сохранено');
    } catch (error) {
      setMessage(getErrorText(error));
    }
  };

  return (
    <section className={styles.panel}>
      <PanelHeader title="Недельный шаблон" subtitle="Можно добавлять несколько интервалов в один день." />
      {schedule.isLoading ? <LoadingState /> : null}
      <div className={styles.weekGrid}>
        {days.map((day) => (
          <article className={styles.dayCard} key={day.dayOfWeek}>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={day.isWorking}
                onChange={(event) =>
                  setDays((current) =>
                    current.map((item) =>
                      item.dayOfWeek === day.dayOfWeek
                        ? { ...item, isWorking: event.target.checked, intervals: event.target.checked && item.intervals.length === 0 ? [defaultInterval(studios[0]?.id)] : item.intervals }
                        : item,
                    ),
                  )
                }
              />
              {dayNames[day.dayOfWeek - 1]}
            </label>
            {day.isWorking
              ? day.intervals.map((interval, index) => (
                  <div className={styles.intervalRow} key={`${day.dayOfWeek}-${index}`}>
                    <select
                      value={interval.studioId}
                      onChange={(event) => updateInterval(setDays, day.dayOfWeek, index, { studioId: event.target.value })}
                    >
                      {studios.map((studio) => (
                        <option key={studio.id} value={studio.id}>
                          {studio.name}
                        </option>
                      ))}
                    </select>
                    <input type="time" value={interval.startTime} onChange={(event) => updateInterval(setDays, day.dayOfWeek, index, { startTime: event.target.value })} />
                    <input type="time" value={interval.endTime} onChange={(event) => updateInterval(setDays, day.dayOfWeek, index, { endTime: event.target.value })} />
                    <input type="time" value={interval.breakStartTime ?? ''} onChange={(event) => updateInterval(setDays, day.dayOfWeek, index, { breakStartTime: event.target.value || null })} />
                    <input type="time" value={interval.breakEndTime ?? ''} onChange={(event) => updateInterval(setDays, day.dayOfWeek, index, { breakEndTime: event.target.value || null })} />
                    <button type="button" onClick={() => removeInterval(setDays, day.dayOfWeek, index)}>
                      Убрать
                    </button>
                  </div>
                ))
              : null}
            {day.isWorking ? (
              <button type="button" className={styles.inlineAdd} onClick={() => addInterval(setDays, day.dayOfWeek, studios[0]?.id)}>
                + Интервал
              </button>
            ) : null}
          </article>
        ))}
      </div>
      <div className={styles.formActions}>
        <Button isLoading={updateState.isLoading} onClick={save}>
          Сохранить шаблон
        </Button>
        {message ? <span>{message}</span> : null}
      </div>
    </section>
  );
}

function MasterDateAvailabilityEditor({ masterId, studios }: { masterId: string; studios: StudioDto[] }) {
  const availability = useGetAdminDateAvailabilityQuery({ id: masterId });
  const [createAvailability, createState] = useCreateAdminDateAvailabilityMutation();
  const [deleteAvailability] = useDeleteAdminDateAvailabilityMutation();
  const [form, setForm] = useState({ date: todayInput(), status: 'custom' as DateAvailabilityDto['status'], startTime: '10:00', endTime: '18:00', studioId: studios[0]?.id ?? '', reason: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!form.studioId && studios[0]?.id) {
      setForm((current) => ({ ...current, studioId: studios[0].id }));
    }
  }, [form.studioId, studios]);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    try {
      await createAvailability({
        id: masterId,
        body: {
          date: form.date,
          status: form.status,
          startTime: ['available', 'custom'].includes(form.status) ? form.startTime : null,
          endTime: ['available', 'custom'].includes(form.status) ? form.endTime : null,
          studioId: form.studioId || undefined,
          reason: form.reason,
        },
      }).unwrap();
      setMessage('Исключение сохранено');
    } catch (error) {
      setMessage(getErrorText(error));
    }
  };

  return (
    <section className={styles.panel}>
      <PanelHeader title="Исключения по датам" subtitle="Отпуск, больничный, особое время работы или точечная доступность." />
      <form className={styles.compactForm} onSubmit={save}>
        <input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
        <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as DateAvailabilityDto['status'] }))}>
          {availabilityStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select value={form.studioId} onChange={(event) => setForm((current) => ({ ...current, studioId: event.target.value }))}>
          <option value="">Без студии</option>
          {studios.map((studio) => (
            <option key={studio.id} value={studio.id}>
              {studio.name}
            </option>
          ))}
        </select>
        <input type="time" value={form.startTime} onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))} />
        <input type="time" value={form.endTime} onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))} />
        <input value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} placeholder="Причина" />
        <Button type="submit" isLoading={createState.isLoading}>
          Добавить
        </Button>
      </form>
      {message ? <p className={styles.notice}>{message}</p> : null}
      <div className={styles.list}>
        {(availability.data ?? []).map((item) => (
          <article className={styles.listItem} key={item.id}>
            <div>
              <strong>{formatDate(item.date)}</strong>
              <span>{item.status} {item.startTime ? `${item.startTime}-${item.endTime}` : ''}</span>
              {item.reason ? <small>{item.reason}</small> : null}
            </div>
            <Button size="sm" variant="danger" onClick={() => void deleteAvailability({ masterId, availabilityId: item.id })}>
              Удалить
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}

function ScheduleCRMView({ compact, data, isLoading }: { compact?: boolean; data?: ScheduleOverviewDto; isLoading?: boolean }) {
  const dates = useMemo(() => buildDateColumns(data?.from, data?.to, compact ? 3 : 7), [compact, data?.from, data?.to]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!data?.masters.length) {
    return <EmptyState title="В расписании пока нет мастеров" />;
  }

  return (
    <div className={cx(styles.schedule, compact && styles.scheduleCompact)}>
      <div className={styles.scheduleHead} style={{ gridTemplateColumns: `220px repeat(${dates.length}, minmax(150px, 1fr))` }}>
        <span>Мастер</span>
        {dates.map((date) => (
          <strong key={date}>{formatDate(date)}</strong>
        ))}
      </div>
      {data.masters.map((master) => (
        <div className={styles.scheduleRow} style={{ gridTemplateColumns: `220px repeat(${dates.length}, minmax(150px, 1fr))` }} key={master.id}>
          <Link className={styles.masterCell} to={appRoutes.adminMasterDetails(master.id)}>
            <span>{master.photoUrl ? <img src={master.photoUrl} alt="" /> : initials(fullName(master))}</span>
            <strong>{fullName(master)}</strong>
          </Link>
          {dates.map((date) => {
            const dayAppointments = data.appointments.filter((appointment) => appointment.master.id === master.id && appointment.startsAt.slice(0, 10) === date);
            const dayShifts = data.shifts.filter((shift) => shift.master.id === master.id && shift.startsAt.slice(0, 10) === date);
            return (
              <div className={styles.scheduleCell} key={`${master.id}-${date}`}>
                {dayShifts.length === 0 ? <span className={styles.unavailable}>Не работает</span> : null}
                {dayShifts.map((shift) => (
                  <span className={styles.freeSlot} key={shift.id}>
                    {formatTime(shift.startsAt)}-{formatTime(shift.endsAt)}
                  </span>
                ))}
                {dayAppointments.map((appointment) => (
                  <article className={styles.appointmentChip} key={appointment.id}>
                    <strong>{appointment.service.title}</strong>
                    <span>{formatTime(appointment.startsAt)} {appointment.status}</span>
                  </article>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ServiceCardEditable({ service }: { service: ServiceDto }) {
  const [deactivate, state] = useDeactivateSuperAdminServiceMutation();
  return (
    <article className={styles.serviceCard}>
      <div className={styles.serviceImage}>{service.imageUrl ? <img src={service.imageUrl} alt="" /> : <span>{service.title.slice(0, 2)}</span>}</div>
      <div className={styles.cardBody}>
        <div className={styles.cardTitleRow}>
          <h3>{service.title}</h3>
          <StatusPill active={service.isActive !== false} />
        </div>
        <p>{service.shortDescription || service.description}</p>
        <dl className={styles.metaList}>
          <div>
            <dt>Цена</dt>
            <dd>{formatMoney(service.priceRub)}</dd>
          </div>
          <div>
            <dt>Длительность</dt>
            <dd>{service.durationMinutes} мин</dd>
          </div>
          <div>
            <dt>Категория</dt>
            <dd>{service.category?.name ?? 'Без категории'}</dd>
          </div>
        </dl>
        <div className={styles.cardActions}>
          <Link className={styles.linkButton} to={appRoutes.superAdminServiceDetails(service.id)}>
            Редактировать
          </Link>
          {service.isActive !== false ? (
            <Button size="sm" variant="danger" isLoading={state.isLoading} onClick={() => void deactivate(service.id)}>
              Скрыть
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ServiceForm({
  isSubmitting,
  onPhotoUploaded,
  onSubmit,
  service,
  submitLabel,
}: {
  isSubmitting?: boolean;
  onPhotoUploaded?: (imageUrl: string) => Promise<unknown>;
  onSubmit: (body: UpsertServicePayload) => Promise<unknown>;
  service?: ServiceDto;
  submitLabel: string;
}) {
  const [values, setValues] = useState(() => serviceValues(service));
  const [message, setMessage] = useState('');

  useEffect(() => {
    setValues(serviceValues(service));
  }, [service]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    try {
      await onSubmit({
        title: values.title.trim(),
        slug: values.slug.trim() || slugify(values.title),
        shortDescription: values.shortDescription.trim(),
        description: values.description.trim(),
        durationMinutes: Number(values.durationMinutes) || 60,
        priceRub: Number(values.priceRub) || 0,
        subscriptionPriceRub: values.subscriptionPriceRub ? Number(values.subscriptionPriceRub) : undefined,
        imageUrl: values.imageUrl.trim(),
        galleryUrls: splitLines(values.galleryUrls),
        contraindications: values.contraindications.trim(),
        benefits: values.benefits.trim(),
        rules: values.rules.trim(),
        seoTitle: values.seoTitle.trim(),
        seoDescription: values.seoDescription.trim(),
        isActive: values.isActive,
      });
      setMessage('Сохранено');
    } catch (error) {
      setMessage(getErrorText(error));
    }
  };

  return (
    <form className={styles.formGrid} onSubmit={submit}>
      <label>
        Название
        <input required value={values.title} onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))} />
      </label>
      <label>
        Slug
        <input value={values.slug} onChange={(event) => setValues((current) => ({ ...current, slug: event.target.value }))} />
      </label>
      <label>
        Цена, ₽
        <input min="0" type="number" value={values.priceRub} onChange={(event) => setValues((current) => ({ ...current, priceRub: event.target.value }))} />
      </label>
      <label>
        Цена по подписке, ₽
        <input min="0" type="number" value={values.subscriptionPriceRub} onChange={(event) => setValues((current) => ({ ...current, subscriptionPriceRub: event.target.value }))} />
      </label>
      <label>
        Длительность, мин
        <input min="15" type="number" value={values.durationMinutes} onChange={(event) => setValues((current) => ({ ...current, durationMinutes: event.target.value }))} />
      </label>
      <label className={styles.fullRow}>
        Короткое описание
        <input value={values.shortDescription} onChange={(event) => setValues((current) => ({ ...current, shortDescription: event.target.value }))} />
      </label>
      <label className={styles.fullRow}>
        Описание
        <textarea required rows={4} value={values.description} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))} />
      </label>
      <label className={styles.fullRow}>
        Фото
        <input value={values.imageUrl} onChange={(event) => setValues((current) => ({ ...current, imageUrl: event.target.value }))} placeholder="/uploads/..." />
      </label>
      {onPhotoUploaded ? (
        <ImageUploader
          label="Загрузить фото услуги"
          onUploaded={async (url) => {
            await onPhotoUploaded(url);
            setValues((current) => ({ ...current, imageUrl: url }));
          }}
        />
      ) : null}
      <label className={styles.fullRow}>
        Галерея
        <textarea rows={3} value={values.galleryUrls} onChange={(event) => setValues((current) => ({ ...current, galleryUrls: event.target.value }))} placeholder="Каждый URL с новой строки" />
      </label>
      <label>
        Противопоказания
        <textarea rows={3} value={values.contraindications} onChange={(event) => setValues((current) => ({ ...current, contraindications: event.target.value }))} />
      </label>
      <label>
        Преимущества
        <textarea rows={3} value={values.benefits} onChange={(event) => setValues((current) => ({ ...current, benefits: event.target.value }))} />
      </label>
      <label className={styles.fullRow}>
        Правила
        <textarea rows={3} value={values.rules} onChange={(event) => setValues((current) => ({ ...current, rules: event.target.value }))} />
      </label>
      <label>
        SEO title
        <input value={values.seoTitle} onChange={(event) => setValues((current) => ({ ...current, seoTitle: event.target.value }))} />
      </label>
      <label>
        SEO description
        <input value={values.seoDescription} onChange={(event) => setValues((current) => ({ ...current, seoDescription: event.target.value }))} />
      </label>
      <label className={styles.switch}>
        <input type="checkbox" checked={values.isActive} onChange={(event) => setValues((current) => ({ ...current, isActive: event.target.checked }))} />
        Опубликована
      </label>
      <div className={styles.formActions}>
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
        {message ? <span>{message}</span> : null}
      </div>
    </form>
  );
}

function StudioEditableCard({ studio }: { studio: StudioDto }) {
  const [updateStudio, updateState] = useUpdateAdminStudioMutation();
  return (
    <article className={styles.panel}>
      <PanelHeader title={studio.name} subtitle={studio.address} />
      <StudioForm
        studio={studio}
        isSubmitting={updateState.isLoading}
        submitLabel="Сохранить"
        onSubmit={(body) => updateStudio({ id: studio.id, body }).unwrap()}
      />
    </article>
  );
}

function StudioForm({
  isSubmitting,
  onSubmit,
  studio,
  submitLabel,
}: {
  isSubmitting?: boolean;
  onSubmit: (body: UpsertStudioPayload) => Promise<unknown>;
  studio?: StudioDto;
  submitLabel: string;
}) {
  const [values, setValues] = useState(() => ({
    name: studio?.name ?? '',
    city: studio?.city ?? '',
    address: studio?.address ?? '',
    phone: studio?.phone ?? '',
    photoUrl: studio?.photoUrl ?? '',
  }));
  const [message, setMessage] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    try {
      await onSubmit(values);
      setMessage('Сохранено');
    } catch (error) {
      setMessage(getErrorText(error));
    }
  };

  return (
    <form className={styles.compactForm} onSubmit={submit}>
      <input required value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} placeholder="Название" />
      <input required value={values.city} onChange={(event) => setValues((current) => ({ ...current, city: event.target.value }))} placeholder="Город" />
      <input required value={values.address} onChange={(event) => setValues((current) => ({ ...current, address: event.target.value }))} placeholder="Адрес" />
      <input value={values.phone} onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))} placeholder="Телефон" />
      <input value={values.photoUrl} onChange={(event) => setValues((current) => ({ ...current, photoUrl: event.target.value }))} placeholder="Фото" />
      <Button type="submit" isLoading={isSubmitting}>
        {submitLabel}
      </Button>
      {message ? <span>{message}</span> : null}
    </form>
  );
}

function AppointmentTable({ appointments }: { appointments: AppointmentDto[] }) {
  const [updateAppointment] = useUpdateSuperAdminAppointmentMutation();
  const [cancelAppointment] = useCancelSuperAdminAppointmentMutation();

  if (!appointments.length) {
    return <EmptyState title="Записей не найдено" />;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Клиент</th>
            <th>Услуга</th>
            <th>Мастер</th>
            <th>Студия</th>
            <th>Статус</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td>{formatDateTime(appointment.startsAt)}</td>
              <td>{appointment.user?.fullName ?? 'Клиент'}</td>
              <td>{appointment.service.title}</td>
              <td>{fullName(appointment.master)}</td>
              <td>{appointment.studio.name}</td>
              <td>
                <select value={appointment.status} onChange={(event) => void updateAppointment({ id: appointment.id, body: { status: event.target.value } })}>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                {appointment.status !== 'CANCELLED' ? (
                  <Button size="sm" variant="danger" onClick={() => void cancelAppointment({ id: appointment.id, reason: 'Cancelled from CRM' })}>
                    Отменить
                  </Button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserTable({ users }: { users: AdminUserDto[] }) {
  const [blockUser] = useBlockSuperAdminUserMutation();
  const [unblockUser] = useUnblockSuperAdminUserMutation();

  if (!users.length) {
    return <EmptyState title="Пользователи не найдены" />;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Имя</th>
            <th>Email</th>
            <th>Телефон</th>
            <th>Роль</th>
            <th>Статус</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.fullName}</td>
              <td>{user.email ?? '-'}</td>
              <td>{user.phone ?? '-'}</td>
              <td>{user.role}</td>
              <td>{user.status}</td>
              <td>
                {user.status === 'blocked' ? (
                  <Button size="sm" onClick={() => void unblockUser(user.id)}>
                    Разблокировать
                  </Button>
                ) : (
                  <Button size="sm" variant="danger" onClick={() => void blockUser(user.id)}>
                    Заблокировать
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SiteContentEditor({ items }: { items: SiteContentDto[] }) {
  if (!items.length) {
    return <EmptyState title="Контент пока не создан" />;
  }

  return (
    <section className={styles.contentList}>
      {items.map((item) => (
        <SiteContentRow item={item} key={item.key} />
      ))}
    </section>
  );
}

function SiteContentRow({ item }: { item: SiteContentDto }) {
  const [updateContent, updateState] = useUpdateSuperAdminSiteContentMutation();
  const [values, setValues] = useState(() => ({
    title: item.title,
    type: item.type,
    value: serializeValue(item.value),
  }));
  const [message, setMessage] = useState('');

  const save = async () => {
    setMessage('');
    try {
      await updateContent({
        key: item.key,
        body: {
          title: values.title,
          type: values.type,
          value: parseSiteContentValue(values.value, values.type),
        },
      }).unwrap();
      setMessage('Сохранено');
    } catch (error) {
      setMessage(getErrorText(error));
    }
  };

  return (
    <article className={styles.panel}>
      <PanelHeader title={item.key} subtitle={item.title} />
      <div className={styles.formGrid}>
        <label>
          Заголовок
          <input value={values.title} onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))} />
        </label>
        <label>
          Тип
          <select value={values.type} onChange={(event) => setValues((current) => ({ ...current, type: event.target.value as SiteContentDto['type'] }))}>
            <option value="text">text</option>
            <option value="image">image</option>
            <option value="html">html</option>
            <option value="json">json</option>
          </select>
        </label>
        <label className={styles.fullRow}>
          Значение
          <textarea rows={values.type === 'json' ? 6 : 3} value={values.value} onChange={(event) => setValues((current) => ({ ...current, value: event.target.value }))} />
        </label>
      </div>
      <div className={styles.formActions}>
        <Button isLoading={updateState.isLoading} onClick={save}>
          Сохранить
        </Button>
        {message ? <span>{message}</span> : null}
      </div>
    </article>
  );
}

function AuditLogTable({ items }: { items: AuditLogDto[] }) {
  if (!items.length) {
    return <EmptyState title="Журнал пока пуст" />;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Роль</th>
            <th>Действие</th>
            <th>Сущность</th>
            <th>Новое значение</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{formatDateTime(item.createdAt)}</td>
              <td>{item.actorRole}</td>
              <td>{item.action}</td>
              <td>{item.entityType} {item.entityId ?? ''}</td>
              <td>
                <code>{JSON.stringify(item.newValue ?? {})}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ImageUploader({ label, onUploaded }: { label: string; onUploaded: (url: string) => Promise<unknown> }) {
  const [uploadImage, state] = useUploadAdminImageMutation();
  const [message, setMessage] = useState('');

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setMessage('');
    try {
      const result = await uploadImage(file).unwrap();
      await onUploaded(result.url);
      setMessage('Фото загружено');
    } catch (error) {
      setMessage(getErrorText(error));
    }
  };

  return (
    <label className={styles.uploadBox}>
      {label}
      <input accept="image/*" disabled={state.isLoading} type="file" onChange={(event) => void upload(event.target.files?.[0])} />
      {message ? <span>{message}</span> : null}
    </label>
  );
}

function PanelHeader({ subtitle, title }: { subtitle?: string; title: string }) {
  return (
    <header className={styles.panelHeader}>
      <div>
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </header>
  );
}

function LoadingState() {
  return <div className={styles.state}>Загрузка...</div>;
}

function EmptyState({ title }: { title: string }) {
  return <div className={styles.state}>{title}</div>;
}

function ErrorState({ title = 'Не удалось загрузить данные' }: { title?: string }) {
  return <div className={styles.stateError}>{title}</div>;
}

function StatusPill({ active }: { active: boolean }) {
  return <span className={active ? styles.statusActive : styles.statusMuted}>{active ? 'Активен' : 'Скрыт'}</span>;
}

function fullName(master: MasterDto) {
  return `${master.firstName ?? ''} ${master.lastName ?? ''}`.trim() || 'Мастер';
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function masterValues(master: MasterDto | undefined, studios: StudioDto[]) {
  return {
    fullName: master ? fullName(master) : '',
    phone: master?.phone ?? '',
    specialization: master?.specialization ?? '',
    experienceYears: String(master?.experienceYears ?? 0),
    description: master?.bio ?? '',
    photoUrl: master?.photoUrl ?? '',
    isActive: master?.isActive ?? true,
    studioIds: master ? (master.studios?.length ? master.studios : master.studio ? [master.studio] : []).map((studio) => studio.id) : studios[0]?.id ? [studios[0].id] : [],
    serviceIds: master?.services?.map((service) => service.id) ?? [],
  };
}

function serviceValues(service?: ServiceDto) {
  return {
    title: service?.title ?? '',
    slug: service?.slug ?? '',
    shortDescription: service?.shortDescription ?? '',
    description: service?.description ?? '',
    durationMinutes: String(service?.durationMinutes ?? 60),
    priceRub: String(service?.priceRub ?? 0),
    subscriptionPriceRub: service?.subscriptionPriceRub ? String(service.subscriptionPriceRub) : '',
    imageUrl: service?.imageUrl ?? '',
    galleryUrls: (service?.galleryUrls ?? []).join('\n'),
    contraindications: service?.contraindications ?? '',
    benefits: service?.benefits ?? '',
    rules: service?.rules ?? '',
    seoTitle: service?.seoTitle ?? '',
    seoDescription: service?.seoDescription ?? '',
    isActive: service?.isActive ?? true,
  };
}

function requiredMasterPayload(body: UpsertMasterPayload) {
  return {
    ...body,
    fullName: body.fullName || 'Новый мастер',
    studioIds: body.studioIds?.length ? body.studioIds : [],
  };
}

function requiredServicePayload(body: UpsertServicePayload) {
  return {
    ...body,
    title: body.title || 'Новая услуга',
    slug: body.slug || slugify(body.title || 'new-service'),
    description: body.description || 'Описание услуги',
    durationMinutes: body.durationMinutes ?? 60,
    priceRub: body.priceRub ?? 0,
  };
}

function toggleId(values: string[], id: string) {
  return values.includes(id) ? values.filter((value) => value !== id) : [...values, id];
}

function defaultScheduleDays(studioId = ''): WeeklyScheduleDayDto[] {
  return Array.from({ length: 7 }, (_, index) => ({
    dayOfWeek: index + 1,
    isWorking: index < 5,
    intervals: index < 5 ? [defaultInterval(studioId)] : [],
  }));
}

function defaultInterval(studioId = '') {
  return {
    studioId,
    isWorking: true,
    startTime: '10:00',
    endTime: '18:00',
    breakStartTime: '14:00',
    breakEndTime: '15:00',
  };
}

function updateInterval(
  setDays: Dispatch<SetStateAction<WeeklyScheduleDayDto[]>>,
  dayOfWeek: number,
  index: number,
  patch: Partial<WeeklyScheduleDayDto['intervals'][number]>,
) {
  setDays((current) =>
    current.map((day) =>
      day.dayOfWeek === dayOfWeek
        ? {
            ...day,
            intervals: day.intervals.map((interval, intervalIndex) => (intervalIndex === index ? { ...interval, ...patch } : interval)),
          }
        : day,
    ),
  );
}

function addInterval(setDays: Dispatch<SetStateAction<WeeklyScheduleDayDto[]>>, dayOfWeek: number, studioId = '') {
  setDays((current) =>
    current.map((day) => (day.dayOfWeek === dayOfWeek ? { ...day, intervals: [...day.intervals, defaultInterval(studioId)] } : day)),
  );
}

function removeInterval(setDays: Dispatch<SetStateAction<WeeklyScheduleDayDto[]>>, dayOfWeek: number, index: number) {
  setDays((current) =>
    current.map((day) =>
      day.dayOfWeek === dayOfWeek
        ? {
            ...day,
            intervals: day.intervals.filter((_, intervalIndex) => intervalIndex !== index),
          }
        : day,
    ),
  );
}

function cleanFilters<T extends Record<string, string>>(filters: T) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value)) as Partial<T>;
}

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysInput(date: string, days: number) {
  const value = new Date(`${date}T00:00:00`);
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
}

function buildDateColumns(from?: string, to?: string, limit = 7) {
  const start = from ? new Date(from) : new Date();
  const end = to ? new Date(to) : new Date(start.getTime() + (limit - 1) * 86_400_000);
  const dates: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end && dates.length < limit) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short' }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', hour: '2-digit', minute: '2-digit', month: 'short' }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function formatMoney(value: number) {
  return `${formatNumber(value)} ₽`;
}

function formatNumber(value: unknown) {
  return Number(value ?? 0).toLocaleString('ru-RU');
}

function serializeValue(value: unknown) {
  return typeof value === 'string' ? value : JSON.stringify(value ?? {}, null, 2);
}

function parseSiteContentValue(value: string, type: SiteContentDto['type']) {
  if (type !== 'json') {
    return value;
  }
  return JSON.parse(value);
}

function splitLines(value: string) {
  return value
    .split(/[\n,]/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '');
}

function getErrorText(error: unknown) {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: { message?: string | string[] } }).data;
    if (Array.isArray(data?.message)) return data.message.join(', ');
    if (data?.message) return data.message;
  }
  return error instanceof Error ? error.message : 'Ошибка сохранения';
}

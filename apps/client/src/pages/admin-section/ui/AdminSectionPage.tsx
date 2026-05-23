import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import type { AppointmentDto } from '@/entities/appointment';
import type { MasterDto } from '@/entities/master';
import type { ServiceDto } from '@/entities/service';
import type { StudioDto } from '@/entities/studio';
import {
  useBlockSuperAdminUserMutation,
  useCancelSuperAdminAppointmentMutation,
  useCreateAdminMasterMutation,
  useCreateAdminScheduleMutation,
  useDeactivateAdminMasterMutation,
  useDeleteAdminScheduleMutation,
  useGetAdminMasterQuery,
  useGetAdminMastersQuery,
  useGetAdminSchedulesQuery,
  useGetAdminServicesQuery,
  useGetAdminStudiosQuery,
  useGetSuperAdminAppointmentsQuery,
  useGetSuperAdminAuditLogQuery,
  useGetSuperAdminUsersQuery,
  useUnblockSuperAdminUserMutation,
  useUpdateAdminMasterMutation,
  useUpdateSuperAdminAppointmentMutation,
} from '@/features/admin';
import { useAuth } from '@/features/auth';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { appRoutes } from '@/shared/routes';
import { Button } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './AdminSectionPage.module.css';

type Section = 'masters' | 'studios' | 'schedule' | 'users' | 'appointments' | 'audit-log';

interface MasterFormState {
  fullName: string;
  phone: string;
  description: string;
  specialization: string;
  experienceYears: string;
  photoUrl: string;
  isActive: boolean;
  studioIds: string[];
  serviceIds: string[];
}

interface ScheduleFormState {
  masterId: string;
  studioId: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface AppointmentFormState {
  id: string;
  clientId: string;
  serviceId: string;
  masterId: string;
  studioId: string;
  date: string;
  startTime: string;
  status: string;
  priceRub: string;
}

const emptyMasterForm: MasterFormState = {
  fullName: '',
  phone: '',
  description: '',
  specialization: '',
  experienceYears: '0',
  photoUrl: '',
  isActive: true,
  studioIds: [],
  serviceIds: [],
};

const today = new Date().toISOString().slice(0, 10);
const timeOptions = Array.from({ length: 10 }, (_, index) => `${String(index + 10).padStart(2, '0')}:00`);
const endTimeOptions = Array.from({ length: 10 }, (_, index) => `${String(index + 11).padStart(2, '0')}:00`);

export function AdminSectionPage() {
  const location = useLocation();
  const { id: masterIdFromRoute } = useParams();
  const { user } = useAuth();
  const section = resolveSection(location.pathname);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const [masterSearch, setMasterSearch] = useState('');
  const [masterStudioFilter, setMasterStudioFilter] = useState('');
  const [masterActiveFilter, setMasterActiveFilter] = useState('');
  const [masterForm, setMasterForm] = useState<MasterFormState>(emptyMasterForm);
  const [scheduleFilters, setScheduleFilters] = useState({ masterId: '', studioId: '', date: today });
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormState>({
    masterId: '',
    studioId: '',
    date: today,
    startTime: '10:00',
    endTime: '19:00',
  });
  const [userSearch, setUserSearch] = useState('');
  const [userStatus, setUserStatus] = useState('');
  const [appointmentFilters, setAppointmentFilters] = useState({ date: today, studioId: '', masterId: '', status: '' });
  const [appointmentForm, setAppointmentForm] = useState<AppointmentFormState | null>(null);
  const [message, setMessage] = useState('');

  const { data: studios = [] } = useGetAdminStudiosQuery(undefined, { skip: !['masters', 'studios', 'schedule', 'appointments'].includes(section) });
  const { data: services = [] } = useGetAdminServicesQuery(undefined, { skip: !['masters', 'appointments'].includes(section) });
  const { data: masters = [] } = useGetAdminMastersQuery(
    section === 'masters'
      ? { search: masterSearch || undefined, studioId: masterStudioFilter || undefined, isActive: masterActiveFilter || undefined }
      : undefined,
    { skip: !['masters', 'schedule', 'appointments'].includes(section) },
  );
  const { data: selectedMaster } = useGetAdminMasterQuery(masterIdFromRoute ?? '', { skip: !masterIdFromRoute });
  const { data: schedules = [], error: schedulesError } = useGetAdminSchedulesQuery(
    { masterId: scheduleFilters.masterId || undefined, studioId: scheduleFilters.studioId || undefined, date: scheduleFilters.date || undefined },
    { skip: section !== 'schedule' },
  );
  const { data: adminUsers = [], error: usersError } = useGetSuperAdminUsersQuery(
    { search: userSearch || undefined, status: userStatus || undefined },
    { skip: section !== 'users' || !isSuperAdmin },
  );
  const { data: appointments = [], error: appointmentsError } = useGetSuperAdminAppointmentsQuery(
    {
      date: appointmentFilters.date || undefined,
      studioId: appointmentFilters.studioId || undefined,
      masterId: appointmentFilters.masterId || undefined,
      status: appointmentFilters.status || undefined,
    },
    { skip: section !== 'appointments' || !isSuperAdmin },
  );
  const { data: auditLog = [], error: auditError } = useGetSuperAdminAuditLogQuery(undefined, {
    skip: section !== 'audit-log' || !isSuperAdmin,
  });

  const [createMaster, createMasterState] = useCreateAdminMasterMutation();
  const [updateMaster, updateMasterState] = useUpdateAdminMasterMutation();
  const [deactivateMaster] = useDeactivateAdminMasterMutation();
  const [createSchedule, createScheduleState] = useCreateAdminScheduleMutation();
  const [deleteSchedule] = useDeleteAdminScheduleMutation();
  const [blockUser] = useBlockSuperAdminUserMutation();
  const [unblockUser] = useUnblockSuperAdminUserMutation();
  const [updateAppointment, updateAppointmentState] = useUpdateSuperAdminAppointmentMutation();
  const [cancelAppointment] = useCancelSuperAdminAppointmentMutation();

  const visibleMasters = useMemo(() => (section === 'masters' ? masters : masters.filter((master) => master.isActive)), [masters, section]);
  const title = titles[section];
  const error = schedulesError || usersError || appointmentsError || auditError;

  useEffect(() => {
    if (!selectedMaster) {
      return;
    }
    setMasterForm({
      fullName: getMasterName(selectedMaster),
      phone: selectedMaster.phone ?? '',
      description: selectedMaster.bio ?? '',
      specialization: selectedMaster.specialization ?? '',
      experienceYears: String(selectedMaster.experienceYears ?? 0),
      photoUrl: selectedMaster.photoUrl ?? '',
      isActive: selectedMaster.isActive,
      studioIds: getMasterStudioIds(selectedMaster),
      serviceIds: selectedMaster.services?.map((service) => service.id) ?? [],
    });
  }, [selectedMaster]);

  useEffect(() => {
    if (appointmentForm || appointments.length === 0) {
      return;
    }
    setAppointmentForm(buildAppointmentForm(appointments[0]));
  }, [appointmentForm, appointments]);

  const submitMaster = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    try {
      const body = {
        fullName: masterForm.fullName,
        phone: masterForm.phone,
        description: masterForm.description,
        specialization: masterForm.specialization,
        experienceYears: Number(masterForm.experienceYears || 0),
        photoUrl: masterForm.photoUrl,
        isActive: masterForm.isActive,
        studioIds: masterForm.studioIds,
        serviceIds: masterForm.serviceIds,
      };
      if (masterIdFromRoute) {
        await updateMaster({ id: masterIdFromRoute, body }).unwrap();
        setMessage('Мастер обновлен.');
      } else {
        await createMaster(body).unwrap();
        setMasterForm(emptyMasterForm);
        setMessage('Мастер создан.');
      }
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Не удалось сохранить мастера'));
    }
  };

  const submitSchedule = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    try {
      await createSchedule({ ...scheduleForm, isAvailable: true }).unwrap();
      setMessage('Смена создана.');
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Не удалось создать смену'));
    }
  };

  const submitAppointment = async (event: FormEvent) => {
    event.preventDefault();
    if (!appointmentForm) {
      return;
    }
    setMessage('');
    try {
      await updateAppointment({
        id: appointmentForm.id,
        body: {
          clientId: appointmentForm.clientId,
          serviceId: appointmentForm.serviceId,
          masterId: appointmentForm.masterId,
          studioId: appointmentForm.studioId,
          date: appointmentForm.date,
          startTime: appointmentForm.startTime,
          status: appointmentForm.status,
          priceRub: Number(appointmentForm.priceRub || 0),
        },
      }).unwrap();
      setMessage('Запись обновлена.');
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Не удалось обновить запись'));
    }
  };

  return (
    <PageShell title={title}>
      <AdminNav isSuperAdmin={isSuperAdmin} />
      {message ? <p className={styles.notice}>{message}</p> : null}
      {error ? <p className={styles.error}>{getApiErrorMessage(error, 'Не удалось загрузить данные')}</p> : null}

      {section === 'masters' ? (
        <div className={styles.layout}>
          <section className={styles.card}>
            <div className={styles.toolbar}>
              <input value={masterSearch} onChange={(event) => setMasterSearch(event.target.value)} placeholder="Поиск по имени или телефону" />
              <select value={masterStudioFilter} onChange={(event) => setMasterStudioFilter(event.target.value)}>
                <option value="">Все студии</option>
                {studios.map((studio) => <option value={studio.id} key={studio.id}>{studio.name}</option>)}
              </select>
              <select value={masterActiveFilter} onChange={(event) => setMasterActiveFilter(event.target.value)}>
                <option value="">Все статусы</option>
                <option value="true">Активные</option>
                <option value="false">Отключенные</option>
              </select>
            </div>
            <Table
              headers={['Мастер', 'Студии', 'Услуги', 'Статус', 'Действия']}
              rows={visibleMasters.map((master) => [
                getMasterName(master),
                getMasterStudioNames(master, studios),
                String(master.services?.length ?? 0),
                master.isActive ? 'active' : 'disabled',
                <span className={styles.actions} key={master.id}>
                  <Link to={`/admin/masters/${master.id}`}>Редактировать</Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Отключить мастера?')) void deactivateMaster(master.id);
                    }}
                  >
                    Отключить
                  </button>
                </span>,
              ])}
            />
          </section>
          <MasterForm
            form={masterForm}
            isLoading={createMasterState.isLoading || updateMasterState.isLoading}
            isEdit={Boolean(masterIdFromRoute)}
            services={services}
            setForm={setMasterForm}
            studios={studios}
            onSubmit={submitMaster}
          />
        </div>
      ) : null}

      {section === 'studios' ? (
        <section className={styles.card}>
          <Table
            headers={['Студия', 'Адрес', 'Телефон', 'Статус']}
            rows={studios.map((studio) => [studio.name, `${studio.city}, ${studio.address}`, studio.phone ?? '-', studio.isActive === false ? 'disabled' : 'active'])}
          />
        </section>
      ) : null}

      {section === 'schedule' ? (
        <div className={styles.layout}>
          <section className={styles.card}>
            <div className={styles.toolbar}>
              <select value={scheduleFilters.masterId} onChange={(event) => setScheduleFilters((state) => ({ ...state, masterId: event.target.value }))}>
                <option value="">Все мастера</option>
                {masters.map((master) => <option value={master.id} key={master.id}>{getMasterName(master)}</option>)}
              </select>
              <select value={scheduleFilters.studioId} onChange={(event) => setScheduleFilters((state) => ({ ...state, studioId: event.target.value }))}>
                <option value="">Все студии</option>
                {studios.map((studio) => <option value={studio.id} key={studio.id}>{studio.name}</option>)}
              </select>
              <input type="date" value={scheduleFilters.date} onChange={(event) => setScheduleFilters((state) => ({ ...state, date: event.target.value }))} />
            </div>
            <Table
              headers={['Дата', 'Время', 'Мастер', 'Студия', 'Статус', 'Действия']}
              rows={schedules.map((shift) => [
                formatDate(shift.startsAt),
                `${formatTime(shift.startsAt)} - ${formatTime(shift.endsAt)}`,
                getMasterName(shift.master),
                shift.studio.name,
                shift.isAvailable ? 'active' : 'disabled',
                <button
                  key={shift.id}
                  type="button"
                  onClick={() => {
                    if (window.confirm('Деактивировать смену? Если есть активные записи, backend не даст это сделать.')) void deleteSchedule(shift.id);
                  }}
                >
                  Деактивировать
                </button>,
              ])}
            />
          </section>
          <section className={styles.card}>
            <h2>Новая смена</h2>
            <form className={styles.form} onSubmit={submitSchedule}>
              <SelectField label="Мастер" value={scheduleForm.masterId} onChange={(value) => setScheduleForm((state) => ({ ...state, masterId: value }))}>
                <option value="">Выберите мастера</option>
                {masters.map((master) => <option value={master.id} key={master.id}>{getMasterName(master)}</option>)}
              </SelectField>
              <SelectField label="Студия" value={scheduleForm.studioId} onChange={(value) => setScheduleForm((state) => ({ ...state, studioId: value }))}>
                <option value="">Выберите студию</option>
                {studios.map((studio) => <option value={studio.id} key={studio.id}>{studio.name}</option>)}
              </SelectField>
              <label>Дата<input required type="date" value={scheduleForm.date} onChange={(event) => setScheduleForm((state) => ({ ...state, date: event.target.value }))} /></label>
              <SelectField label="Начало" value={scheduleForm.startTime} onChange={(value) => setScheduleForm((state) => ({ ...state, startTime: value }))}>
                {timeOptions.map((time) => <option value={time} key={time}>{time}</option>)}
              </SelectField>
              <SelectField label="Окончание" value={scheduleForm.endTime} onChange={(value) => setScheduleForm((state) => ({ ...state, endTime: value }))}>
                {endTimeOptions.map((time) => <option value={time} key={time}>{time}</option>)}
              </SelectField>
              <Button type="submit" isLoading={createScheduleState.isLoading}>Создать смену</Button>
            </form>
          </section>
        </div>
      ) : null}

      {section === 'users' ? (
        <section className={styles.card}>
          <div className={styles.toolbar}>
            <input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Имя, телефон или email" />
            <select value={userStatus} onChange={(event) => setUserStatus(event.target.value)}>
              <option value="">Все статусы</option>
              <option value="active">active</option>
              <option value="blocked">blocked</option>
            </select>
          </div>
          <Table
            headers={['Клиент', 'Email', 'Телефон', 'Роль', 'Статус', 'Действия']}
            rows={adminUsers.map((adminUser) => [
              adminUser.fullName,
              adminUser.email ?? '-',
              adminUser.phone ?? '-',
              adminUser.role,
              adminUser.status,
              adminUser.status === 'active' ? (
                <button key={adminUser.id} type="button" onClick={() => window.confirm('Заблокировать пользователя?') && void blockUser(adminUser.id)}>
                  Заблокировать
                </button>
              ) : (
                <button key={adminUser.id} type="button" onClick={() => void unblockUser(adminUser.id)}>Разблокировать</button>
              ),
            ])}
          />
        </section>
      ) : null}

      {section === 'appointments' ? (
        <div className={styles.layout}>
          <section className={styles.card}>
            <div className={styles.toolbar}>
              <input type="date" value={appointmentFilters.date} onChange={(event) => setAppointmentFilters((state) => ({ ...state, date: event.target.value }))} />
              <select value={appointmentFilters.studioId} onChange={(event) => setAppointmentFilters((state) => ({ ...state, studioId: event.target.value }))}>
                <option value="">Все студии</option>
                {studios.map((studio) => <option value={studio.id} key={studio.id}>{studio.name}</option>)}
              </select>
              <select value={appointmentFilters.masterId} onChange={(event) => setAppointmentFilters((state) => ({ ...state, masterId: event.target.value }))}>
                <option value="">Все мастера</option>
                {masters.map((master) => <option value={master.id} key={master.id}>{getMasterName(master)}</option>)}
              </select>
              <select value={appointmentFilters.status} onChange={(event) => setAppointmentFilters((state) => ({ ...state, status: event.target.value }))}>
                <option value="">Все статусы</option>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <Table
              headers={['Дата', 'Клиент', 'Услуга', 'Мастер', 'Студия', 'Статус', 'Действия']}
              rows={appointments.map((appointment) => [
                `${formatDate(appointment.startsAt)} ${formatTime(appointment.startsAt)}`,
                appointment.user?.fullName ?? '-',
                appointment.service.title,
                getMasterName(appointment.master),
                appointment.studio.name,
                appointment.status,
                <span className={styles.actions} key={appointment.id}>
                  <button type="button" onClick={() => setAppointmentForm(buildAppointmentForm(appointment))}>Изменить</button>
                  <button
                    type="button"
                    onClick={() => {
                      const reason = window.prompt('Причина отмены') ?? undefined;
                      if (reason !== undefined) void cancelAppointment({ id: appointment.id, reason });
                    }}
                  >
                    Отменить
                  </button>
                </span>,
              ])}
            />
          </section>
          <section className={styles.card}>
            <h2>Изменить запись</h2>
            {appointmentForm ? (
              <form className={styles.form} onSubmit={submitAppointment}>
                <label>Дата<input required type="date" value={appointmentForm.date} onChange={(event) => setAppointmentForm((state) => state && { ...state, date: event.target.value })} /></label>
                <SelectField label="Время" value={appointmentForm.startTime} onChange={(value) => setAppointmentForm((state) => state && { ...state, startTime: value })}>
                  {timeOptions.map((time) => <option value={time} key={time}>{time}</option>)}
                </SelectField>
                <SelectField label="Услуга" value={appointmentForm.serviceId} onChange={(value) => setAppointmentForm((state) => state && { ...state, serviceId: value })}>
                  {services.map((service) => <option value={service.id} key={service.id}>{service.title}</option>)}
                </SelectField>
                <SelectField label="Мастер" value={appointmentForm.masterId} onChange={(value) => setAppointmentForm((state) => state && { ...state, masterId: value })}>
                  {masters.map((master) => <option value={master.id} key={master.id}>{getMasterName(master)}</option>)}
                </SelectField>
                <SelectField label="Студия" value={appointmentForm.studioId} onChange={(value) => setAppointmentForm((state) => state && { ...state, studioId: value })}>
                  {studios.map((studio) => <option value={studio.id} key={studio.id}>{studio.name}</option>)}
                </SelectField>
                <SelectField label="Статус" value={appointmentForm.status} onChange={(value) => setAppointmentForm((state) => state && { ...state, status: value })}>
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </SelectField>
                <label>Цена<input min="0" type="number" value={appointmentForm.priceRub} onChange={(event) => setAppointmentForm((state) => state && { ...state, priceRub: event.target.value })} /></label>
                <Button type="submit" isLoading={updateAppointmentState.isLoading}>Сохранить запись</Button>
              </form>
            ) : (
              <p>Выберите запись из таблицы.</p>
            )}
          </section>
        </div>
      ) : null}

      {section === 'audit-log' ? (
        <section className={styles.card}>
          <Table
            headers={['Дата', 'Роль', 'Действие', 'Сущность', 'ID']}
            rows={auditLog.map((entry) => [
              `${formatDate(entry.createdAt)} ${formatTime(entry.createdAt)}`,
              entry.actorRole,
              entry.action,
              entry.entityType,
              entry.entityId ?? '-',
            ])}
          />
        </section>
      ) : null}
    </PageShell>
  );
}

function AdminNav({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  return (
    <nav className={styles.nav}>
      <Link to={appRoutes.admin()}>Dashboard</Link>
      <Link to={appRoutes.adminSection('masters')}>Мастера</Link>
      <Link to={appRoutes.adminSection('studios')}>Студии</Link>
      <Link to={appRoutes.adminSection('schedule')}>Расписание</Link>
      {isSuperAdmin ? <Link to={appRoutes.superAdminSection('users')}>Пользователи</Link> : null}
      {isSuperAdmin ? <Link to={appRoutes.superAdminSection('appointments')}>Записи</Link> : null}
      {isSuperAdmin ? <Link to={appRoutes.superAdminSection('audit-log')}>Журнал</Link> : null}
    </nav>
  );
}

function MasterForm({
  form,
  isEdit,
  isLoading,
  services,
  setForm,
  studios,
  onSubmit,
}: {
  form: MasterFormState;
  isEdit: boolean;
  isLoading: boolean;
  services: ServiceDto[];
  setForm: (next: MasterFormState | ((state: MasterFormState) => MasterFormState)) => void;
  studios: StudioDto[];
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <section className={styles.card}>
      <h2>{isEdit ? 'Редактировать мастера' : 'Новый мастер'}</h2>
      <form className={styles.form} onSubmit={onSubmit}>
        <label>Имя<input required value={form.fullName} onChange={(event) => setForm((state) => ({ ...state, fullName: event.target.value }))} /></label>
        <label>Телефон<input value={form.phone} onChange={(event) => setForm((state) => ({ ...state, phone: event.target.value }))} /></label>
        <label>Специализация<input value={form.specialization} onChange={(event) => setForm((state) => ({ ...state, specialization: event.target.value }))} /></label>
        <label>Опыт, лет<input min="0" type="number" value={form.experienceYears} onChange={(event) => setForm((state) => ({ ...state, experienceYears: event.target.value }))} /></label>
        <label>Фото URL<input value={form.photoUrl} onChange={(event) => setForm((state) => ({ ...state, photoUrl: event.target.value }))} /></label>
        <label>Описание<textarea value={form.description} onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))} /></label>
        <label className={styles.checkbox}><input checked={form.isActive} type="checkbox" onChange={(event) => setForm((state) => ({ ...state, isActive: event.target.checked }))} /> Активен</label>
        <fieldset>
          <legend>Студии</legend>
          {studios.map((studio) => (
            <label className={styles.checkbox} key={studio.id}>
              <input
                checked={form.studioIds.includes(studio.id)}
                type="checkbox"
                onChange={() => setForm((state) => ({ ...state, studioIds: toggleId(state.studioIds, studio.id) }))}
              />
              {studio.name}
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Услуги</legend>
          {services.map((service) => (
            <label className={styles.checkbox} key={service.id}>
              <input
                checked={form.serviceIds.includes(service.id)}
                type="checkbox"
                onChange={() => setForm((state) => ({ ...state, serviceIds: toggleId(state.serviceIds, service.id) }))}
              />
              {service.title}
            </label>
          ))}
        </fieldset>
        <Button type="submit" isLoading={isLoading}>{isEdit ? 'Сохранить' : 'Создать'}</Button>
      </form>
    </section>
  );
}

function SelectField({ children, label, value, onChange }: { children: ReactNode; label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      {label}
      <select required value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: Array<Array<ReactNode>> }) {
  if (rows.length === 0) {
    return <p>Данных пока нет.</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, index) => <td key={index}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function resolveSection(pathname: string): Section {
  if (pathname.includes('/super-admin/users')) return 'users';
  if (pathname.includes('/super-admin/appointments')) return 'appointments';
  if (pathname.includes('/super-admin/audit-log')) return 'audit-log';
  if (pathname.includes('/admin/studios')) return 'studios';
  if (pathname.includes('/admin/schedule')) return 'schedule';
  return 'masters';
}

const titles: Record<Section, string> = {
  masters: 'Мастера',
  studios: 'Студии',
  schedule: 'Расписание мастеров',
  users: 'Пользователи',
  appointments: 'Записи',
  'audit-log': 'Журнал действий',
};

function toggleId(items: string[], id: string) {
  return items.includes(id) ? items.filter((item) => item !== id) : [...items, id];
}

function getMasterName(master: MasterDto) {
  return `${master.firstName} ${master.lastName}`.trim();
}

function getMasterStudioIds(master: MasterDto) {
  const ids = new Set<string>();
  master.studios?.forEach((studio) => ids.add(studio.id));
  if (master.studio?.id) ids.add(master.studio.id);
  return [...ids];
}

function getMasterStudioNames(master: MasterDto, studios: StudioDto[]) {
  const studioById = new Map(studios.map((studio) => [studio.id, studio.name]));
  return getMasterStudioIds(master)
    .map((id) => studioById.get(id))
    .filter(Boolean)
    .join(', ') || '-';
}

function buildAppointmentForm(appointment: AppointmentDto): AppointmentFormState {
  const startsAt = new Date(appointment.startsAt);
  return {
    id: appointment.id,
    clientId: appointment.user?.id ?? '',
    serviceId: appointment.service.id,
    masterId: appointment.master.id,
    studioId: appointment.studio.id,
    date: startsAt.toISOString().slice(0, 10),
    startTime: `${String(startsAt.getHours()).padStart(2, '0')}:00`,
    status: appointment.status,
    priceRub: String(appointment.priceRub),
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU').format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

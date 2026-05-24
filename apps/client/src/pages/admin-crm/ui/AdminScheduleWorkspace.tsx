import { skipToken } from '@reduxjs/toolkit/query';
import { useEffect, useMemo, useState } from 'react';
import type { PublicUserDto } from '@massage/shared';
import type { MasterDto } from '@/entities/master';
import type { ServiceDto } from '@/entities/service';
import type { StudioDto } from '@/entities/studio';
import {
  type AdminAppointmentStatus,
  type AdminDateAvailabilityDto,
  type AdminMasterShiftDto,
  type AdminScheduleOverviewDto,
  type UpsertAdminDateAvailabilityPayload,
  type UpsertAdminMasterShiftPayload,
  type UpsertAppointmentPayload,
  type WeeklyScheduleDayDto,
  useCancelAdminAppointmentMutation,
  useCreateAdminAppointmentMutation,
  useCreateAdminDateAvailabilityMutation,
  useCreateAdminMasterShiftMutation,
  useDeleteAdminDateAvailabilityMutation,
  useDeleteAdminMasterShiftMutation,
  useGetAdminClientsQuery,
  useGetAdminDateAvailabilityQuery,
  useGetAdminMastersQuery,
  useGetAdminMasterShiftsQuery,
  useGetAdminScheduleDayQuery,
  useGetAdminScheduleWeekQuery,
  useGetAdminServicesQuery,
  useGetAdminSettingsQuery,
  useGetAdminStudiosQuery,
  useGetSuperAdminSettingsQuery,
  useGetAdminWeeklyScheduleQuery,
  useUpdateAdminAppointmentMutation,
  useUpdateAdminDateAvailabilityMutation,
  useUpdateAdminMasterShiftMutation,
  useUpdateAdminWeeklyScheduleMutation,
} from '@/features/admin';
import { appRoutes } from '@/shared/routes';
import { Button, LinkButton } from '@/shared/ui';
import {
  AdminEmptyState,
  AdminStatusBadge,
  cleanFilters,
  formatDate,
  formatDateTime,
  formatName,
  fromDateTimeInput,
  getErrorText,
  toDateInput,
  toDateTimeInput,
} from './adminShared';
import styles from './AdminScheduleWorkspace.module.css';

const weekdayLabels = [
  { dayOfWeek: 1, label: 'Понедельник' },
  { dayOfWeek: 2, label: 'Вторник' },
  { dayOfWeek: 3, label: 'Среда' },
  { dayOfWeek: 4, label: 'Четверг' },
  { dayOfWeek: 5, label: 'Пятница' },
  { dayOfWeek: 6, label: 'Суббота' },
  { dayOfWeek: 7, label: 'Воскресенье' },
];

const statusOptions: { value: AdminAppointmentStatus | ''; label: string }[] = [
  { value: '', label: 'Все статусы' },
  { value: 'SCHEDULED', label: 'Новая' },
  { value: 'CONFIRMED', label: 'Подтверждена' },
  { value: 'COMPLETED', label: 'Завершена' },
  { value: 'CANCELLED', label: 'Отменена' },
];

const fallbackGridStepMinutes = 30;
const defaultShiftStart = '10:00';
const defaultShiftEnd = '20:00';
const fallbackAppointmentDuration = 60;
const fallbackMinAppointmentDuration = 5;
const fallbackMaxAppointmentDuration = 180;

type ScheduleMode = 'admin' | 'super-admin';
type ScheduleView = 'day' | 'week';
type EditorState =
  | { type: 'appointment'; appointment?: ScheduleAppointment; draft?: Partial<AppointmentFormValues> }
  | { type: 'shift'; shift?: AdminMasterShiftDto; draft?: Partial<ShiftFormValues> }
  | null;

type ScheduleAppointment = AdminScheduleOverviewDto['appointments'][number];

interface ShiftFormValues {
  masterId: string;
  studioId: string;
  startsAt: string;
  endsAt: string;
  isAvailable: boolean;
}

interface AppointmentFormValues {
  clientId: string;
  serviceId: string;
  masterId: string;
  studioId: string;
  startsAt: string;
  durationMinutes: string;
  status: AdminAppointmentStatus;
  priceRub: string;
  note: string;
}

export function ScheduleWorkspace({ mode }: { mode: ScheduleMode }) {
  const [view, setView] = useState<ScheduleView>('day');
  const [currentDate, setCurrentDate] = useState(() => startOfLocalDay(new Date()));
  const [filters, setFilters] = useState({ masterId: '', status: '' as AdminAppointmentStatus | '', studioId: '' });
  const [selectedDate, setSelectedDate] = useState(() => toDateInput(new Date()));
  const [editor, setEditor] = useState<EditorState>(null);
  const [notice, setNotice] = useState('');

  const masters = useGetAdminMastersQuery();
  const studios = useGetAdminStudiosQuery();
  const services = useGetAdminServicesQuery();
  const clients = useGetAdminClientsQuery();
  const adminSettings = useGetAdminSettingsQuery(undefined, { skip: mode !== 'admin' });
  const superAdminSettings = useGetSuperAdminSettingsQuery(undefined, { skip: mode !== 'super-admin' });
  const scheduleSettings = mode === 'super-admin' ? superAdminSettings.data : adminSettings.data;
  const gridStepMinutes = scheduleSettings?.scheduleStepMinutes ?? fallbackGridStepMinutes;
  const defaultAppointmentDuration = scheduleSettings?.defaultAppointmentDurationMinutes ?? fallbackAppointmentDuration;
  const minAppointmentDuration = scheduleSettings?.minAppointmentDurationMinutes ?? fallbackMinAppointmentDuration;
  const maxAppointmentDuration = scheduleSettings?.maxAppointmentDurationMinutes ?? fallbackMaxAppointmentDuration;
  const allowCustomAppointmentDuration = scheduleSettings?.allowCustomAppointmentDuration ?? true;

  const dayQuery = useGetAdminScheduleDayQuery(
    view === 'day'
      ? cleanFilters({
          date: toDateInput(currentDate),
          masterId: filters.masterId,
          studioId: filters.studioId,
        })
      : skipToken,
  );
  const weekQuery = useGetAdminScheduleWeekQuery(
    view === 'week'
      ? cleanFilters({
          startDate: toDateInput(startOfWeek(currentDate)),
          masterId: filters.masterId,
          studioId: filters.studioId,
        })
      : skipToken,
  );

  const selectedData = view === 'day' ? dayQuery.data : weekQuery.data;
  const settingsLoading = mode === 'super-admin' ? superAdminSettings.isLoading : adminSettings.isLoading;
  const settingsError = mode === 'super-admin' ? superAdminSettings.error : adminSettings.error;
  const isLoading = masters.isLoading || studios.isLoading || services.isLoading || clients.isLoading || settingsLoading || dayQuery.isLoading || weekQuery.isLoading;
  const error = masters.error ?? studios.error ?? services.error ?? clients.error ?? settingsError ?? dayQuery.error ?? weekQuery.error;

  const appointments = useMemo(() => {
    const source = selectedData?.appointments ?? [];
    return filters.status ? source.filter((appointment) => appointment.status === filters.status) : source;
  }, [filters.status, selectedData?.appointments]);

  const filteredData = useMemo<AdminScheduleOverviewDto | undefined>(() => {
    if (!selectedData) return undefined;
    return { ...selectedData, appointments };
  }, [appointments, selectedData]);

  const visibleMasters = filteredData?.masters ?? [];
  const selectedMaster = visibleMasters.find((master) => master.id === filters.masterId) ?? visibleMasters[0];
  const selectedStudioId = filters.studioId || studios.data?.[0]?.id || selectedMaster?.studio?.id || selectedMaster?.studios?.[0]?.id || '';
  const dateRange = {
    from: filteredData?.from?.slice(0, 10) ?? toDateInput(currentDate),
    to: filteredData?.to?.slice(0, 10) ?? toDateInput(currentDate),
  };

  const weeklySchedule = useGetAdminWeeklyScheduleQuery(selectedMaster?.id ?? skipToken);
  const dateAvailability = useGetAdminDateAvailabilityQuery(
    selectedMaster ? { id: selectedMaster.id, from: dateRange.from, to: dateRange.to } : skipToken,
  );
  const shiftList = useGetAdminMasterShiftsQuery(
    selectedMaster
      ? cleanFilters({
          masterId: selectedMaster.id,
          studioId: filters.studioId,
          date: selectedDate,
        })
      : skipToken,
  );

  const [createShift] = useCreateAdminMasterShiftMutation();
  const [deleteShift] = useDeleteAdminMasterShiftMutation();

  const focusMaster = (masterId: string) => {
    setFilters((current) => ({ ...current, masterId }));
  };

  const openShiftEditor = (master: MasterDto, minute = timeToMinutes(defaultShiftStart), shift?: AdminMasterShiftDto) => {
    const date = selectedDate || toDateInput(currentDate);
    setEditor({
      type: 'shift',
      shift,
      draft: {
        masterId: master.id,
        studioId: shift?.studio.id ?? selectedStudioId,
        startsAt: toDateTimeInput(shift?.startsAt) || dateTimeInputFromParts(date, minute),
        endsAt: toDateTimeInput(shift?.endsAt) || dateTimeInputFromParts(date, Math.max(minute + 60, timeToMinutes(defaultShiftEnd))),
        isAvailable: shift?.isAvailable ?? true,
      },
    });
    setSelectedDate(date);
    setNotice('');
  };

  const openAppointmentEditor = (master?: MasterDto, minute = timeToMinutes(defaultShiftStart), appointment?: ScheduleAppointment) => {
    const date = appointment ? toDateInput(new Date(appointment.startsAt)) : selectedDate || toDateInput(currentDate);
    const service = appointment?.service ?? services.data?.[0];
    const duration = appointment ? diffMinutes(appointment.startsAt, appointment.endsAt) : service?.durationMinutes ?? defaultAppointmentDuration;
    setEditor({
      type: 'appointment',
      appointment,
      draft: {
        clientId: appointment?.user?.id ?? '',
        serviceId: appointment?.service.id ?? service?.id ?? '',
        masterId: appointment?.master.id ?? master?.id ?? filters.masterId,
        studioId: appointment?.studio.id ?? selectedStudioId,
        startsAt: toDateTimeInput(appointment?.startsAt) || dateTimeInputFromParts(date, minute),
        durationMinutes: String(Math.max(5, duration)),
        status: (appointment?.status as AdminAppointmentStatus | undefined) ?? 'SCHEDULED',
        priceRub: String(appointment?.priceRub ?? service?.priceRub ?? 0),
        note: appointment?.note ?? '',
      },
    });
    setSelectedDate(date);
    setNotice('');
  };

  const copyShift = async (shift: AdminMasterShiftDto, days: number) => {
    const copies = Array.from({ length: days }, (_, index) => index + 1);
    try {
      await Promise.all(
        copies.map((offset) =>
          createShift({
            masterId: shift.master.id,
            studioId: shift.studio.id,
            startsAt: addDays(new Date(shift.startsAt), offset).toISOString(),
            endsAt: addDays(new Date(shift.endsAt), offset).toISOString(),
            isAvailable: shift.isAvailable,
          }).unwrap(),
        ),
      );
      setNotice(days === 1 ? 'Смена скопирована на завтра' : 'Смена скопирована на неделю');
    } catch (error) {
      setNotice(getErrorText(error, 'Не удалось скопировать смену'));
    }
  };

  const copyMasterDay = async (master: MasterDto) => {
    focusMaster(master.id);
    const date = selectedDate || toDateInput(currentDate);
    const shifts = (filteredData?.shifts ?? []).filter((shift) => shift.master.id === master.id && sameDate(shift.startsAt, date));

    if (!shifts.length) {
      setNotice(`У ${formatName(master)} нет смен на выбранный день`);
      return;
    }

    try {
      await Promise.all(
        shifts.map((shift) =>
          createShift({
            masterId: shift.master.id,
            studioId: shift.studio.id,
            startsAt: addDays(new Date(shift.startsAt), 1).toISOString(),
            endsAt: addDays(new Date(shift.endsAt), 1).toISOString(),
            isAvailable: shift.isAvailable,
          }).unwrap(),
        ),
      );
      setNotice(`День ${formatName(master)} скопирован на завтра`);
    } catch (error) {
      setNotice(getErrorText(error, 'Не удалось скопировать день'));
    }
  };

  const clearEmptyShifts = async (masterId: string) => {
    const shifts = (filteredData?.shifts ?? []).filter((shift) => shift.master.id === masterId && sameDate(shift.startsAt, selectedDate));
    const removable = shifts.filter((shift) => !appointments.some((appointment) => intervalsOverlap(shift.startsAt, shift.endsAt, appointment.startsAt, appointment.endsAt)));

    if (!removable.length) {
      setNotice('Пустых смен для очистки нет');
      return;
    }

    try {
      await Promise.all(removable.map((shift) => deleteShift(shift.id).unwrap()));
      setNotice(`Очищено пустых смен: ${removable.length}`);
    } catch (error) {
      setNotice(getErrorText(error, 'Не удалось очистить пустые смены'));
    }
  };

  const navigateDate = (direction: -1 | 1) => {
    const days = view === 'day' ? direction : direction * 7;
    const next = addDays(currentDate, days);
    setCurrentDate(next);
    setSelectedDate(toDateInput(next));
  };

  return (
    <div className={styles.workspace}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarTop}>
          <div>
            <h2 className={styles.scheduleTitle}>Расписание</h2>
            <p className={styles.helperText}>{view === 'day' ? formatDate(toDateInput(currentDate)) : formatRange(startOfWeek(currentDate), addDays(startOfWeek(currentDate), 6))}</p>
          </div>
          <div className={styles.toolbarActions}>
            <Button size="sm" type="button" variant="secondary" onClick={() => navigateDate(-1)}>
              ‹
            </Button>
            <Button
              size="sm"
              type="button"
              variant="secondary"
              onClick={() => {
                const today = startOfLocalDay(new Date());
                setCurrentDate(today);
                setSelectedDate(toDateInput(today));
              }}
            >
              Сегодня
            </Button>
            <Button size="sm" type="button" variant="secondary" onClick={() => navigateDate(1)}>
              ›
            </Button>
            <div className={styles.viewTabs} role="group" aria-label="Вид расписания">
              <Button size="sm" type="button" variant={view === 'day' ? 'primary' : 'secondary'} onClick={() => setView('day')}>
                День
              </Button>
              <Button size="sm" type="button" variant={view === 'week' ? 'primary' : 'secondary'} onClick={() => setView('week')}>
                Неделя
              </Button>
            </div>
            <Button size="sm" type="button" onClick={() => selectedMaster && openShiftEditor(selectedMaster)}>
              Добавить смену
            </Button>
            <Button size="sm" type="button" variant="secondary" onClick={() => openAppointmentEditor(selectedMaster)}>
              Создать запись
            </Button>
          </div>
        </div>

        <div className={styles.filters}>
          <label>
            <span>Дата</span>
            <input
              type="date"
              value={toDateInput(currentDate)}
              onChange={(event) => {
                const next = startOfLocalDay(new Date(`${event.target.value}T12:00:00`));
                setCurrentDate(next);
                setSelectedDate(toDateInput(next));
              }}
            />
          </label>
          {mode === 'super-admin' ? (
            <label>
              <span>Студия</span>
              <select value={filters.studioId} onChange={(event) => setFilters((current) => ({ ...current, studioId: event.target.value }))}>
                <option value="">Все студии</option>
                {(studios.data ?? []).map((studio) => (
                  <option key={studio.id} value={studio.id}>
                    {studio.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label>
            <span>Мастер</span>
            <select value={filters.masterId} onChange={(event) => setFilters((current) => ({ ...current, masterId: event.target.value }))}>
              <option value="">Все мастера</option>
              {(masters.data ?? []).map((master) => (
                <option key={master.id} value={master.id}>
                  {formatName(master)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Статус</span>
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as AdminAppointmentStatus | '' }))}
            >
              {statusOptions.map((status) => (
                <option key={status.value || 'all'} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {notice ? <p className={styles.notice}>{notice}</p> : null}
      {error ? <p className={styles.notice}>{getErrorText(error, 'Не удалось загрузить расписание')}</p> : null}

      <div className={styles.layout}>
        <section className={styles.calendarCard}>
          <div className={styles.calendarMeta}>
            <span className={styles.calendarMetaItem}>Смен: {filteredData?.shifts.length ?? 0}</span>
            <span className={styles.calendarMetaItem}>Записей: {appointments.length}</span>
            <span className={styles.calendarMetaItem}>Шаг сетки: {gridStepMinutes} минут</span>
          </div>

          {isLoading ? <p className={styles.helperText}>Загружаем расписание...</p> : null}
          {!isLoading && !error && filteredData && view === 'day' ? (
            <ScheduleTimeline
              appointments={appointments}
              date={toDateInput(currentDate)}
              gridStepMinutes={gridStepMinutes}
              masters={visibleMasters}
              shifts={filteredData.shifts}
              onAppointmentClick={(appointment) => openAppointmentEditor(appointment.master, minutesOfDay(new Date(appointment.startsAt)), appointment)}
              onClearEmptyShifts={clearEmptyShifts}
              onCopyDay={(master) => void copyMasterDay(master)}
              onOpenAppointment={openAppointmentEditor}
              onOpenBreak={(master) => {
                focusMaster(master.id);
                setEditor(null);
                setSelectedDate(toDateInput(currentDate));
                setNotice(`Перерывы для ${formatName(master)} настраиваются в недельном шаблоне справа.`);
              }}
              onOpenShift={openShiftEditor}
              onShiftClick={(shift) => openShiftEditor(shift.master, minutesOfDay(new Date(shift.startsAt)), shift)}
            />
          ) : null}
          {!isLoading && !error && filteredData && view === 'week' ? (
            <WeekSchedule
              data={filteredData}
              weekStart={startOfWeek(currentDate)}
              onAppointmentClick={(appointment) => openAppointmentEditor(appointment.master, minutesOfDay(new Date(appointment.startsAt)), appointment)}
              onDayClick={(date) => {
                setCurrentDate(date);
                setSelectedDate(toDateInput(date));
                setView('day');
              }}
              onShiftClick={(shift) => openShiftEditor(shift.master, minutesOfDay(new Date(shift.startsAt)), shift)}
            />
          ) : null}
          {!isLoading && !error && filteredData && visibleMasters.length === 0 ? <AdminEmptyState title="Мастеров нет" description="Добавьте мастеров и назначьте им студии." /> : null}
        </section>

        <aside className={styles.editorCard}>
          {editor?.type === 'appointment' ? (
            <AppointmentEditor
              appointment={editor.appointment}
              clients={clients.data ?? []}
              draft={editor.draft}
              masters={masters.data ?? []}
              services={services.data ?? []}
              studios={studios.data ?? []}
              allowCustomAppointmentDuration={allowCustomAppointmentDuration}
              defaultAppointmentDuration={defaultAppointmentDuration}
              gridStepMinutes={gridStepMinutes}
              maxAppointmentDuration={maxAppointmentDuration}
              minAppointmentDuration={minAppointmentDuration}
              onClose={() => setEditor(null)}
            />
          ) : null}
          {editor?.type === 'shift' ? (
            <ShiftEditor
              draft={editor.draft}
              selectedShift={editor.shift}
              studios={studios.data ?? []}
              masters={masters.data ?? []}
              onClose={() => setEditor(null)}
              onCopyShift={copyShift}
            />
          ) : null}
          {!editor && selectedMaster ? (
            <>
              <section className={styles.editorSection}>
                <div className={styles.editorHeader}>
                  <div>
                    <h3>{formatName(selectedMaster)}</h3>
                    <p>{selectedMaster.specialization || 'Мастер'}</p>
                  </div>
                  <LinkButton size="sm" to={buildMasterDetailsPath(mode, selectedMaster.id)} variant="secondary">
                    Открыть мастера
                  </LinkButton>
                </div>
                <div className={styles.masterMeta}>
                  <div className={styles.masterMetaRow}>
                    <span>Дата в фокусе</span>
                    <strong>{formatDate(selectedDate)}</strong>
                  </div>
                  <div className={styles.masterMetaRow}>
                    <span>Студии</span>
                    <strong>{masterStudios(selectedMaster).map((studio) => studio.name).join(', ') || 'Не назначены'}</strong>
                  </div>
                </div>
              </section>

              <ShiftQuickList
                appointments={appointments}
                shifts={shiftList.data ?? []}
                onCopyShift={copyShift}
                onOpenShift={(shift) => openShiftEditor(shift.master, minutesOfDay(new Date(shift.startsAt)), shift)}
              />
              <WeeklyScheduleEditor days={weeklySchedule.data?.days ?? []} masterId={selectedMaster.id} studios={studios.data ?? []} warnings={weeklySchedule.data?.warnings} />
              <DateAvailabilityEditor items={dateAvailability.data ?? []} masterId={selectedMaster.id} selectedDate={selectedDate} studios={studios.data ?? []} />
            </>
          ) : null}
          {!editor && !selectedMaster ? <AdminEmptyState title="Выберите мастера" description="После выбора мастера здесь появятся смены, перерывы и быстрые действия." /> : null}
        </aside>
      </div>
    </div>
  );
}

export function MasterScheduleSection({ master, mode }: { master: MasterDto; mode: ScheduleMode }) {
  const studios = useGetAdminStudiosQuery();
  const weeklySchedule = useGetAdminWeeklyScheduleQuery(master.id);
  const dateAvailability = useGetAdminDateAvailabilityQuery({ id: master.id, from: toDateInput(new Date()), to: toDateInput(addDays(new Date(), 14)) });
  const shiftList = useGetAdminMasterShiftsQuery({ date: toDateInput(new Date()), masterId: master.id });

  return (
    <div className={styles.workspace}>
      <section className={styles.editorCard}>
        <div className={styles.editorSection}>
          <div className={styles.editorHeader}>
            <div>
              <h3>Настройка мастера</h3>
              <p>Недельный шаблон и исключения. Общая сетка записей находится на странице расписания.</p>
            </div>
            <LinkButton size="sm" to={mode === 'super-admin' ? appRoutes.superAdminSection('schedule') : appRoutes.adminSection('schedule')} variant="secondary">
              Общее расписание
            </LinkButton>
          </div>
        </div>
        <ShiftQuickList appointments={[]} shifts={shiftList.data ?? []} />
        <WeeklyScheduleEditor days={weeklySchedule.data?.days ?? []} masterId={master.id} studios={studios.data ?? []} warnings={weeklySchedule.data?.warnings} />
        <DateAvailabilityEditor items={dateAvailability.data ?? []} masterId={master.id} selectedDate={toDateInput(new Date())} studios={studios.data ?? []} />
      </section>
    </div>
  );
}

export function SimpleScheduleWorkspace({ mode }: { mode: ScheduleMode }) {
  const [selectedMasterId, setSelectedMasterId] = useState('');
  const [message, setMessage] = useState('');
  const masters = useGetAdminMastersQuery();
  const studios = useGetAdminStudiosQuery();
  const visibleMasters = masters.data ?? [];
  const selectedMaster = visibleMasters.find((master) => master.id === selectedMasterId) ?? visibleMasters[0];
  const weeklySchedule = useGetAdminWeeklyScheduleQuery(selectedMaster?.id ?? skipToken);
  const [updateWeeklySchedule, updateState] = useUpdateAdminWeeklyScheduleMutation();

  useEffect(() => {
    if (!selectedMasterId && visibleMasters[0]) {
      setSelectedMasterId(visibleMasters[0].id);
    }
  }, [selectedMasterId, visibleMasters]);

  const submit = async (days: WeeklyScheduleDayDto[]) => {
    if (!selectedMaster) return;
    setMessage('');
    try {
      await updateWeeklySchedule({ id: selectedMaster.id, days: expandWeeklyScheduleForStudios(days, getScheduleStudioIds(selectedMaster, studios.data ?? [])) }).unwrap();
      setMessage('Расписание мастера сохранено');
    } catch (error) {
      setMessage(getErrorText(error, 'Не удалось сохранить расписание'));
    }
  };

  return (
    <div className={styles.simpleSchedule}>
      <section className={styles.simpleScheduleMasters}>
        <div className={styles.simpleScheduleHeader}>
          <div>
            <h3>Мастера</h3>
            <p>Выберите мастера и задайте его рабочие часы на каждый день.</p>
          </div>
        </div>
        {masters.isLoading ? <p className={styles.helperText}>Загружаем мастеров...</p> : null}
        {masters.error ? <p className={styles.notice}>{getErrorText(masters.error, 'Не удалось загрузить мастеров')}</p> : null}
        <div className={styles.masterList}>
          {visibleMasters.map((master) => (
            <button
              className={master.id === selectedMaster?.id ? styles.masterListItemActive : styles.masterListItem}
              key={master.id}
              type="button"
              onClick={() => {
                setSelectedMasterId(master.id);
                setMessage('');
              }}
            >
              <strong>{formatName(master)}</strong>
              <span>{master.specialization || 'Мастер'}</span>
            </button>
          ))}
        </div>
        {!masters.isLoading && !visibleMasters.length ? <AdminEmptyState title="Мастеров пока нет" description="Добавьте мастера, чтобы настроить рабочие часы." /> : null}
      </section>

      <section className={styles.simpleScheduleEditor}>
        {selectedMaster ? (
          <>
            <div className={styles.simpleScheduleHeader}>
              <div>
                <h3>{formatName(selectedMaster)}</h3>
                <p>{mode === 'super-admin' ? 'Сетевое расписание мастера' : 'Расписание мастера в вашей студии'}</p>
              </div>
              <LinkButton size="sm" to={buildMasterDetailsPath(mode, selectedMaster.id)} variant="secondary">
                Открыть мастера
              </LinkButton>
            </div>
            {weeklySchedule.isLoading || studios.isLoading ? <p className={styles.helperText}>Загружаем рабочие часы...</p> : null}
            {weeklySchedule.error || studios.error ? <p className={styles.notice}>{getErrorText(weeklySchedule.error ?? studios.error, 'Не удалось загрузить рабочие часы')}</p> : null}
            {!weeklySchedule.isLoading && !studios.isLoading ? (
              <WeeklyScheduleEditor
                days={weeklySchedule.data?.days ?? []}
                masterId={selectedMaster.id}
                studios={studios.data ?? []}
                warnings={weeklySchedule.data?.warnings}
                collapseStudios
                hideStudioChoice
                isSubmitting={updateState.isLoading}
                onSubmit={submit}
              />
            ) : null}
            {message ? <p className={styles.notice}>{message}</p> : null}
          </>
        ) : (
          <AdminEmptyState title="Выберите мастера" />
        )}
      </section>
    </div>
  );
}

function ScheduleTimeline({
  appointments,
  date,
  gridStepMinutes,
  masters,
  shifts,
  onAppointmentClick,
  onClearEmptyShifts,
  onCopyDay,
  onOpenAppointment,
  onOpenBreak,
  onOpenShift,
  onShiftClick,
}: {
  appointments: ScheduleAppointment[];
  date: string;
  gridStepMinutes: number;
  masters: MasterDto[];
  shifts: AdminMasterShiftDto[];
  onAppointmentClick: (appointment: ScheduleAppointment) => void;
  onClearEmptyShifts: (masterId: string) => void;
  onCopyDay: (master: MasterDto) => void;
  onOpenAppointment: (master: MasterDto, minute?: number) => void;
  onOpenBreak: (master: MasterDto) => void;
  onOpenShift: (master: MasterDto, minute?: number) => void;
  onShiftClick: (shift: AdminMasterShiftDto) => void;
}) {
  const { endMinute, startMinute } = useMemo(() => resolveTimelineBounds(shifts, appointments), [appointments, shifts]);
  const slots = useMemo(() => buildSlots(startMinute, endMinute, gridStepMinutes), [endMinute, startMinute]);
  const totalMinutes = endMinute - startMinute;

  return (
    <div className={styles.timeline}>
      <div className={styles.timelineHeader}>
        <div className={styles.masterHeaderCell}>Мастер</div>
        <div className={styles.timeHeader} style={{ gridTemplateColumns: `repeat(${slots.length}, minmax(72px, 1fr))` }}>
          {slots.map((slot) => (
            <span key={slot}>{formatMinute(slot)}</span>
          ))}
        </div>
      </div>

      {masters.map((master) => {
        const masterShifts = shifts.filter((shift) => shift.master.id === master.id && sameDate(shift.startsAt, date));
        const masterAppointments = appointments.filter((appointment) => appointment.master.id === master.id && sameDate(appointment.startsAt, date));
        return (
          <div className={styles.timelineRow} key={master.id}>
            <div className={styles.masterCell}>
              <strong>{formatName(master)}</strong>
              <span>{master.specialization || 'Мастер'}</span>
              <div className={styles.rowActions}>
                <Button size="sm" type="button" variant="secondary" onClick={() => onOpenShift(master)}>
                  Добавить смену
                </Button>
                <Button size="sm" type="button" variant="secondary" onClick={() => onOpenAppointment(master)}>
                  Добавить запись
                </Button>
                <Button size="sm" type="button" variant="ghost" onClick={() => onCopyDay(master)}>
                  Копировать день
                </Button>
                <Button size="sm" type="button" variant="ghost" onClick={() => onClearEmptyShifts(master.id)}>
                  Очистить пустые
                </Button>
                <Button size="sm" type="button" variant="ghost" onClick={() => onOpenBreak(master)}>
                  Настроить перерыв
                </Button>
              </div>
            </div>
            <div className={styles.timeRow}>
              <div className={styles.slotGrid} style={{ gridTemplateColumns: `repeat(${slots.length}, minmax(72px, 1fr))` }}>
                {slots.map((slot) => (
                  <button
                    className={styles.slotButton}
                    key={`${master.id}-${slot}`}
                    type="button"
                    onClick={() => onOpenAppointment(master, slot)}
                  >
                    <span>{formatMinute(slot)}</span>
                  </button>
                ))}
              </div>
              <div className={styles.blocksLayer}>
                {masterShifts.map((shift) => (
                  <button
                    className={styles.shiftBlock}
                    key={shift.id}
                    style={blockStyle(shift.startsAt, shift.endsAt, startMinute, totalMinutes)}
                    type="button"
                    onClick={() => onShiftClick(shift)}
                  >
                    <strong>{formatTimeRange(shift.startsAt, shift.endsAt)}</strong>
                    <span>{shift.studio.name}</span>
                  </button>
                ))}
                {masterAppointments.map((appointment) => (
                  <button
                    className={`${styles.appointmentBlock} ${styles[`status_${appointment.status.toLowerCase()}`] ?? ''}`}
                    key={appointment.id}
                    style={blockStyle(appointment.startsAt, appointment.endsAt, startMinute, totalMinutes)}
                    type="button"
                    onClick={() => onAppointmentClick(appointment)}
                  >
                    <strong>{appointment.service?.title ?? 'Запись'}</strong>
                    <span>{formatTimeRange(appointment.startsAt, appointment.endsAt)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WeekSchedule({
  data,
  weekStart,
  onAppointmentClick,
  onDayClick,
  onShiftClick,
}: {
  data: AdminScheduleOverviewDto;
  weekStart: Date;
  onAppointmentClick: (appointment: ScheduleAppointment) => void;
  onDayClick: (date: Date) => void;
  onShiftClick: (shift: AdminMasterShiftDto) => void;
}) {
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  return (
    <div className={styles.weekGrid}>
      {days.map((day) => {
        const date = toDateInput(day);
        const dayShifts = data.shifts.filter((shift) => sameDate(shift.startsAt, date));
        const dayAppointments = data.appointments.filter((appointment) => sameDate(appointment.startsAt, date));
        return (
          <article className={styles.weekCard} key={date}>
            <button className={styles.weekCardHeader} type="button" onClick={() => onDayClick(day)}>
              <strong>{weekdayShort(day)}</strong>
              <span>{formatDate(date)}</span>
            </button>
            <div className={styles.weekStats}>
              <span>{dayShifts.length} смен</span>
              <span>{dayAppointments.length} записей</span>
            </div>
            <div className={styles.weekList}>
              {dayAppointments.slice(0, 4).map((appointment) => (
                <button className={styles.weekItem} key={appointment.id} type="button" onClick={() => onAppointmentClick(appointment)}>
                  <strong>{formatTimeRange(appointment.startsAt, appointment.endsAt)}</strong>
                  <span>{formatName(appointment.master)} · {appointment.service.title}</span>
                </button>
              ))}
              {!dayAppointments.length
                ? dayShifts.slice(0, 3).map((shift) => (
                    <button className={styles.weekItem} key={shift.id} type="button" onClick={() => onShiftClick(shift)}>
                      <strong>{formatTimeRange(shift.startsAt, shift.endsAt)}</strong>
                      <span>{formatName(shift.master)} · смена</span>
                    </button>
                  ))
                : null}
              {!dayAppointments.length && !dayShifts.length ? <p className={styles.helperText}>Пустой день</p> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function AppointmentEditor({
  allowCustomAppointmentDuration,
  appointment,
  clients,
  defaultAppointmentDuration,
  draft,
  gridStepMinutes,
  masters,
  maxAppointmentDuration,
  minAppointmentDuration,
  services,
  studios,
  onClose,
}: {
  allowCustomAppointmentDuration: boolean;
  appointment?: ScheduleAppointment;
  clients: PublicUserDto[];
  defaultAppointmentDuration: number;
  draft?: Partial<AppointmentFormValues>;
  gridStepMinutes: number;
  masters: MasterDto[];
  maxAppointmentDuration: number;
  minAppointmentDuration: number;
  services: ServiceDto[];
  studios: StudioDto[];
  onClose: () => void;
}) {
  const [values, setValues] = useState(() => buildAppointmentValues(appointment, draft, services, masters, studios, defaultAppointmentDuration));
  const [message, setMessage] = useState('');
  const [createAppointment, createState] = useCreateAdminAppointmentMutation();
  const [updateAppointment, updateState] = useUpdateAdminAppointmentMutation();
  const [cancelAppointment, cancelState] = useCancelAdminAppointmentMutation();

  useEffect(() => {
    setValues(buildAppointmentValues(appointment, draft, services, masters, studios, defaultAppointmentDuration));
  }, [appointment, defaultAppointmentDuration, draft, masters, services, studios]);

  const selectedService = services.find((service) => service.id === values.serviceId);
  const selectedMaster = masters.find((master) => master.id === values.masterId);
  const availableServices = selectedMaster?.services?.length ? selectedMaster.services : services;

  const submit = async () => {
    setMessage('');
    if (!values.clientId || !values.serviceId || !values.masterId || !values.studioId || !values.startsAt) {
      setMessage('Заполните клиента, услугу, мастера, студию и время');
      return;
    }

    const durationMinutes = Number(values.durationMinutes);
    if (!Number.isFinite(durationMinutes) || durationMinutes < minAppointmentDuration) {
      setMessage(`Длительность должна быть не меньше ${minAppointmentDuration} минут`);
      return;
    }

    if (durationMinutes > maxAppointmentDuration) {
      setMessage(`Длительность должна быть не больше ${maxAppointmentDuration} минут`);
      return;
    }

    if (!allowCustomAppointmentDuration && durationMinutes % gridStepMinutes !== 0) {
      setMessage(`Длительность должна быть кратна шагу сетки ${gridStepMinutes} минут`);
      return;
    }

    try {
      const body: UpsertAppointmentPayload = {
        clientId: values.clientId,
        serviceId: values.serviceId,
        masterId: values.masterId,
        studioId: values.studioId,
        startsAt: fromDateTimeInput(values.startsAt),
        durationMinutes,
        status: values.status,
        priceRub: Number(values.priceRub) || selectedService?.priceRub || 0,
        note: values.note.trim() || undefined,
      };

      if (appointment) {
        await updateAppointment({ id: appointment.id, body }).unwrap();
        setMessage('Запись обновлена');
      } else {
        await createAppointment(body).unwrap();
        setMessage('Запись создана');
      }
    } catch (error) {
      setMessage(getErrorText(error, 'Не удалось сохранить запись'));
    }
  };

  const updateStatus = async (status: AdminAppointmentStatus, reason?: string) => {
    if (!appointment) return;
    setMessage('');
    try {
      if (status === 'CANCELLED') {
        await cancelAppointment({ id: appointment.id, reason }).unwrap();
      } else {
        await updateAppointment({ id: appointment.id, body: { status } }).unwrap();
      }
      setValues((current) => ({ ...current, status }));
      setMessage('Статус обновлен');
    } catch (error) {
      setMessage(getErrorText(error, 'Не удалось обновить статус'));
    }
  };

  return (
    <section className={styles.editorSection}>
      <div className={styles.editorHeader}>
        <div>
          <h3>{appointment ? 'Редактировать запись' : 'Создать запись'}</h3>
          <p>Запись сохраняется только внутри активной смены мастера.</p>
        </div>
        <Button size="sm" type="button" variant="ghost" onClick={onClose}>
          Закрыть
        </Button>
      </div>

      {appointment ? (
        <div className={styles.statusActions}>
          <Button size="sm" type="button" variant="secondary" onClick={() => updateStatus('CONFIRMED')}>
            Подтвердить
          </Button>
          <Button size="sm" type="button" variant="secondary" onClick={() => updateStatus('COMPLETED')}>
            Завершить
          </Button>
          <Button size="sm" type="button" variant="secondary" onClick={() => updateStatus('CANCELLED', 'Клиент не пришел')}>
            Не пришел
          </Button>
          <Button size="sm" type="button" variant="ghost" onClick={() => updateStatus('CANCELLED', 'Отмена из админки')}>
            Отменить
          </Button>
        </div>
      ) : null}

      <div className={styles.shiftFormGrid}>
        <label>
          <span>Клиент</span>
          <select value={values.clientId} onChange={(event) => setValues((current) => ({ ...current, clientId: event.target.value }))}>
            <option value="">Выберите клиента</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {formatName(client)} {client.phone ? `· ${client.phone}` : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Услуга</span>
          <select
            value={values.serviceId}
            onChange={(event) => {
              const service = services.find((item) => item.id === event.target.value);
              setValues((current) => ({
                ...current,
                serviceId: event.target.value,
                durationMinutes: current.durationMinutes || String(service?.durationMinutes ?? defaultAppointmentDuration),
                priceRub: String(service?.priceRub ?? current.priceRub),
              }));
            }}
          >
            <option value="">Выберите услугу</option>
            {availableServices.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Мастер</span>
          <select value={values.masterId} onChange={(event) => setValues((current) => ({ ...current, masterId: event.target.value, serviceId: '' }))}>
            <option value="">Любой мастер</option>
            {masters.map((master) => (
              <option key={master.id} value={master.id}>
                {formatName(master)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Студия</span>
          <select value={values.studioId} onChange={(event) => setValues((current) => ({ ...current, studioId: event.target.value }))}>
            <option value="">Выберите студию</option>
            {studios.map((studio) => (
              <option key={studio.id} value={studio.id}>
                {studio.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Начало</span>
          <input type="datetime-local" value={values.startsAt} onChange={(event) => setValues((current) => ({ ...current, startsAt: event.target.value }))} />
        </label>
        <label>
          <span>Длительность, мин</span>
          <input
            max={maxAppointmentDuration}
            min={minAppointmentDuration}
            step={allowCustomAppointmentDuration ? 5 : gridStepMinutes}
            type="number"
            value={values.durationMinutes}
            onChange={(event) => setValues((current) => ({ ...current, durationMinutes: event.target.value }))}
          />
        </label>
        <label>
          <span>Статус</span>
          <select value={values.status} onChange={(event) => setValues((current) => ({ ...current, status: event.target.value as AdminAppointmentStatus }))}>
            {statusOptions.filter((status) => status.value).map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Цена</span>
          <input min="0" type="number" value={values.priceRub} onChange={(event) => setValues((current) => ({ ...current, priceRub: event.target.value }))} />
        </label>
        <label className={styles.fullRow}>
          <span>Комментарий</span>
          <textarea value={values.note} onChange={(event) => setValues((current) => ({ ...current, note: event.target.value }))} />
        </label>
      </div>

      <div className={styles.formActions}>
        <Button isLoading={createState.isLoading || updateState.isLoading} type="button" onClick={() => void submit()}>
          {appointment ? 'Сохранить запись' : 'Создать запись'}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>
          Отмена
        </Button>
        {(cancelState.isLoading || message) ? <span className={styles.formMessage}>{cancelState.isLoading ? 'Обновляем статус...' : message}</span> : null}
      </div>
    </section>
  );
}

function ShiftEditor({
  draft,
  selectedShift,
  studios,
  masters,
  onClose,
  onCopyShift,
}: {
  draft?: Partial<ShiftFormValues>;
  selectedShift?: AdminMasterShiftDto;
  studios: StudioDto[];
  masters: MasterDto[];
  onClose: () => void;
  onCopyShift?: (shift: AdminMasterShiftDto, days: number) => void;
}) {
  const [values, setValues] = useState(() => buildShiftValues(studios[0]?.id ?? '', masters[0]?.id ?? '', draft, selectedShift));
  const [message, setMessage] = useState('');
  const [createShift, createState] = useCreateAdminMasterShiftMutation();
  const [updateShift, updateState] = useUpdateAdminMasterShiftMutation();
  const [deleteShift, deleteState] = useDeleteAdminMasterShiftMutation();

  useEffect(() => {
    setValues(buildShiftValues(studios[0]?.id ?? '', masters[0]?.id ?? '', draft, selectedShift));
  }, [draft, masters, selectedShift, studios]);

  const submit = async () => {
    setMessage('');
    if (!values.masterId || !values.studioId || !values.startsAt || !values.endsAt) {
      setMessage('Заполните мастера, студию, начало и окончание');
      return;
    }

    try {
      const body: UpsertAdminMasterShiftPayload = {
        masterId: values.masterId,
        studioId: values.studioId,
        startsAt: fromDateTimeInput(values.startsAt),
        endsAt: fromDateTimeInput(values.endsAt),
        isAvailable: values.isAvailable,
      };

      if (selectedShift) {
        await updateShift({ id: selectedShift.id, body }).unwrap();
        setMessage('Смена обновлена');
      } else {
        await createShift(body).unwrap();
        setMessage('Смена добавлена');
      }
    } catch (error) {
      setMessage(getErrorText(error, 'Не удалось сохранить смену'));
    }
  };

  const remove = async () => {
    if (!selectedShift) return;
    setMessage('');
    try {
      await deleteShift(selectedShift.id).unwrap();
      setMessage('Смена удалена');
      onClose();
    } catch (error) {
      setMessage(getErrorText(error, 'Нельзя удалить смену с активными записями'));
    }
  };

  return (
    <section className={styles.editorSection}>
      <div className={styles.editorHeader}>
        <div>
          <h3>{selectedShift ? 'Редактировать смену' : 'Добавить смену'}</h3>
          <p>Смена задается точными полями, без перетаскивания по календарю.</p>
        </div>
        <Button size="sm" type="button" variant="ghost" onClick={onClose}>
          Закрыть
        </Button>
      </div>

      {selectedShift ? (
        <div className={styles.statusActions}>
          <Button size="sm" type="button" variant="secondary" onClick={() => onCopyShift?.(selectedShift, 1)}>
            Копировать на завтра
          </Button>
          <Button size="sm" type="button" variant="secondary" onClick={() => onCopyShift?.(selectedShift, 7)}>
            Копировать на неделю
          </Button>
          <Button size="sm" type="button" variant="secondary" onClick={() => setMessage('Перерыв задается в недельном шаблоне мастера ниже.')}>
            Добавить перерыв
          </Button>
        </div>
      ) : null}

      <div className={styles.shiftFormGrid}>
        <label>
          <span>Мастер</span>
          <select value={values.masterId} onChange={(event) => setValues((current) => ({ ...current, masterId: event.target.value }))}>
            <option value="">Выберите мастера</option>
            {masters.map((master) => (
              <option key={master.id} value={master.id}>
                {formatName(master)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Студия</span>
          <select value={values.studioId} onChange={(event) => setValues((current) => ({ ...current, studioId: event.target.value }))}>
            <option value="">Выберите студию</option>
            {studios.map((studio) => (
              <option key={studio.id} value={studio.id}>
                {studio.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Начало</span>
          <input type="datetime-local" value={values.startsAt} onChange={(event) => setValues((current) => ({ ...current, startsAt: event.target.value }))} />
        </label>
        <label>
          <span>Окончание</span>
          <input type="datetime-local" value={values.endsAt} onChange={(event) => setValues((current) => ({ ...current, endsAt: event.target.value }))} />
        </label>
        <label className={styles.checkboxRow}>
          <input checked={values.isAvailable} type="checkbox" onChange={(event) => setValues((current) => ({ ...current, isAvailable: event.target.checked }))} />
          <span>Смена активна</span>
        </label>
      </div>

      <div className={styles.formActions}>
        <Button isLoading={createState.isLoading || updateState.isLoading} type="button" onClick={() => void submit()}>
          Сохранить
        </Button>
        {selectedShift ? (
          <Button isLoading={deleteState.isLoading} type="button" variant="ghost" onClick={() => void remove()}>
            Удалить смену
          </Button>
        ) : null}
        <Button type="button" variant="secondary" onClick={onClose}>
          Отмена
        </Button>
        {message ? <span className={styles.formMessage}>{message}</span> : null}
      </div>
    </section>
  );
}

function ShiftQuickList({
  appointments,
  shifts,
  onCopyShift,
  onOpenShift,
}: {
  appointments: ScheduleAppointment[];
  shifts: AdminMasterShiftDto[];
  onCopyShift?: (shift: AdminMasterShiftDto, days: number) => void;
  onOpenShift?: (shift: AdminMasterShiftDto) => void;
}) {
  return (
    <section className={styles.editorSection}>
      <div className={styles.editorHeader}>
        <div>
          <h3>Смены</h3>
          <p>Кнопки действий для выбранной даты.</p>
        </div>
      </div>
      <div className={styles.shiftList}>
        {shifts.map((shift) => {
          const hasAppointments = appointments.some((appointment) => intervalsOverlap(shift.startsAt, shift.endsAt, appointment.startsAt, appointment.endsAt));
          return (
            <article className={styles.itemCard} key={shift.id}>
              <div className={styles.itemHeader}>
                <div>
                  <strong>{formatDateTime(shift.startsAt)}</strong>
                  <p>{shift.studio.name} · {formatTimeRange(shift.startsAt, shift.endsAt)}</p>
                </div>
                <AdminStatusBadge label={shift.isAvailable ? 'active' : 'inactive'} tone={shift.isAvailable ? 'success' : 'muted'} />
              </div>
              <div className={styles.itemActions}>
                {onOpenShift ? (
                  <Button size="sm" type="button" variant="secondary" onClick={() => onOpenShift(shift)}>
                    Редактировать
                  </Button>
                ) : null}
                {onCopyShift ? (
                  <>
                    <Button size="sm" type="button" variant="ghost" onClick={() => onCopyShift(shift, 1)}>
                      На завтра
                    </Button>
                    <Button size="sm" type="button" variant="ghost" onClick={() => onCopyShift(shift, 7)}>
                      На неделю
                    </Button>
                  </>
                ) : null}
              </div>
              {hasAppointments ? <p className={styles.helperText}>В смене есть записи, удаление будет заблокировано сервером.</p> : null}
            </article>
          );
        })}
        {!shifts.length ? <AdminEmptyState title="На выбранную дату нет смен" description="Добавьте смену кнопкой сверху или из строки мастера." /> : null}
      </div>
    </section>
  );
}

function WeeklyScheduleEditor({
  masterId,
  days,
  studios,
  warnings,
  collapseStudios = false,
  hideStudioChoice = false,
  isSubmitting,
  onSubmit,
}: {
  masterId: string;
  days: WeeklyScheduleDayDto[];
  studios: StudioDto[];
  warnings?: string[];
  collapseStudios?: boolean;
  hideStudioChoice?: boolean;
  isSubmitting?: boolean;
  onSubmit?: (days: WeeklyScheduleDayDto[]) => Promise<unknown>;
}) {
  const [values, setValues] = useState<WeeklyScheduleDayDto[]>(() => normalizeWeek(collapseStudios ? collapseWeeklyScheduleStudios(days) : days, studios[0]?.id ?? ''));
  const [message, setMessage] = useState('');
  const [updateWeeklySchedule, state] = useUpdateAdminWeeklyScheduleMutation();

  useEffect(() => {
    setValues(normalizeWeek(collapseStudios ? collapseWeeklyScheduleStudios(days) : days, studios[0]?.id ?? ''));
  }, [collapseStudios, days, studios]);

  const updateDay = (dayOfWeek: number, recipe: (current: WeeklyScheduleDayDto) => WeeklyScheduleDayDto) => {
    setValues((current) => current.map((item) => (item.dayOfWeek === dayOfWeek ? recipe(item) : item)));
  };

  const save = async () => {
    setMessage('');
    try {
      if (onSubmit) {
        await onSubmit(values);
        setMessage('Недельное расписание сохранено');
        return;
      }
      const response = await updateWeeklySchedule({ id: masterId, days: values }).unwrap();
      setValues(normalizeWeek(response.days, studios[0]?.id ?? ''));
      setMessage(response.warnings?.length ? response.warnings.join(' ') : 'Недельное расписание сохранено');
    } catch (error) {
      setMessage(getErrorText(error, 'Не удалось сохранить расписание'));
    }
  };

  return (
    <section className={styles.editorSection}>
      <div className={styles.editorHeader}>
        <div>
          <h3>Недельный шаблон</h3>
          <p>Рабочие часы и перерывы мастера. Это отдельная настройка, не сетка записей.</p>
        </div>
        <div className={styles.editorActions}>
          <Button isLoading={isSubmitting ?? state.isLoading} size="sm" type="button" onClick={() => void save()}>
            Сохранить неделю
          </Button>
        </div>
      </div>

      <div className={styles.dayList}>
        {weekdayLabels.map((day) => {
          const currentDay = values.find((item) => item.dayOfWeek === day.dayOfWeek) ?? { dayOfWeek: day.dayOfWeek, intervals: [] };
          return (
            <article className={styles.dayCard} key={day.dayOfWeek}>
              <div className={styles.dayHeader}>
                <strong>{day.label}</strong>
                <div className={styles.inlineActions}>
                  <label className={styles.checkboxRow}>
                    <input
                      checked={currentDay.intervals.length > 0}
                      type="checkbox"
                      onChange={(event) =>
                        updateDay(day.dayOfWeek, (item) => ({
                          ...item,
                          intervals: event.target.checked ? (item.intervals.length ? item.intervals : [createInterval(studios[0]?.id ?? '')]) : [],
                        }))
                      }
                    />
                    <span>Рабочий день</span>
                  </label>
                  <Button
                    disabled={!currentDay.intervals.length}
                    size="sm"
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      updateDay(day.dayOfWeek, (item) => ({
                        ...item,
                        intervals: [...item.intervals, createInterval(studios[0]?.id ?? '', item.intervals.length)],
                      }))
                    }
                  >
                    Добавить интервал
                  </Button>
                </div>
              </div>

              {currentDay.intervals.length ? (
                currentDay.intervals.map((interval, index) => (
                  <article className={styles.intervalCard} key={`${day.dayOfWeek}-${index}`}>
                    <div className={styles.intervalHeader}>
                      <span className={styles.intervalDay}>Интервал {index + 1}</span>
                      <Button
                        size="sm"
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          updateDay(day.dayOfWeek, (item) => ({
                            ...item,
                            intervals: item.intervals.filter((_, intervalIndex) => intervalIndex !== index),
                          }))
                        }
                      >
                        Удалить
                      </Button>
                    </div>
                    <div className={styles.intervalGrid}>
                      {!hideStudioChoice ? (
                        <label>
                          <span>Студия</span>
                          <select
                            value={interval.studioId}
                            onChange={(event) =>
                              updateDay(day.dayOfWeek, (item) => ({
                                ...item,
                                intervals: item.intervals.map((entry, entryIndex) => (entryIndex === index ? { ...entry, studioId: event.target.value } : entry)),
                              }))
                            }
                          >
                            {studios.map((studio) => (
                              <option key={studio.id} value={studio.id}>
                                {studio.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}
                      <label>
                        <span>Перерыв</span>
                        <div className={styles.intervalGrid}>
                          <input
                            type="time"
                            value={interval.breakStartTime ?? ''}
                            onChange={(event) =>
                              updateDay(day.dayOfWeek, (item) => ({
                                ...item,
                                intervals: item.intervals.map((entry, entryIndex) =>
                                  entryIndex === index ? { ...entry, breakStartTime: event.target.value || undefined } : entry,
                                ),
                              }))
                            }
                          />
                          <input
                            type="time"
                            value={interval.breakEndTime ?? ''}
                            onChange={(event) =>
                              updateDay(day.dayOfWeek, (item) => ({
                                ...item,
                                intervals: item.intervals.map((entry, entryIndex) =>
                                  entryIndex === index ? { ...entry, breakEndTime: event.target.value || undefined } : entry,
                                ),
                              }))
                            }
                          />
                        </div>
                      </label>
                    </div>
                    <div className={styles.intervalGrid}>
                      <label>
                        <span>Начало</span>
                        <input
                          type="time"
                          value={interval.startTime}
                          onChange={(event) =>
                            updateDay(day.dayOfWeek, (item) => ({
                              ...item,
                              intervals: item.intervals.map((entry, entryIndex) => (entryIndex === index ? { ...entry, startTime: event.target.value } : entry)),
                            }))
                          }
                        />
                      </label>
                      <label>
                        <span>Окончание</span>
                        <input
                          type="time"
                          value={interval.endTime}
                          onChange={(event) =>
                            updateDay(day.dayOfWeek, (item) => ({
                              ...item,
                              intervals: item.intervals.map((entry, entryIndex) => (entryIndex === index ? { ...entry, endTime: event.target.value } : entry)),
                            }))
                          }
                        />
                      </label>
                    </div>
                  </article>
                ))
              ) : (
                <p className={styles.helperText}>Выходной день.</p>
              )}
            </article>
          );
        })}
      </div>
      {warnings?.length ? <p className={styles.helperText}>{warnings.join(' ')}</p> : null}
      {message ? <p className={styles.formMessage}>{message}</p> : null}
    </section>
  );
}

function DateAvailabilityEditor({
  masterId,
  items,
  selectedDate,
  studios,
}: {
  masterId: string;
  items: AdminDateAvailabilityDto[];
  selectedDate: string;
  studios: StudioDto[];
}) {
  const [draft, setDraft] = useState<UpsertAdminDateAvailabilityPayload>({
    date: selectedDate,
    status: 'custom',
    studioId: studios[0]?.id,
    startTime: defaultShiftStart,
    endTime: '18:00',
    reason: '',
  });
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');
  const [createAvailability, createState] = useCreateAdminDateAvailabilityMutation();
  const [updateAvailability, updateState] = useUpdateAdminDateAvailabilityMutation();
  const [deleteAvailability, deleteState] = useDeleteAdminDateAvailabilityMutation();

  useEffect(() => {
    setDraft((current) => ({ ...current, date: selectedDate }));
  }, [selectedDate]);

  const submit = async () => {
    setMessage('');
    try {
      if (editingId) {
        await updateAvailability({ id: masterId, availabilityId: editingId, body: draft }).unwrap();
        setMessage('Исключение обновлено');
      } else {
        await createAvailability({ id: masterId, body: draft }).unwrap();
        setMessage('Исключение добавлено');
      }
      setEditingId('');
    } catch (error) {
      setMessage(getErrorText(error, 'Не удалось сохранить исключение'));
    }
  };

  return (
    <section className={styles.editorSection}>
      <div className={styles.editorHeader}>
        <div>
          <h3>Исключения по датам</h3>
          <p>Отпуск, больничный и особые часы не смешиваются с сеткой записей.</p>
        </div>
      </div>
      <div className={styles.dateFormGrid}>
        <label>
          <span>Дата</span>
          <input type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} />
        </label>
        <label>
          <span>Статус</span>
          <select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as UpsertAdminDateAvailabilityPayload['status'] }))}>
            <option value="available">Доступен</option>
            <option value="unavailable">Недоступен</option>
            <option value="custom">Особые часы</option>
            <option value="vacation">Отпуск</option>
            <option value="sick">Больничный</option>
            <option value="other">Другое</option>
          </select>
        </label>
        <label>
          <span>Студия</span>
          <select value={draft.studioId ?? ''} onChange={(event) => setDraft((current) => ({ ...current, studioId: event.target.value || undefined }))}>
            <option value="">Без студии</option>
            {studios.map((studio) => (
              <option key={studio.id} value={studio.id}>
                {studio.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>С</span>
          <input type="time" value={draft.startTime ?? ''} onChange={(event) => setDraft((current) => ({ ...current, startTime: event.target.value || undefined }))} />
        </label>
        <label>
          <span>По</span>
          <input type="time" value={draft.endTime ?? ''} onChange={(event) => setDraft((current) => ({ ...current, endTime: event.target.value || undefined }))} />
        </label>
        <label className={styles.fullRow}>
          <span>Причина</span>
          <textarea value={draft.reason ?? ''} onChange={(event) => setDraft((current) => ({ ...current, reason: event.target.value }))} />
        </label>
      </div>
      <div className={styles.formActions}>
        <Button isLoading={createState.isLoading || updateState.isLoading} size="sm" type="button" onClick={() => void submit()}>
          {editingId ? 'Сохранить исключение' : 'Добавить исключение'}
        </Button>
        {editingId ? (
          <Button
            size="sm"
            type="button"
            variant="secondary"
            onClick={() => {
              setEditingId('');
              setDraft({ date: selectedDate, endTime: '18:00', reason: '', startTime: defaultShiftStart, status: 'custom', studioId: studios[0]?.id });
            }}
          >
            Отмена
          </Button>
        ) : null}
      </div>
      <div className={styles.availabilityList}>
        {items.map((item) => (
          <article className={styles.itemCard} key={item.id}>
            <div className={styles.itemHeader}>
              <div>
                <strong>{formatDate(item.date)}</strong>
                <p>{item.status}</p>
              </div>
              <div className={styles.itemActions}>
                <Button
                  size="sm"
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditingId(item.id);
                    setDraft({
                      date: item.date.slice(0, 10),
                      endTime: item.endTime ?? undefined,
                      reason: item.reason ?? '',
                      startTime: item.startTime ?? undefined,
                      status: item.status,
                      studioId: item.studio?.id,
                    });
                  }}
                >
                  Редактировать
                </Button>
                <Button size="sm" type="button" variant="ghost" isLoading={deleteState.isLoading} onClick={() => void deleteAvailability({ id: masterId, availabilityId: item.id }).unwrap()}>
                  Удалить
                </Button>
              </div>
            </div>
            <div className={styles.itemGrid}>
              <div>
                <span className={styles.itemCaption}>Студия</span>
                <strong>{item.studio?.name ?? '—'}</strong>
              </div>
              <div>
                <span className={styles.itemCaption}>Время</span>
                <strong>{item.startTime && item.endTime ? `${item.startTime} — ${item.endTime}` : 'Весь день'}</strong>
              </div>
            </div>
            {item.reason ? <p>{item.reason}</p> : null}
          </article>
        ))}
        {!items.length ? <AdminEmptyState title="Пока нет исключений" description="Добавьте отпуск, больничный или особые часы на конкретные даты." /> : null}
      </div>
      {message ? <p className={styles.formMessage}>{message}</p> : null}
    </section>
  );
}

function buildAppointmentValues(
  appointment: ScheduleAppointment | undefined,
  draft: Partial<AppointmentFormValues> | undefined,
  services: ServiceDto[],
  masters: MasterDto[],
  studios: StudioDto[],
  defaultAppointmentDuration: number,
): AppointmentFormValues {
  const service = services.find((item) => item.id === draft?.serviceId) ?? appointment?.service ?? services[0];
  const startsAt = draft?.startsAt || toDateTimeInput(appointment?.startsAt) || toDateTimeInput(new Date().toISOString());
  return {
    clientId: draft?.clientId ?? appointment?.user?.id ?? '',
    serviceId: draft?.serviceId ?? appointment?.service.id ?? service?.id ?? '',
    masterId: draft?.masterId ?? appointment?.master.id ?? masters[0]?.id ?? '',
    studioId: draft?.studioId ?? appointment?.studio.id ?? studios[0]?.id ?? '',
    startsAt,
    durationMinutes: draft?.durationMinutes ?? (appointment ? String(diffMinutes(appointment.startsAt, appointment.endsAt)) : String(service?.durationMinutes ?? defaultAppointmentDuration)),
    status: draft?.status ?? ((appointment?.status as AdminAppointmentStatus | undefined) || 'SCHEDULED'),
    priceRub: draft?.priceRub ?? String(appointment?.priceRub ?? service?.priceRub ?? 0),
    note: draft?.note ?? appointment?.note ?? '',
  };
}

function buildShiftValues(
  fallbackStudioId: string,
  fallbackMasterId: string,
  draft?: Partial<ShiftFormValues>,
  shift?: AdminMasterShiftDto,
): ShiftFormValues {
  return {
    endsAt: draft?.endsAt || toDateTimeInput(shift?.endsAt) || dateTimeInputFromParts(toDateInput(new Date()), timeToMinutes(defaultShiftEnd)),
    isAvailable: draft?.isAvailable ?? shift?.isAvailable ?? true,
    masterId: draft?.masterId || shift?.master.id || fallbackMasterId,
    startsAt: draft?.startsAt || toDateTimeInput(shift?.startsAt) || dateTimeInputFromParts(toDateInput(new Date()), timeToMinutes(defaultShiftStart)),
    studioId: draft?.studioId || shift?.studio.id || fallbackStudioId,
  };
}

function normalizeWeek(days: WeeklyScheduleDayDto[], fallbackStudioId: string) {
  return weekdayLabels.map((day) => {
    const source = days.find((item) => item.dayOfWeek === day.dayOfWeek);
    return {
      dayOfWeek: day.dayOfWeek,
      intervals: source?.intervals?.length ? source.intervals : [],
      isWorking: source?.isWorking ?? Boolean(source?.intervals?.length),
    };
  }).map((day) => ({
    ...day,
    intervals: day.intervals.map((interval, index) => ({
      ...interval,
      intervalIndex: interval.intervalIndex ?? index,
      studioId: interval.studioId || fallbackStudioId,
    })),
  }));
}

function collapseWeeklyScheduleStudios(days: WeeklyScheduleDayDto[]): WeeklyScheduleDayDto[] {
  return days.map((day) => {
    const seen = new Set<string>();
    const intervals = day.intervals.filter((interval) => {
      const key = [interval.startTime, interval.endTime, interval.breakStartTime ?? '', interval.breakEndTime ?? ''].join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return { ...day, intervals };
  });
}

function getScheduleStudioIds(master: MasterDto, fallbackStudios: StudioDto[]) {
  const visibleStudioIds = new Set(fallbackStudios.map((studio) => studio.id).filter(Boolean));
  const assignedIds = masterStudios(master).map((studio) => studio.id).filter(Boolean);
  const scopedAssignedIds = assignedIds.filter((studioId) => !visibleStudioIds.size || visibleStudioIds.has(studioId));

  if (scopedAssignedIds.length) return scopedAssignedIds;
  return fallbackStudios.map((studio) => studio.id).filter(Boolean);
}

function expandWeeklyScheduleForStudios(days: WeeklyScheduleDayDto[], studioIds: string[]) {
  if (!studioIds.length) {
    return days;
  }

  const targetStudioIds = studioIds;
  return days.map((day) => ({
    ...day,
    intervals: day.intervals.flatMap((interval, intervalIndex) =>
      targetStudioIds.map((studioId, studioIndex) => ({
        ...interval,
        intervalIndex: intervalIndex * targetStudioIds.length + studioIndex,
        studioId: studioId || interval.studioId,
      })),
    ),
  }));
}

function createInterval(studioId: string, intervalIndex = 0) {
  return {
    endTime: '18:00',
    intervalIndex,
    startTime: defaultShiftStart,
    studioId,
  };
}

function resolveTimelineBounds(shifts: AdminMasterShiftDto[], appointments: ScheduleAppointment[]) {
  const allDates = [
    ...shifts.flatMap((shift) => [new Date(shift.startsAt), new Date(shift.endsAt)]),
    ...appointments.flatMap((appointment) => [new Date(appointment.startsAt), new Date(appointment.endsAt)]),
  ];

  if (!allDates.length) {
    return { startMinute: 9 * 60, endMinute: 21 * 60 };
  }

  const min = Math.min(...allDates.map(minutesOfDay));
  const max = Math.max(...allDates.map(minutesOfDay));
  return {
    startMinute: Math.max(0, Math.floor((min - 30) / 60) * 60),
    endMinute: Math.min(24 * 60, Math.ceil((max + 30) / 60) * 60),
  };
}

function blockStyle(startsAt: string, endsAt: string, startMinute: number, totalMinutes: number) {
  const start = minutesOfDay(new Date(startsAt));
  const end = minutesOfDay(new Date(endsAt));
  const left = ((start - startMinute) / totalMinutes) * 100;
  const width = ((end - start) / totalMinutes) * 100;
  return {
    left: `${Math.max(0, left)}%`,
    width: `${Math.max(2, Math.min(width, 100 - left))}%`,
  };
}

function buildSlots(startMinute: number, endMinute: number, step: number) {
  const slots: number[] = [];
  for (let minute = startMinute; minute < endMinute; minute += step) {
    slots.push(minute);
  }
  return slots;
}

function formatMinute(minute: number) {
  return `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
}

function timeToMinutes(value: string) {
  const [hours = '0', minutes = '0'] = value.split(':');
  return Number(hours) * 60 + Number(minutes);
}

function minutesOfDay(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function formatTimeRange(startsAt: string, endsAt: string) {
  return `${formatTime(startsAt)} — ${formatTime(endsAt)}`;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function diffMinutes(startsAt: string, endsAt: string) {
  return Math.max(5, Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60_000));
}

function dateTimeInputFromParts(date: string, minute: number) {
  return `${date}T${formatMinute(Math.min(23 * 60 + 55, Math.max(0, minute)))}`;
}

function sameDate(value: string, date: string) {
  return toDateInput(new Date(value)) === date;
}

function intervalsOverlap(leftStart: string, leftEnd: string, rightStart: string, rightEnd: string) {
  return new Date(leftStart) < new Date(rightEnd) && new Date(leftEnd) > new Date(rightStart);
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const day = date.getDay() || 7;
  return startOfLocalDay(addDays(date, 1 - day));
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function formatRange(from: Date, to: Date) {
  return `${formatDate(toDateInput(from))} — ${formatDate(toDateInput(to))}`;
}

function weekdayShort(date: Date) {
  return new Intl.DateTimeFormat('ru-RU', { weekday: 'short' }).format(date);
}

function masterStudios(master: MasterDto) {
  return master.studios?.length ? master.studios : master.studio ? [master.studio] : [];
}

function buildMasterDetailsPath(mode: ScheduleMode, id: string) {
  return mode === 'super-admin' ? `/super-admin/masters/${id}` : appRoutes.adminMasterDetails(id);
}

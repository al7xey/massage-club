import { useEffect, useRef, useState, type DragEvent, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { MasterDto } from '@/entities/master';
import type { ServiceDto } from '@/entities/service';
import type { StudioDto } from '@/entities/studio';
import {
  type AdminDashboardDto,
  type AdminUserDto,
  type UpsertMasterPayload,
  type UpsertServicePayload,
  type UpsertStudioPayload,
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
  useUpdateAdminMasterPhotoMutation,
  useUpdateAdminStudioMutation,
  useUpdateSuperAdminServiceMutation,
  useUpdateSuperAdminServicePhotoMutation,
  useUploadAdminImageMutation,
} from '@/features/admin';
import { useAuth } from '@/features/auth';
import { resolveMediaUrl } from '@/shared/lib/media';
import { appRoutes } from '@/shared/routes';
import { Button } from '@/shared/ui';
import styles from './AdminCrmPages.module.css';

export function AdminDashboardPage() {
  const dashboard = useGetAdminDashboardQuery();

  return (
    <CrmPage title="Панель администратора" description="Короткий рабочий обзор без лишних таблиц." isLoading={dashboard.isLoading} error={dashboard.error}>
      <DashboardCards dashboard={dashboard.data} />
    </CrmPage>
  );
}

export function SuperAdminDashboardPage() {
  const dashboard = useGetAdminDashboardQuery();
  const users = useGetSuperAdminUsersQuery();
  const services = useGetSuperAdminServicesQuery();

  return (
    <CrmPage title="Супер-админ" description="Мастера, услуги, студии и пользователи в одном простом интерфейсе." isLoading={dashboard.isLoading || users.isLoading || services.isLoading} error={dashboard.error ?? users.error ?? services.error}>
      <DashboardCards dashboard={dashboard.data} usersCount={users.data?.length ?? 0} servicesCount={services.data?.length ?? 0} />
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
  const navigate = useNavigate();
  const master = useGetAdminMasterQuery(id, { skip: !id });
  const studios = useGetAdminStudiosQuery();
  const services = useGetAdminServicesQuery();
  const [updateMaster, updateState] = useUpdateAdminMasterMutation();
  const [updatePhoto] = useUpdateAdminMasterPhotoMutation();
  const [deleteMaster, deleteState] = useDeleteAdminMasterMutation();

  const removeMaster = async () => {
    if (!id || !window.confirm('Удалить мастера? Он исчезнет из админки и публичного сайта.')) return;
    await deleteMaster(id).unwrap();
    navigate('/admin/masters', { replace: true });
  };

  return (
    <CrmPage title={master.data ? fullName(master.data) : 'Мастер'} description="Редактирование основной карточки мастера." isLoading={master.isLoading || studios.isLoading || services.isLoading} error={master.error ?? studios.error ?? services.error}>
      {master.data ? (
        <section className={styles.panel}>
          <MasterForm
            master={master.data}
            services={services.data ?? []}
            studios={studios.data ?? []}
            isSubmitting={updateState.isLoading}
            submitLabel="Сохранить мастера"
            onSubmit={(body) => updateMaster({ id, body }).unwrap()}
            onPhotoUploaded={(photoUrl) => updatePhoto({ id, photoUrl }).unwrap()}
          />
          <div className={styles.dangerZone}>
            <Button variant="danger" isLoading={deleteState.isLoading} onClick={() => void removeMaster()}>
              Удалить мастера
            </Button>
          </div>
        </section>
      ) : (
        <EmptyState title="Мастер не найден" />
      )}
    </CrmPage>
  );
}

export function AdminStudiosPage() {
  const studios = useGetAdminStudiosQuery();
  const [createStudio, createState] = useCreateAdminStudioMutation();

  return (
    <CrmPage title="Студии" description="Основная информация филиалов и фото для публичного сайта." isLoading={studios.isLoading} error={studios.error}>
      <section className={styles.panel}>
        <PanelHeader title="Новая студия" />
        <StudioForm
          submitLabel="Добавить студию"
          isSubmitting={createState.isLoading}
          onSubmit={(body) => createStudio(requiredStudioPayload(body)).unwrap()}
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
    <CrmPage title="Услуги" description="Цена вводится один раз. Скидочные цены считаются автоматически." isLoading={services.isLoading} error={services.error}>
      <section className={styles.panel}>
        <PanelHeader title="Новая услуга" />
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
  const navigate = useNavigate();
  const service = useGetSuperAdminServiceQuery(id, { skip: !id });
  const [updateService, updateState] = useUpdateSuperAdminServiceMutation();
  const [updatePhoto] = useUpdateSuperAdminServicePhotoMutation();
  const [deleteService, deleteState] = useDeleteSuperAdminServiceMutation();

  const removeService = async () => {
    if (!service.data || !window.confirm('Удалить услугу? Она будет скрыта с сайта.')) return;
    await deleteService(service.data.id).unwrap();
    navigate('/super-admin/services', { replace: true });
  };
  const serviceItem = service.data;

  return (
    <CrmPage title={serviceItem?.title ?? 'Услуга'} description="Простая карточка услуги без ручного ввода скидочных цен." isLoading={service.isLoading} error={service.error}>
      {serviceItem ? (
        <section className={styles.panel}>
          <ServiceForm
            service={serviceItem}
            isSubmitting={updateState.isLoading}
            submitLabel="Сохранить услугу"
            onSubmit={(body) => updateService({ id: serviceItem.id, body }).unwrap()}
            onPhotoUploaded={(imageUrl) => updatePhoto({ id: serviceItem.id, imageUrl }).unwrap()}
          />
          <div className={styles.dangerZone}>
            <Button variant="danger" isLoading={deleteState.isLoading} onClick={() => void removeService()}>
              Удалить услугу
            </Button>
          </div>
        </section>
      ) : (
        <EmptyState title="Услуга не найдена" />
      )}
    </CrmPage>
  );
}

export function SuperAdminUsersPage() {
  const [filters, setFilters] = useState({ search: '', status: '' });
  const users = useGetSuperAdminUsersQuery(cleanFilters(filters));

  return (
    <CrmPage title="Пользователи" description="Поиск, блокировка и удаление аккаунтов." isLoading={users.isLoading} error={users.error}>
      <section className={styles.panel}>
        <div className={styles.filters}>
          <label>
            Поиск
            <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Имя, email или телефон" />
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
      <UserCards users={users.data ?? []} />
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
    <CrmPage title="Мастера" description="Карточки мастеров, фото, студии и услуги." isLoading={masters.isLoading || studios.isLoading || services.isLoading} error={masters.error ?? studios.error ?? services.error}>
      <section className={styles.panel}>
        <PanelHeader title="Новый мастер" />
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
            Поиск
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

function DashboardCards({ dashboard, servicesCount, usersCount }: { dashboard?: AdminDashboardDto; servicesCount?: number; usersCount?: number }) {
  const cards = [
    ['Мастера', dashboard?.masters ?? 0],
    ['Студии', dashboard?.activeStudios ?? 0],
    ['Записи сегодня', dashboard?.todayAppointments ?? 0],
    ...(servicesCount !== undefined ? [['Услуги', servicesCount]] : []),
    ...(usersCount !== undefined ? [['Пользователи', usersCount]] : []),
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
  const [deleteMaster, deleteState] = useDeleteAdminMasterMutation();
  const detailsPath = mode === 'super-admin' ? `/super-admin/masters/${master.id}` : appRoutes.adminMasterDetails(master.id);
  const photoUrl = resolveMediaUrl(master.photoUrl ?? master.photoUrls?.[0]);

  const remove = async () => {
    if (!window.confirm(`Удалить мастера ${fullName(master)}?`)) return;
    await deleteMaster(master.id).unwrap();
  };

  return (
    <article className={styles.card}>
      <div className={styles.media}>{photoUrl ? <img src={photoUrl} alt="" /> : <span>{initials(fullName(master))}</span>}</div>
      <div className={styles.cardBody}>
        <div className={styles.cardTitleRow}>
          <h3>{fullName(master)}</h3>
          <span className={master.isActive ? styles.statusActive : styles.statusMuted}>{master.isActive ? 'Активен' : 'Скрыт'}</span>
        </div>
        <p>{master.specialization || 'Специализация не указана'}</p>
        <dl className={styles.metaList}>
          <div>
            <dt>Опыт</dt>
            <dd>{master.experienceYears ?? 0} лет</dd>
          </div>
          <div>
            <dt>Студии</dt>
            <dd>{masterStudios(master).map((studio) => studio.name).join(', ') || 'Не назначены'}</dd>
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
          <Button size="sm" variant="danger" isLoading={deleteState.isLoading} onClick={() => void remove()}>
            Удалить
          </Button>
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
        photoUrl: values.photoUrl,
        photoUrls: values.photoUrl ? [values.photoUrl] : [],
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
      <ImageUploader
        label="Фото мастера"
        value={values.photoUrl}
        onChange={(photoUrl) => setValues((current) => ({ ...current, photoUrl }))}
        onUploaded={onPhotoUploaded}
      />
      <fieldset className={styles.checkGroup}>
        <legend>Студии</legend>
        {studios.map((studio) => (
          <label key={studio.id}>
            <input type="checkbox" checked={values.studioIds.includes(studio.id)} onChange={() => setValues((current) => ({ ...current, studioIds: toggleId(current.studioIds, studio.id) }))} />
            {studio.name}
          </label>
        ))}
      </fieldset>
      <fieldset className={styles.checkGroup}>
        <legend>Услуги</legend>
        {services.map((service) => (
          <label key={service.id}>
            <input type="checkbox" checked={values.serviceIds.includes(service.id)} onChange={() => setValues((current) => ({ ...current, serviceIds: toggleId(current.serviceIds, service.id) }))} />
            {service.title}
          </label>
        ))}
      </fieldset>
      <div className={styles.formActions}>
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
        {message ? <span>{message}</span> : null}
      </div>
    </form>
  );
}

function ServiceCardEditable({ service }: { service: ServiceDto }) {
  const [deleteService, deleteState] = useDeleteSuperAdminServiceMutation();
  const imageUrl = resolveMediaUrl(service.imageUrl ?? service.galleryUrls?.[0]);

  const remove = async () => {
    if (!window.confirm(`Удалить услугу "${service.title}"?`)) return;
    await deleteService(service.id).unwrap();
  };

  return (
    <article className={styles.card}>
      <div className={styles.media}>{imageUrl ? <img src={imageUrl} alt="" /> : <span>{service.title.slice(0, 2)}</span>}</div>
      <div className={styles.cardBody}>
        <div className={styles.cardTitleRow}>
          <h3>{service.title}</h3>
          <span className={service.isActive !== false ? styles.statusActive : styles.statusMuted}>{service.isActive !== false ? 'На сайте' : 'Скрыта'}</span>
        </div>
        <p>{service.shortDescription || service.description}</p>
        <dl className={styles.metaList}>
          <div>
            <dt>Цена</dt>
            <dd>{formatMoney(service.priceRub)}</dd>
          </div>
          <div>
            <dt>Абонемент</dt>
            <dd>{formatMoney(calculateDiscountedPrice(service.priceRub, 20))}</dd>
          </div>
          <div>
            <dt>Длительность</dt>
            <dd>{service.durationMinutes} мин</dd>
          </div>
        </dl>
        <div className={styles.cardActions}>
          <Link className={styles.linkButton} to={`/super-admin/services/${service.id}`}>
            Редактировать
          </Link>
          <Button size="sm" variant="danger" isLoading={deleteState.isLoading} onClick={() => void remove()}>
            Удалить
          </Button>
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

  const price = Number(values.priceRub) || 0;

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
        priceRub: price,
        imageUrl: values.imageUrl,
        galleryUrls: values.imageUrl ? [values.imageUrl] : [],
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
        <input value={values.slug} onChange={(event) => setValues((current) => ({ ...current, slug: event.target.value }))} placeholder="Заполнится автоматически" />
      </label>
      <label>
        Длительность, мин
        <input min="15" step="15" type="number" value={values.durationMinutes} onChange={(event) => setValues((current) => ({ ...current, durationMinutes: event.target.value }))} />
      </label>
      <label>
        Базовая цена
        <input min="0" type="number" value={values.priceRub} onChange={(event) => setValues((current) => ({ ...current, priceRub: event.target.value }))} />
      </label>
      <div className={styles.pricePreview}>
        <span>Цена по абонементу: {formatMoney(calculateDiscountedPrice(price, 20))}</span>
        <span>Super: {formatMoney(calculateDiscountedPrice(price, 30))}</span>
      </div>
      <label className={styles.fullRow}>
        Короткое описание
        <textarea rows={2} value={values.shortDescription} onChange={(event) => setValues((current) => ({ ...current, shortDescription: event.target.value }))} />
      </label>
      <label className={styles.fullRow}>
        Описание
        <textarea required rows={4} value={values.description} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))} />
      </label>
      <ImageUploader
        label="Фото услуги"
        value={values.imageUrl}
        onChange={(imageUrl) => setValues((current) => ({ ...current, imageUrl }))}
        onUploaded={onPhotoUploaded}
      />
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
    <article className={styles.card}>
      <StudioForm studio={studio} submitLabel="Сохранить" isSubmitting={updateState.isLoading} onSubmit={(body) => updateStudio({ id: studio.id, body }).unwrap()} />
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
  const [values, setValues] = useState(() => studioValues(studio));
  const [message, setMessage] = useState('');

  useEffect(() => {
    setValues(studioValues(studio));
  }, [studio]);

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
    <form className={styles.formGrid} onSubmit={submit}>
      <label>
        Название
        <input required value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} />
      </label>
      <label>
        Город
        <input required value={values.city} onChange={(event) => setValues((current) => ({ ...current, city: event.target.value }))} />
      </label>
      <label>
        Адрес
        <input required value={values.address} onChange={(event) => setValues((current) => ({ ...current, address: event.target.value }))} />
      </label>
      <label>
        Телефон
        <input value={values.phone} onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))} />
      </label>
      <ImageUploader label="Фото студии" value={values.photoUrl} onChange={(photoUrl) => setValues((current) => ({ ...current, photoUrl, photoUrls: photoUrl ? [photoUrl] : [] }))} />
      <div className={styles.formActions}>
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
        {message ? <span>{message}</span> : null}
      </div>
    </form>
  );
}

function UserCards({ users }: { users: AdminUserDto[] }) {
  const { user: currentUser } = useAuth();
  const [blockUser] = useBlockSuperAdminUserMutation();
  const [unblockUser] = useUnblockSuperAdminUserMutation();
  const [deleteUser, deleteState] = useDeleteSuperAdminUserMutation();

  if (!users.length) {
    return <EmptyState title="Пользователи не найдены" />;
  }

  const remove = async (user: AdminUserDto) => {
    if (!window.confirm(`Удалить пользователя ${user.fullName}?`)) return;
    await deleteUser(user.id).unwrap();
  };

  return (
    <section className={styles.grid}>
      {users.map((user) => {
        const isSelf = currentUser?.id === user.id;
        return (
          <article className={styles.userCard} key={user.id}>
            <div className={styles.userAvatar}>{initials(user.fullName || user.email || 'U')}</div>
            <div className={styles.userInfo}>
              <h3>{user.fullName || 'Без имени'}</h3>
              <p>{user.email ?? user.phone ?? 'Контакты не указаны'}</p>
              <span className={user.status === 'active' ? styles.statusActive : styles.statusMuted}>{user.status === 'active' ? 'Активен' : 'Заблокирован'}</span>
            </div>
            <div className={styles.cardActions}>
              {user.status === 'blocked' ? (
                <Button size="sm" disabled={isSelf} onClick={() => void unblockUser(user.id)}>
                  Разблокировать
                </Button>
              ) : (
                <Button size="sm" variant="secondary" disabled={isSelf} onClick={() => void blockUser(user.id)}>
                  Заблокировать
                </Button>
              )}
              <Button size="sm" variant="danger" disabled={isSelf} isLoading={deleteState.isLoading} onClick={() => void remove(user)}>
                Удалить
              </Button>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function ImageUploader({
  label,
  onChange,
  onUploaded,
  value,
}: {
  label: string;
  onChange: (url: string) => void;
  onUploaded?: (url: string) => Promise<unknown>;
  value?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadImage, state] = useUploadAdminImageMutation();
  const [message, setMessage] = useState('');
  const previewUrl = resolveMediaUrl(value);

  const upload = async (file?: File) => {
    if (!file) return;
    setMessage('');
    try {
      const result = await uploadImage(file).unwrap();
      onChange(result.url);
      await onUploaded?.(result.url);
      setMessage('Фото загружено');
    } catch (error) {
      setMessage(getErrorText(error));
    } finally {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    void upload(event.dataTransfer.files[0]);
  };

  return (
    <div className={styles.uploadBox} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
      <div className={styles.uploadPreview}>{previewUrl ? <img src={previewUrl} alt="" /> : <span>Фото</span>}</div>
      <div className={styles.uploadControls}>
        <strong>{label}</strong>
        <p>Перетащите изображение сюда или выберите файл.</p>
        <input ref={inputRef} accept="image/*" disabled={state.isLoading} type="file" onChange={(event) => void upload(event.target.files?.[0])} />
        <div className={styles.formActions}>
          <Button size="sm" variant="secondary" disabled={state.isLoading} onClick={() => inputRef.current?.click()}>
            {state.isLoading ? 'Загрузка...' : 'Выбрать фото'}
          </Button>
          {value ? (
            <Button size="sm" variant="ghost" onClick={() => onChange('')}>
              Убрать
            </Button>
          ) : null}
        </div>
        {message ? <span>{message}</span> : null}
      </div>
    </div>
  );
}

function PanelHeader({ title }: { title: string }) {
  return (
    <header className={styles.panelHeader}>
      <h3>{title}</h3>
    </header>
  );
}

function LoadingState() {
  return <div className={styles.state}>Загрузка...</div>;
}

function EmptyState({ title }: { title: string }) {
  return <div className={styles.state}>{title}</div>;
}

function ErrorState() {
  return <div className={styles.stateError}>Не удалось загрузить данные</div>;
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

function masterStudios(master: MasterDto) {
  return master.studios?.length ? master.studios : master.studio ? [master.studio] : [];
}

function masterValues(master: MasterDto | undefined, studios: StudioDto[]) {
  return {
    fullName: master ? fullName(master) : '',
    phone: master?.phone ?? '',
    specialization: master?.specialization ?? '',
    experienceYears: String(master?.experienceYears ?? 0),
    description: master?.bio ?? '',
    photoUrl: master?.photoUrl ?? master?.photoUrls?.[0] ?? '',
    studioIds: master ? masterStudios(master).map((studio) => studio.id) : studios[0]?.id ? [studios[0].id] : [],
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
    imageUrl: service?.imageUrl ?? service?.galleryUrls?.[0] ?? '',
  };
}

function studioValues(studio?: StudioDto) {
  return {
    name: studio?.name ?? '',
    city: studio?.city ?? '',
    address: studio?.address ?? '',
    phone: studio?.phone ?? '',
    photoUrl: studio?.photoUrl ?? studio?.photoUrls?.[0] ?? '',
    photoUrls: studio?.photoUrls ?? [],
  };
}

function requiredMasterPayload(body: UpsertMasterPayload) {
  return {
    ...body,
    fullName: body.fullName || 'Новый мастер',
    studioIds: body.studioIds?.length ? body.studioIds : [],
  };
}

function requiredStudioPayload(body: UpsertStudioPayload) {
  return {
    ...body,
    name: body.name || 'Новая студия',
    city: body.city || 'Москва',
    address: body.address || 'Адрес не указан',
  } as Required<Pick<UpsertStudioPayload, 'address' | 'city' | 'name'>> & UpsertStudioPayload;
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

function cleanFilters<T extends Record<string, string>>(filters: T) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value)) as Partial<T>;
}

function formatMoney(value: number) {
  return `${formatNumber(value)} ₽`;
}

function formatNumber(value: unknown) {
  return Number(value ?? 0).toLocaleString('ru-RU');
}

function calculateDiscountedPrice(priceRub: number, discountPercent: number) {
  return Math.round(Math.max(0, priceRub) * (1 - discountPercent / 100));
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

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import type { MasterDto } from '@/entities/master';
import type { ServiceDto } from '@/entities/service';
import type { StudioDto } from '@/entities/studio';
import type { UpsertMasterPayload, UpsertServicePayload, UpsertStudioPayload } from '@/features/admin';
import { useUploadAdminImageMutation } from '@/features/admin';
import { resolveMediaUrl } from '@/shared/lib/media';
import { Button } from '@/shared/ui';
import styles from './AdminCrmPages.module.css';
import { dedupeUrls, formatCurrency, getErrorText, slugify, toggleId } from './adminShared';

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const maxImageSizeBytes = 5 * 1024 * 1024;

export function MasterForm({
  master,
  studios,
  services,
  submitLabel,
  isSubmitting,
  onSubmit,
  secondaryAction,
}: {
  master?: MasterDto;
  studios: StudioDto[];
  services: ServiceDto[];
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (body: UpsertMasterPayload) => Promise<unknown>;
  secondaryAction?: ReactNode;
}) {
  const [values, setValues] = useState(() => masterFormValues(master, studios));
  const [message, setMessage] = useState('');
  void services;

  useEffect(() => {
    setValues(masterFormValues(master, studios));
  }, [master, studios]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    const photoUrl = values.photoUrl.trim();

    try {
      await onSubmit({
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        description: values.description.trim(),
        specialization: values.specialization.trim(),
        experienceYears: Number(values.experienceYears) || 0,
        photoUrl,
        photoUrls: photoUrl ? [photoUrl] : [],
        studioIds: values.studioIds,
        serviceIds: values.serviceIds,
      });
      setMessage('Сохранено');
    } catch (error) {
      setMessage(getErrorText(error));
    }
  };

  return (
    <form className={styles.formGrid} onSubmit={handleSubmit}>
      <label className={styles.formField}>
        <span>Имя</span>
        <input required value={values.fullName} onChange={(event) => setValues((current) => ({ ...current, fullName: event.target.value }))} />
      </label>
      <label className={styles.formField}>
        <span>Телефон</span>
        <input value={values.phone} onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))} />
      </label>
      <label className={styles.formField}>
        <span>Специализация</span>
        <input value={values.specialization} onChange={(event) => setValues((current) => ({ ...current, specialization: event.target.value }))} />
      </label>
      <label className={styles.formField}>
        <span>Опыт, лет</span>
        <input min="0" type="number" value={values.experienceYears} onChange={(event) => setValues((current) => ({ ...current, experienceYears: event.target.value }))} />
      </label>
      <label className={`${styles.formField} ${styles.formFieldFull}`}>
        <span>Описание</span>
        <textarea value={values.description} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))} />
      </label>

      <ImageUploadField
        label="Фото мастера"
        value={values.photoUrl}
        onChange={(photoUrl) => setValues((current) => ({ ...current, photoUrl }))}
      />

      <div className={`${styles.formSection} ${styles.formFieldFull}`}>
        <div className={styles.formSectionHeader}>
          <h4 className={styles.formSectionTitle}>Студии</h4>
          <span className={styles.fieldHint}>Выберите филиалы, где работает мастер</span>
        </div>
        <div className={styles.checkboxGrid}>
          {studios.map((studio) => (
            <label className={styles.checkboxCard} key={studio.id}>
              <input
                checked={values.studioIds.includes(studio.id)}
                type="checkbox"
                onChange={() => setValues((current) => ({ ...current, studioIds: toggleId(current.studioIds, studio.id) }))}
              />
              <span>{studio.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={`${styles.formSection} ${styles.formFieldFull}`}>
        <div className={styles.formSectionHeader}>
          <h4 className={styles.formSectionTitle}>Услуги</h4>
          <span className={styles.fieldHint}>По умолчанию мастер доступен для всех услуг. Отдельный список здесь не нужен.</span>
        </div>
      </div>

      <div className={styles.formActions}>
        <Button isLoading={isSubmitting} type="submit">
          {submitLabel}
        </Button>
        {secondaryAction}
        {message ? <span className={styles.formMessage}>{message}</span> : null}
      </div>
    </form>
  );
}

export function ServiceForm({
  service,
  submitLabel,
  isSubmitting,
  onSubmit,
  secondaryAction,
}: {
  service?: ServiceDto;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (body: UpsertServicePayload) => Promise<unknown>;
  secondaryAction?: ReactNode;
}) {
  const [values, setValues] = useState(() => serviceFormValues(service));
  const [message, setMessage] = useState('');

  useEffect(() => {
    setValues(serviceFormValues(service));
  }, [service]);

  const gallery = useMemo(() => dedupeUrls(values.galleryUrls), [values.galleryUrls]);
  const price = Number(values.priceRub) || 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

    try {
      await onSubmit({
        title: values.title.trim(),
        slug: values.slug.trim() || slugify(values.title),
        description: values.description.trim(),
        shortDescription: values.shortDescription.trim(),
        durationMinutes: Number(values.durationMinutes) || 60,
        priceRub: price,
        imageUrl: values.imageUrl || gallery[0] || undefined,
        galleryUrls: gallery,
      });
      setMessage('Сохранено');
    } catch (error) {
      setMessage(getErrorText(error));
    }
  };

  return (
    <form className={styles.formGrid} onSubmit={handleSubmit}>
      <label className={styles.formField}>
        <span>Название</span>
        <input required value={values.title} onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))} />
      </label>
      <label className={styles.formField}>
        <span>Slug</span>
        <input value={values.slug} onChange={(event) => setValues((current) => ({ ...current, slug: event.target.value }))} />
      </label>
      <label className={styles.formField}>
        <span>Длительность, мин</span>
        <input min="5" step="5" type="number" value={values.durationMinutes} onChange={(event) => setValues((current) => ({ ...current, durationMinutes: event.target.value }))} />
      </label>
      <label className={styles.formField}>
        <span>Базовая цена</span>
        <input min="0" type="number" value={values.priceRub} onChange={(event) => setValues((current) => ({ ...current, priceRub: event.target.value }))} />
      </label>
      <div className={`${styles.formSection} ${styles.formFieldFull}`}>
        <div className={styles.inlineActions}>
          <span className={styles.fieldHint}>Цена по подписке считается автоматически</span>
          <span className={styles.statusPill}>Super: {formatCurrency(Math.round(price * 0.7))}</span>
          <span className={styles.statusPill}>Club: {formatCurrency(Math.round(price * 0.8))}</span>
        </div>
      </div>
      <label className={`${styles.formField} ${styles.formFieldFull}`}>
        <span>Короткое описание</span>
        <textarea value={values.shortDescription} onChange={(event) => setValues((current) => ({ ...current, shortDescription: event.target.value }))} />
      </label>
      <label className={`${styles.formField} ${styles.formFieldFull}`}>
        <span>Описание</span>
        <textarea required value={values.description} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))} />
      </label>

      <GalleryUploadField
        label="Галерея услуги"
        primaryUrl={values.imageUrl}
        value={gallery}
        onChange={(galleryUrls, imageUrl) => setValues((current) => ({ ...current, galleryUrls, imageUrl }))}
      />

      <div className={styles.formActions}>
        <Button isLoading={isSubmitting} type="submit">
          {submitLabel}
        </Button>
        {secondaryAction}
        {message ? <span className={styles.formMessage}>{message}</span> : null}
      </div>
    </form>
  );
}

export function StudioForm({
  studio,
  submitLabel,
  isSubmitting,
  onSubmit,
}: {
  studio?: StudioDto;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (body: UpsertStudioPayload) => Promise<unknown>;
}) {
  const [values, setValues] = useState(() => studioFormValues(studio));
  const [message, setMessage] = useState('');

  useEffect(() => {
    setValues(studioFormValues(studio));
  }, [studio]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    const photoUrl = values.photoUrl.trim();

    try {
      await onSubmit({
        name: values.name.trim(),
        city: values.city.trim(),
        address: values.address.trim(),
        phone: values.phone.trim(),
        photoUrl,
        photoUrls: photoUrl ? [photoUrl] : [],
      });
      setMessage('Сохранено');
    } catch (error) {
      setMessage(getErrorText(error));
    }
  };

  return (
    <form className={styles.formGrid} onSubmit={handleSubmit}>
      <label className={styles.formField}>
        <span>Название</span>
        <input required value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} />
      </label>
      <label className={styles.formField}>
        <span>Город</span>
        <input required value={values.city} onChange={(event) => setValues((current) => ({ ...current, city: event.target.value }))} />
      </label>
      <label className={styles.formField}>
        <span>Адрес</span>
        <input required value={values.address} onChange={(event) => setValues((current) => ({ ...current, address: event.target.value }))} />
      </label>
      <label className={styles.formField}>
        <span>Телефон</span>
        <input value={values.phone} onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))} />
      </label>
      <ImageUploadField
        label="Фото студии"
        value={values.photoUrl}
        onChange={(photoUrl) => setValues((current) => ({ ...current, photoUrl }))}
      />
      <div className={styles.formActions}>
        <Button isLoading={isSubmitting} type="submit">
          {submitLabel}
        </Button>
        {message ? <span className={styles.formMessage}>{message}</span> : null}
      </div>
    </form>
  );
}

function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadImage, state] = useUploadAdminImageMutation();
  const [message, setMessage] = useState('');
  const previewUrl = resolveMediaUrl(value);

  const handleFiles = async (files?: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setMessage('');

    const validationError = validateImageFile(file);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      const result = await uploadImage(file).unwrap();
      onChange(result.url);
      setMessage('Фото загружено');
    } catch (error) {
      setMessage(getErrorText(error, 'Не удалось загрузить фото'));
    } finally {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className={styles.uploadBlock}>
      <span className={styles.uploadLabel}>{label}</span>
      <div className={styles.uploadCard}>
        <div className={styles.uploadPreview}>
          {previewUrl ? <img alt="" src={previewUrl} /> : <span>Фото</span>}
        </div>
        <div className={styles.uploadBody}>
          <p className={styles.uploadText}>Один файл за раз, с явным превью и заменой без дублей.</p>
          <input ref={inputRef} accept="image/*" className={styles.uploadInput} type="file" onChange={(event) => void handleFiles(event.target.files)} />
          <div className={styles.inlineActions}>
            <Button isLoading={state.isLoading} size="sm" type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
              {value ? 'Заменить фото' : 'Выбрать фото'}
            </Button>
            {value ? (
              <Button size="sm" type="button" variant="ghost" onClick={() => onChange('')}>
                Убрать
              </Button>
            ) : null}
          </div>
          {message ? <span className={styles.formMessage}>{message}</span> : null}
        </div>
      </div>
    </div>
  );
}

function GalleryUploadField({
  label,
  value,
  primaryUrl,
  onChange,
}: {
  label: string;
  value: string[];
  primaryUrl?: string;
  onChange: (gallery: string[], primaryUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadImage, state] = useUploadAdminImageMutation();
  const [message, setMessage] = useState('');

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }

    setMessage('');
    const uploaded: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const validationError = validateImageFile(file);
        if (validationError) {
          setMessage(validationError);
          return;
        }

        const result = await uploadImage(file).unwrap();
        uploaded.push(result.url);
      }

      const nextGallery = dedupeUrls([...value, ...uploaded]);
      onChange(nextGallery, primaryUrl && nextGallery.includes(primaryUrl) ? primaryUrl : nextGallery[0] ?? '');
      setMessage('Галерея обновлена');
    } catch (error) {
      setMessage(getErrorText(error, 'Не удалось загрузить изображения'));
    } finally {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const removeItem = (url: string) => {
    const nextGallery = value.filter((item) => item !== url);
    onChange(nextGallery, primaryUrl === url ? nextGallery[0] ?? '' : primaryUrl ?? nextGallery[0] ?? '');
  };

  const setPrimary = (url: string) => {
    onChange(value, url);
  };

  return (
    <div className={styles.galleryBlock}>
      <div className={styles.formSectionHeader}>
        <div>
          <h4 className={styles.formSectionTitle}>{label}</h4>
          <span className={styles.fieldHint}>Основное фото и дополнительные изображения</span>
        </div>
        <div className={styles.inlineActions}>
          <input ref={inputRef} accept="image/*" className={styles.uploadInput} multiple type="file" onChange={handleFiles} />
          <Button isLoading={state.isLoading} size="sm" type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
            Добавить фото
          </Button>
        </div>
      </div>

      {value.length ? (
        <div className={styles.galleryGrid}>
          {value.map((url, index) => (
            <article className={styles.galleryItem} key={url}>
              <div className={styles.galleryImageWrap}>
                <img alt="" src={resolveMediaUrl(url)} />
              </div>
              <div className={styles.galleryCaption}>
                <span>{primaryUrl === url ? <strong className={styles.galleryPrimary}>Основное</strong> : `Фото ${index + 1}`}</span>
              </div>
              <div className={styles.inlineActions}>
                {primaryUrl !== url ? (
                  <Button size="sm" type="button" variant="secondary" onClick={() => setPrimary(url)}>
                    Сделать основным
                  </Button>
                ) : null}
                <Button size="sm" type="button" variant="ghost" onClick={() => removeItem(url)}>
                  Удалить
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.uploadText}>Добавьте хотя бы одно изображение для карточки услуги.</p>
      )}

      {message ? <span className={styles.formMessage}>{message}</span> : null}
    </div>
  );
}

function validateImageFile(file: File) {
  if (!allowedImageTypes.has(file.type)) {
    return 'Поддерживаются только JPG, PNG, WebP или GIF';
  }

  if (file.size > maxImageSizeBytes) {
    return 'Файл должен быть меньше 5 МБ';
  }

  return '';
}

function masterFormValues(master: MasterDto | undefined, studios: StudioDto[]) {
  const fullName = master ? [master.firstName, master.lastName].filter(Boolean).join(' ').trim() : '';
  const studioIds = master?.studios?.length
    ? master.studios.map((studio) => studio.id)
    : master?.studio?.id
      ? [master.studio.id]
      : studios[0]?.id
        ? [studios[0].id]
        : [];

  return {
    fullName,
    phone: master?.phone ?? '',
    specialization: master?.specialization ?? '',
    experienceYears: String(master?.experienceYears ?? 0),
    description: master?.bio ?? '',
    photoUrl: master?.photoUrl ?? master?.photoUrls?.[0] ?? '',
    studioIds,
    serviceIds: master?.services?.map((service) => service.id) ?? [],
  };
}

function serviceFormValues(service?: ServiceDto) {
  const galleryUrls = dedupeUrls([service?.imageUrl ?? '', ...(service?.galleryUrls ?? [])]);

  return {
    title: service?.title ?? '',
    slug: service?.slug ?? '',
    shortDescription: service?.shortDescription ?? '',
    description: service?.description ?? '',
    durationMinutes: String(service?.durationMinutes ?? 60),
    priceRub: String(service?.priceRub ?? 0),
    imageUrl: service?.imageUrl ?? galleryUrls[0] ?? '',
    galleryUrls,
  };
}

function studioFormValues(studio?: StudioDto) {
  return {
    name: studio?.name ?? '',
    city: studio?.city ?? '',
    address: studio?.address ?? '',
    phone: studio?.phone ?? '',
    photoUrl: studio?.photoUrl ?? studio?.photoUrls?.[0] ?? '',
  };
}

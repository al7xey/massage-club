import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUploadAdminImageMutation } from '@/features/admin';
import { useAuth } from '@/features/auth';
import { getApiErrorMessage } from '@/shared/lib/api/getApiErrorMessage';
import { formatUserDisplayName } from '@/shared/lib/auth/formatUserDisplayName';
import { resolveMediaUrl } from '@/shared/lib/media';
import { appRoutes } from '@/shared/routes';
import { Button, LinkButton, TextField } from '@/shared/ui';
import { PageShell } from '@/shared/ui/page-shell/PageShell';
import styles from './AccountSettingsPage.module.css';

export function AccountSettingsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { logout, updateProfile, user } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadImage, uploadState] = useUploadAdminImageMutation();

  useEffect(() => {
    setFullName(user?.fullName ?? '');
    setEmail(user?.email ?? '');
    setPhone(user?.phone ?? '');
    setAvatarUrl(user?.avatarUrl ?? '');
  }, [user]);

  if (!user) {
    return null;
  }

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setMessage('Поддерживаются только JPG, PNG, WebP или GIF');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Файл должен быть меньше 5 МБ');
      return;
    }

    try {
      setMessage('Загружаем фото...');
      const result = await uploadImage(file).unwrap();
      setAvatarUrl(result.url);
      setMessage('Фото загружено');
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Не удалось загрузить фото'));
    } finally {
      event.target.value = '';
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fullName.trim()) {
      setMessage('Укажите имя и фамилию');
      return;
    }

    if (!email.trim() && !phone.trim()) {
      setMessage('Нужен хотя бы один контакт: email или телефон');
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile({
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        avatarUrl: avatarUrl || null,
      });
      setMessage('Профиль обновлён');
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Не удалось сохранить профиль'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(appRoutes.home());
  };

  return (
    <PageShell
      title="Настройки профиля"
      actions={<LinkButton to={appRoutes.account()} variant="secondary">Вернуться в профиль</LinkButton>}
    >
      <section className={styles.card}>
        <button className={styles.avatarButton} type="button" onClick={() => fileInputRef.current?.click()}>
          {avatarUrl ? <img src={resolveMediaUrl(avatarUrl)} alt={formatUserDisplayName(user)} /> : <span>{(user.fullName?.trim()?.[0] ?? 'Р').toUpperCase()}</span>}
        </button>
        <input ref={fileInputRef} className={styles.fileInput} type="file" accept="image/*" onChange={handleAvatarChange} />

        <form className={styles.form} onSubmit={handleSave}>
          <TextField label="Имя и фамилия" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          <TextField label="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <TextField label="Телефон" value={phone} onChange={(event) => setPhone(event.target.value)} />

          {message ? <p className={styles.message}>{message}</p> : null}

          <div className={styles.actions}>
            <Button isLoading={isSaving || uploadState.isLoading} loadingText="Сохраняем..." type="submit">
              Сохранить
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              Выйти
            </Button>
          </div>
        </form>
      </section>
    </PageShell>
  );
}

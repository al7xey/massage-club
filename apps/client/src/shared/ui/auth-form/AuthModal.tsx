import { PropsWithChildren, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { appRoutes } from '@/shared/routes';
import styles from './AuthForm.module.css';

interface AuthModalProps extends PropsWithChildren {
  description: string;
  mode: 'login' | 'register';
  title: string;
}

interface AuthModalLocationState {
  backgroundLocation?: unknown;
  from?: string;
}

export function AuthModal({ children, description, mode, title }: AuthModalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as AuthModalLocationState | null;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const closeModal = () => {
    if (state?.backgroundLocation) {
      navigate(-1);
      return;
    }

    navigate(state?.from ?? appRoutes.home(), { replace: true });
  };

  return (
    <div className={styles.modalRoot}>
      <button aria-label="Закрыть окно авторизации" className={styles.overlay} onClick={closeModal} type="button" />
      <div aria-modal="true" className={styles.modalCard} role="dialog">
        <div className={styles.modalHeader}>
          <div className={styles.modalBrand}>
            <span aria-hidden="true">♥</span>
            RelaxUp
          </div>
          <button aria-label="Закрыть" className={styles.closeButton} onClick={closeModal} type="button">
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalIntro}>
            <p className={styles.eyebrow}>{mode === 'login' ? 'Личный кабинет' : 'Новый аккаунт'}</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>

          <div className={styles.switchRow}>
            <Link
              className={mode === 'login' ? styles.switchActive : styles.switchLink}
              state={location.state}
              to={appRoutes.login()}
            >
              Вход
            </Link>
            <Link
              className={mode === 'register' ? styles.switchActive : styles.switchLink}
              state={location.state}
              to={appRoutes.register()}
            >
              Регистрация
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

import { PropsWithChildren, useEffect, useId, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import brandLogo from '@/shared/assets/brand-logo.jpg';
import { appRoutes } from '@/shared/routes';
import styles from './AuthForm.module.css';

interface AuthModalProps extends PropsWithChildren {
  description: string;
  mode: 'login' | 'register';
  title: string;
}

interface AuthModalLocationState {
  backgroundLocation?: Location;
  from?: string;
}

export function AuthModal({ children, description, mode, title }: AuthModalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as AuthModalLocationState | null;
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closeModal = () => {
    const backgroundLocation = state?.backgroundLocation;

    if (backgroundLocation) {
      navigate(
        {
          hash: backgroundLocation.hash,
          pathname: backgroundLocation.pathname,
          search: backgroundLocation.search,
        },
        { replace: true },
      );
      return;
    }

    navigate(state?.from ?? appRoutes.home(), { replace: true });
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

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

  return (
    <div className={styles.modalRoot}>
      <button aria-label="Закрыть окно авторизации" className={styles.overlay} onClick={closeModal} type="button" />
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className={styles.modalCard}
        role="dialog"
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalBrand}>
            <span className={styles.brandMark} aria-hidden="true">
              <img src={brandLogo} alt="" />
            </span>
            RelaxUp
          </div>
          <button ref={closeButtonRef} aria-label="Закрыть" className={styles.closeButton} onClick={closeModal} type="button">
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalIntro}>
            <p className={styles.eyebrow}>{mode === 'login' ? 'Личный кабинет' : 'Новый аккаунт'}</p>
            <h1 id={titleId}>{title}</h1>
            <p id={descriptionId}>{description}</p>
          </div>

          <div className={styles.switchRow}>
            <Link
              className={mode === 'login' ? styles.switchActive : styles.switchLink}
              replace
              state={location.state}
              to={appRoutes.login()}
            >
              Вход
            </Link>
            <Link
              className={mode === 'register' ? styles.switchActive : styles.switchLink}
              replace
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

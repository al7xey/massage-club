import { type MouseEvent, PropsWithChildren, useCallback, useEffect, useRef } from 'react';
import { type Location, useLocation, useNavigate } from 'react-router-dom';
import brandLogo from '@/shared/assets/brand-logo.jpg';
import { appRoutes } from '@/shared/routes';
import styles from './AuthForm.module.css';

interface AuthModalProps extends PropsWithChildren {
  title: string;
}

export function AuthModal({ title, children }: AuthModalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);

  const closeModal = useCallback(() => {
    const state = location.state as { backgroundLocation?: Location; from?: string } | null;

    if (state?.backgroundLocation) {
      navigate(
        {
          hash: state.backgroundLocation.hash,
          pathname: state.backgroundLocation.pathname,
          search: state.backgroundLocation.search,
        },
        { replace: true },
      );
      return;
    }

    navigate(state?.from ?? appRoutes.home(), { replace: true });
  }, [location.state, navigate]);

  const handleCloseClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      closeModal();
    },
    [closeModal],
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [closeModal]);

  return (
    <div className={styles.modalRoot} ref={rootRef}>
      <button aria-label="Закрыть окно авторизации" className={styles.overlay} onClick={closeModal} type="button" />
      <section aria-label={title} aria-modal="true" className={styles.modalCard} role="dialog">
        <header className={styles.modalHeader}>
          <div className={styles.modalBrand}>
            <span className={styles.brandMark} aria-hidden="true">
              <img src={brandLogo} alt="" />
            </span>
            RelaxUp
          </div>
          <button
            aria-label="Закрыть"
            className={styles.closeButton}
            onClick={handleCloseClick}
            type="button"
          >
            <span aria-hidden="true" className={styles.closeGlyph}>
              +
            </span>
          </button>
        </header>

        <div className={styles.modalBody}>
          <div className={styles.modalIntro}>
            <h1>{title}</h1>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { appRoutes } from '@/shared/routes';
import styles from './ForbiddenPage.module.css';

export function ForbiddenPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span>403</span>
        <h1>Доступ закрыт</h1>
        <p>У вашей роли нет прав на этот раздел. Войдите под подходящим аккаунтом или вернитесь на сайт.</p>
        <Link to={appRoutes.home()}>На главную</Link>
      </section>
    </main>
  );
}

import { AppProviders } from './providers/AppProviders';
import { AppRouter } from './router/AppRouter';
import styles from './App.module.css';

export function App() {
  return (
    <div className={styles.app} data-app-scroll-root>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </div>
  );
}

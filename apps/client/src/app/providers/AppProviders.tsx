import { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { store } from '../store/store';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </Provider>
  );
}

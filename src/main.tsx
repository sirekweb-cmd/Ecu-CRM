import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import { DepartmentProvider } from './context/DepartmentContext';
import { useCacheBuster } from './hooks/useCacheBuster';
import './index.css';

const CacheBuster = ({ children }: { children: React.ReactNode }) => {
  useCacheBuster();
  return <>{children}</>;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <DepartmentProvider>
        <CacheBuster>
          <App />
        </CacheBuster>
      </DepartmentProvider>
    </ErrorBoundary>
  </StrictMode>,
);

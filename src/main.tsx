import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Ssgoi } from '@ssgoi/react';
import { film } from '@ssgoi/react/view-transitions';
import { AuthProvider } from './components/AuthProvider.tsx';
import AppRouter from './AppRouter.tsx';
import { initAzureBlobStorage } from './lib/storage.ts';
import './index.css';

// Initialize Azure Blob Storage on app startup
initAzureBlobStorage().catch(error => {
  console.error('Failed to initialize Azure Blob Storage:', error);
});

const ssgConfig = {
  defaultTransition: film()
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Ssgoi config={ssgConfig}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </Ssgoi>
  </StrictMode>
);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './components/AuthProvider.tsx';
import AppRouter from './AppRouter.tsx';
import { initAzureBlobStorage } from './lib/storage.ts';
import './index.css';

// Initialize Azure Blob Storage on app startup
initAzureBlobStorage().catch(error => {
  console.error('Failed to initialize Azure Blob Storage:', error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </StrictMode>
);

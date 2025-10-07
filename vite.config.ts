import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // Firebase + Auth
          'vendor-firebase': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/storage',
          ],

          // Charts and visualizations
          'vendor-charts': ['recharts', 'framer-motion', '@react-spring/web'],

          // AI and utilities
          'vendor-ai': ['@temporalio/client', '@temporalio/workflow', '@temporalio/activity'],

          // UI components
          'vendor-ui': ['lucide-react', 'clsx', 'qrcode.react'],

          // Azure services
          'vendor-azure': ['@azure/storage-blob'],

          // Utilities
          'vendor-utils': ['xlsx', 'ajv', 'isomorphic-dompurify'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
    sourcemap: false, // Disable sourcemaps in production for smaller bundle
  },
});

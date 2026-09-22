/**
 * ============================================================
 * Vite Configuration — vite.config.ts
 * ============================================================
 * WHY Vite over CRA (Create React App):
 *   - 10-100x faster HMR (Hot Module Replacement)
 *   - Native ES modules — no bundling in dev
 *   - Built-in TypeScript support
 *   - Rollup for production builds (tree-shaking, code splitting)
 *
 * WHY proxy in dev:
 *   Frontend runs on :3000, API on :5000.
 *   Without proxy, CORS would block API calls.
 *   The proxy makes /api/* requests appear same-origin.
 *   WHY only needed in dev: In production, Nginx routes everything.
 * ============================================================
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(), // Enables React Fast Refresh (HMR for components)
  ],

  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },

  resolve: {
    alias: {
      // WHY path aliases: Import from '@/components/Button' instead of
      // '../../../components/Button' — cleaner, refactor-proof
      '@': path.resolve(import.meta.dirname, './src'),
      '@components': path.resolve(import.meta.dirname, './src/components'),
      '@pages': path.resolve(import.meta.dirname, './src/pages'),
      '@store': path.resolve(import.meta.dirname, './src/store'),
      '@hooks': path.resolve(import.meta.dirname, './src/hooks'),
      '@services': path.resolve(import.meta.dirname, './src/services'),
      '@utils': path.resolve(import.meta.dirname, './src/utils'),
      '@types': path.resolve(import.meta.dirname, './src/types'),
    },
  },

  server: {
    port: 3000,
    proxy: {
      // All /api requests → forwarded to the Express server
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // WebSocket connections → forwarded to Socket.io server
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true, // WHY ws:true: Enables WebSocket proxying
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false, // WHY false in prod: Don't expose source to users
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // WHY manualChunks: Split vendor libraries into separate bundles.
        // Users cache vendor.js between deploys → only app.js redownloaded.
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }

          if (
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/react-router-dom')
          ) {
            return 'router';
          }

          if (
            id.includes('node_modules/@reduxjs') ||
            id.includes('node_modules/react-redux') ||
            id.includes('node_modules/redux') ||
            id.includes('node_modules/immer') ||
            id.includes('node_modules/redux-thunk')
          ) {
            return 'redux';
          }

          if (id.includes('node_modules/@tanstack') || id.includes('node_modules/react-query')) {
            return 'query';
          }

          if (
            id.includes('node_modules/react-hook-form') ||
            id.includes('node_modules/@hookform')
          ) {
            return 'forms';
          }

          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }

          if (id.includes('node_modules/axios') || id.includes('node_modules/socket.io-client')) {
            return 'network';
          }
        },
      },
    },
  },
});

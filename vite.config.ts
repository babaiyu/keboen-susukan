import tailwindcss from '@tailwindcss/vite';
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    legacy(),
    VitePWA({
      registerType: 'autoUpdate',
      // Proper PWA metadata lives here so the generated manifest.webmanifest
      // (and its <link>) is the single source of truth.
      manifest: {
        name: 'Keboen Susukan — Manajemen Kebun',
        short_name: 'Keboen',
        description: 'Catat kebun, panen, dan masalah tanaman langsung dari HP. Bekerja penuh tanpa internet.',
        lang: 'id',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0d9488',
        background_color: '#f8fafc',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // The legacy Ionic bundle is ~2.2 MB; keep it precached for full
        // offline support on older Android browsers (PRD NFR: offline-first).
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // Precache the self-hosted fonts and icons too, not just JS/CSS/HTML.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    // Playwright e2e specs live in e2e/.
    include: ['src/**/*.test.{ts,tsx}'],
  },
});

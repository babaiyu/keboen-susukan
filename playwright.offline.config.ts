import { defineConfig, devices } from '@playwright/test';

// Offline verification needs a production build: vite-plugin-pwa only emits the
// service worker for `vite build`, not for the dev server. This config serves
// the built `dist/` through `vite preview` and runs the airplane-mode spec.
const baseURL = 'http://localhost:4173';

export default defineConfig({
  testDir: './e2e/offline',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Mobile Chrome (offline)',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});

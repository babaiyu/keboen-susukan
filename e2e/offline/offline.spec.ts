import { expect, test } from '@playwright/test';

// The service worker is only built for production (see
// playwright.offline.config.ts), so these specs run against `vite preview`.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('keboen-onboarded-v1', '1'));
});

test('boots the app shell and keeps data usable after going offline', async ({ page, context }) => {
  await page.goto('/tabs/kebun');
  await expect(page.getByText('Belum ada kebun')).toBeVisible();

  // Wait until the generated service worker is active and controlling the page,
  // which means the precache is in place before we pull the network.
  await page.waitForFunction(() => navigator.serviceWorker?.controller != null, undefined, {
    timeout: 30_000,
  });

  // Create a garden while online.
  await page.getByRole('button', { name: 'Tambah kebun' }).first().click();
  await page.locator('form ion-input input').first().fill('Kebun Offline');
  await page.getByRole('button', { name: 'Simpan kebun' }).click();
  await expect(page).toHaveURL(/\/tabs\/kebun$/);
  await expect(page.getByText('Kebun Offline')).toBeVisible();

  // Airplane mode: the reload must be served from the precached shell and the
  // IndexedDB record must still be there.
  await context.setOffline(true);
  await page.reload();

  await expect(page.getByRole('tab', { name: 'Grafik' })).toBeVisible();
  await expect(page.getByText('Kebun Offline')).toBeVisible();

  // Client-side navigation and writes keep working with the network down.
  await page.getByRole('tab', { name: 'Tanaman' }).click();
  await expect(page).toHaveURL(/\/tabs\/tanaman$/);
  await page.waitForTimeout(400);
  await page.locator('ion-fab-button[aria-label="Tambah tanaman"]').click();

  await page.locator('form ion-input input').first().fill('Cabai Offline');
  await page.getByRole('button', { name: 'Simpan tanaman' }).click();

  await expect(page.getByRole('heading', { name: 'Cabai Offline' })).toBeVisible();

  await context.setOffline(false);
});

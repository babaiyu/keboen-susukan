import { expect, test } from '@playwright/test';

test('shows the welcome intro once and remembers the choice', async ({ page }) => {
  await page.goto('/tabs/kebun');
  await expect(page.getByRole('heading', { name: 'Selamat datang di Keboen' })).toBeVisible();

  await page.getByRole('button', { name: 'Mulai' }).click();
  await expect(page.getByRole('heading', { name: 'Selamat datang di Keboen' })).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Belum ada kebun' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Selamat datang di Keboen' })).toBeHidden();
});

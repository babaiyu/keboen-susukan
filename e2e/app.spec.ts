import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Skip the first-run welcome modal so flow tests start on the Kebun list.
  await page.addInitScript(() => window.localStorage.setItem('keboen-onboarded-v1', '1'));
});

test('opens on the Kebun tab with an empty state', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/tabs\/kebun$/);
  await expect(page.getByText('Belum ada kebun')).toBeVisible();
});

test('shows a friendly empty state on the Grafik tab without a garden', async ({ page }) => {
  await page.goto('/tabs/grafik');
  await expect(page).toHaveURL(/\/tabs\/grafik$/);
  await expect(page.getByText('Belum ada kebun')).toBeVisible();
});

test('creates a garden and marks it active', async ({ page }) => {
  await page.goto('/tabs/kebun');
  await page.getByRole('button', { name: 'Tambah kebun' }).first().click();

  await page.locator('form ion-input input').first().fill('Kebun Uji');
  await page.getByRole('button', { name: 'Simpan kebun' }).click();

  await expect(page).toHaveURL(/\/tabs\/kebun$/);
  await expect(page.getByText('Kebun Uji')).toBeVisible();
  await expect(page.getByText('Aktif')).toBeVisible();
});

test('creates a plant and opens a visible detail page', async ({ page }) => {
  await page.goto('/tabs/kebun/new');
  await page.locator('form ion-input input').first().fill('Kebun Uji');
  await page.getByRole('button', { name: 'Simpan kebun' }).click();
  await expect(page).toHaveURL(/\/tabs\/kebun$/);

  await page.getByRole('tab', { name: 'Tanaman' }).click();
  await page.waitForTimeout(400);
  await page.locator('ion-fab-button[aria-label="Tambah tanaman"]').click();

  await page.locator('form ion-input input').first().fill('Cabai Rawit');
  await page.getByRole('button', { name: 'Simpan tanaman' }).click();

  await expect(page).toHaveURL(/\/tabs\/tanaman\/detail\?id=\d+$/);
  const detailPage = page
    .locator('.ion-page')
    .filter({ has: page.getByRole('heading', { name: 'Cabai Rawit' }) })
    .last();

  // Guards against the Ionic router leaving the entering page transparent.
  await expect.poll(() => detailPage.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');

  // Edit the plant and confirm the form transition is also visible.
  await page.getByRole('link', { name: 'Ubah data' }).click();
  await expect(page).toHaveURL(/\/tabs\/tanaman\/edit\?id=\d+$/);

  const editPage = page
    .locator('.ion-page')
    .filter({ has: page.getByRole('button', { name: 'Simpan perubahan' }) })
    .last();
  await expect.poll(() => editPage.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');

  await editPage.locator('form ion-input input').first().fill('Cabai Merah');
  await page.getByRole('button', { name: 'Simpan perubahan' }).click();

  await expect(page).toHaveURL(/\/tabs\/tanaman\/detail\?id=\d+$/);
  await expect(page.getByRole('heading', { name: 'Cabai Merah' })).toBeVisible();
});

test('records a harvest and updates the plant total', async ({ page }) => {
  await createGardenWithPlant(page, 'Kebun Uji', 'Cabai Rawit');

  await page.getByRole('button', { name: 'Tambah panen' }).click();
  await expect(page).toHaveURL(/\/tabs\/tanaman\/panen\/new\?plant=\d+$/);

  const newHarvest = await visiblePage(page, 'Simpan panen');
  await newHarvest.locator('ion-input input[type="number"]').fill('2.5');
  await page.getByRole('button', { name: 'Simpan panen' }).click();

  await expect(page).toHaveURL(/\/tabs\/tanaman\/detail\?id=\d+$/);
  await expect(page.getByText('Total panen')).toBeVisible();
  await expect(page.getByText('2,5 kg').first()).toBeVisible();

  // Edit the harvest amount and confirm the total follows.
  await page
    .getByRole('button', { name: /Ubah panen/ })
    .last()
    .click();
  await expect(page).toHaveURL(/\/tabs\/tanaman\/panen\/edit\?id=\d+$/);

  const editHarvest = await visiblePage(page, 'Simpan perubahan');
  await editHarvest.locator('ion-input input[type="number"]').fill('3');
  await page.getByRole('button', { name: 'Simpan perubahan' }).click();

  await expect(page).toHaveURL(/\/tabs\/tanaman\/detail\?id=\d+$/);
  await expect(page.getByText('3 kg').first()).toBeVisible();
});

test('records a problem with a chosen date and toggles its status', async ({ page }) => {
  await createGardenWithPlant(page, 'Kebun Uji', 'Selada');

  await page.getByRole('button', { name: 'Tambah masalah' }).click();
  await expect(page).toHaveURL(/\/tabs\/tanaman\/masalah\/new\?plant=\d+$/);

  const problemForm = await visiblePage(page, 'Simpan masalah');
  await problemForm.locator('ion-input input[type="date"]').fill('2026-01-02');

  // Ionic select opens an alert with radio options.
  await problemForm.locator('ion-select').first().click();
  await page.getByRole('radio', { name: 'Hama' }).click();
  await page.getByRole('button', { name: /^(OK|Oke)$/i }).click();

  await problemForm.locator('ion-textarea textarea').first().fill('Kutu daun di pucuk');
  await page.getByRole('button', { name: 'Simpan masalah' }).click();

  await expect(page).toHaveURL(/\/tabs\/tanaman\/detail\?id=\d+$/);

  // Scope to the detail page: the popped form stays mounted briefly with the
  // same description still inside its textarea.
  const detailPage = page
    .locator('.ion-page')
    .filter({ has: page.getByRole('heading', { name: 'Selada' }) })
    .last();
  await expect(detailPage.getByText('Kutu daun di pucuk')).toBeVisible();
  await expect(detailPage.getByText('2 Jan 2026')).toBeVisible();

  await page.getByRole('button', { name: 'Tandai teratasi' }).click();
  await expect(page.getByText('Teratasi')).toBeVisible();
});

test('shows a recorded harvest on the Grafik tab', async ({ page }) => {
  await createGardenWithPlant(page, 'Kebun Uji', 'Cabai Rawit');

  await page.getByRole('button', { name: 'Tambah panen' }).click();
  const newHarvest = await visiblePage(page, 'Simpan panen');
  await newHarvest.locator('ion-input input[type="number"]').fill('4');
  await page.getByRole('button', { name: 'Simpan panen' }).click();
  await expect(page).toHaveURL(/\/tabs\/tanaman\/detail\?id=\d+$/);

  await page.getByRole('tab', { name: 'Grafik' }).click();
  await expect(page).toHaveURL(/\/tabs\/grafik$/);

  // Guard against the Ionic page transition leaving the entering page transparent.
  await expect(page.getByRole('heading', { name: 'Tren panen' })).toBeVisible();

  const grafikPage = page
    .locator('.ion-page')
    .filter({ has: page.getByRole('heading', { name: 'Tren panen' }) })
    .last();
  await expect.poll(() => grafikPage.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
  await expect(grafikPage.getByText('4 kg')).toBeVisible();
});

test('warns that related data is deleted with a garden', async ({ page }) => {
  await createGardenWithPlant(page, 'Kebun Hapus', 'Selada');

  await page.getByRole('tab', { name: 'Kebun' }).click();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Hapus Kebun Hapus' }).click();

  const alert = page.locator('ion-alert');
  await expect(alert.getByText(/seluruh tanaman, panen, serta masalah/)).toBeVisible();
  await alert.getByRole('button', { name: 'Batal' }).click();
  await expect(alert.getByText(/seluruh tanaman, panen, serta masalah/)).toBeHidden();
});

async function createGardenWithPlant(page: Page, gardenName: string, plantName: string) {
  await page.goto('/tabs/kebun/new');
  await page.locator('form ion-input input').first().fill(gardenName);
  await page.getByRole('button', { name: 'Simpan kebun' }).click();
  await expect(page).toHaveURL(/\/tabs\/kebun$/);

  await page.getByRole('tab', { name: 'Tanaman' }).click();
  await page.waitForTimeout(400);
  await page.locator('ion-fab-button[aria-label="Tambah tanaman"]').click();

  await page.locator('form ion-input input').first().fill(plantName);
  await page.getByRole('button', { name: 'Simpan tanaman' }).click();

  await expect(page).toHaveURL(/\/tabs\/tanaman\/detail\?id=\d+$/);
  await expect(page.getByRole('heading', { name: plantName })).toBeVisible();
}

/** The newest Ionic page containing a given submit button (cached pages stay mounted). */
async function visiblePage(page: Page, submitLabel: string) {
  const locator = page
    .locator('.ion-page')
    .filter({ has: page.getByRole('button', { name: submitLabel }) })
    .last();
  await expect.poll(() => locator.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
  return locator;
}

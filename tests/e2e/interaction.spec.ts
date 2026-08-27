import { test, expect } from '@playwright/test';

test('opens and closes a location without losing the route grid', async ({ page }) => {
  await page.goto('/');
  const firstLocation = page.locator('[data-testid^="location-header-"]').first();
  await expect(firstLocation).toBeVisible();
  const locationId = await firstLocation.getAttribute('data-testid');
  expect(locationId).toBeTruthy();
  await firstLocation.click();
  await expect(page.locator('[data-testid$="-expanded"]')).toHaveCount(0, { timeout: 1_000 });
  await firstLocation.click();
  await expect(page.locator('[data-testid$="-expanded"]').first()).toBeVisible();
});

test('captures a Pokémon from the full encounter row and persists after reload', async ({ page }) => {
  await page.goto('/');
  const captureRow = page.getByRole('button', { name: /^Marcar .+ como capturado$/ }).first();
  await expect(captureRow).toBeVisible();
  const name = await captureRow.getAttribute('aria-label');
  await captureRow.click();
  const capturedName = name?.replace(/^Marcar /, 'Desmarcar ') ?? '';
  await expect(page.getByRole('button', { name: capturedName, exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  const restoredRow = page.getByRole('button', { name: capturedName, exact: true }).first();
  await expect(restoredRow).toHaveAttribute('aria-pressed', 'true');
});

test('navigates through the main progress areas and toggles the collapsible sidebar', async ({ page }) => {
  await page.goto('/');
  const sidebarToggle = page.getByTestId('sidebar-toggle');
  await expect(sidebarToggle).toHaveAttribute('aria-expanded', 'false');
  await sidebarToggle.click();
  await expect(sidebarToggle).toHaveAttribute('aria-expanded', 'true');

  await page.getByRole('button', { name: 'National Dex' }).click();
  await expect(page.getByRole('heading', { name: 'National Dex' })).toBeVisible();
  await page.getByRole('button', { name: 'Ginásios' }).click();
  await expect(page.getByRole('heading', { name: 'Ginásios e Elite Four' })).toBeVisible();
  await page.getByRole('button', { name: 'Localizações' }).click();
  await expect(page.getByRole('heading', { name: 'Localizações' })).toBeVisible();
});

test('keeps a saved capture after reopening the app on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const captureRow = page.getByRole('button', { name: /^Marcar .+ como capturado$/ }).first();
  const name = await captureRow.getAttribute('aria-label');
  const capturedName = name?.replace(/^Marcar /, 'Desmarcar ') ?? '';

  await captureRow.click();
  await page.reload();

  await expect(page.getByRole('button', { name: capturedName, exact: true }).first()).toHaveAttribute('aria-pressed', 'true');
  const stored = await page.evaluate(() => window.localStorage.getItem('routedex-progress-v2'));
  expect(stored).toContain('"version": 1');
});

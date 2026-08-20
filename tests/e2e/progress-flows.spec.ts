import { test, expect } from '@playwright/test';

test('keeps a capture synchronized when moving from locations to National Dex', async ({ page }) => {
  await page.goto('/');
  const row = page.getByRole('button', { name: /^Marcar .+ como capturado$/ }).first();
  const name = await row.getAttribute('aria-label');
  const capturedName = name?.replace(/^Marcar /, 'Desmarcar ') ?? '';
  await row.click();
  await expect(page.getByRole('button', { name: capturedName, exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'National Dex' }).click();
  await expect(page.getByRole('heading', { name: 'National Dex' })).toBeVisible();
  await expect(page.getByRole('button', { name: capturedName, exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('applies the version filter without changing the route progress denominator', async ({ page }) => {
  await page.goto('/');
  const routeHeader = page.locator('[data-testid^="location-header-"]').first();
  const beforeProgress = (await routeHeader.innerText()).match(/\d+\/\d+ capturados/)?.[0] ?? '';
  await page.getByLabel('Versão').selectOption('BD');
  await expect(routeHeader).toContainText(beforeProgress);
  await page.getByTestId('filter-horário').locator('select').selectOption('night');
  await expect(routeHeader).toBeVisible();
});

test('marks a gym battle and imports a saved progress backup', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Ginásios' }).click();
  const battle = page.getByRole('button', { name: /^Marcar batalha contra / }).first();
  const battleName = await battle.getAttribute('aria-label');
  const completedBattleName = battleName?.replace(/^Marcar /, 'Desmarcar ') ?? '';
  await battle.click();
  await expect(page.getByRole('button', { name: completedBattleName, exact: true })).toHaveAttribute('aria-pressed', 'true');

  const backup = JSON.stringify({ version: 1, capturedPokemon: {}, captureOrigins: {}, postgameCompleted: {}, collectedTMs: {}, gymLeadersCompleted: {}, eliteFourCompleted: {} });
  await page.locator('input[type="file"]').setInputFiles({ name: 'routedex-backup.json', mimeType: 'application/json', buffer: Buffer.from(backup) });
  await expect(page.getByRole('button', { name: battleName ?? '', exact: true })).toHaveAttribute('aria-pressed', 'false');
});

import { test, expect } from '@playwright/test';

test('loads the RouteDex shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('RouteDex', { exact: true })).toBeVisible();
});

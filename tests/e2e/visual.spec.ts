import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'mobile', width: 390, height: 844 },
];

test('captures responsive visual checkpoints and layout health metrics', async ({ page }) => {
  const outputDir = resolve('artifacts/qa/visual');
  mkdirSync(outputDir, { recursive: true });
  const reports: Array<Record<string, unknown>> = [];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await expect(page.getByText('RouteDex', { exact: true })).toBeVisible();
    const metrics = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      workspaceWidth: document.querySelector('.workspace')?.getBoundingClientRect().width ?? 0,
      sidebarStripeVisible: (() => {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return false;
        const style = getComputedStyle(sidebar, '::after');
        return style.display !== 'none' && Number.parseFloat(style.opacity || '0') > 0 && style.backgroundColor !== 'rgba(0, 0, 0, 0)';
      })(),
      spriteEffectCount: [...document.querySelectorAll('.encounter-row > img, .dex-card > img, .league-portrait img')].filter((image) => {
        const style = getComputedStyle(image);
        return style.filter !== 'none' || style.opacity !== '1' || style.mixBlendMode !== 'normal';
      }).length,
      cards: document.querySelectorAll('.location-card').length,
      encounterRows: document.querySelectorAll('.encounter-row').length,
    }));
    const screenshot = `artifacts/qa/visual/routedex-${viewport.name}.png`;
    await page.screenshot({ path: resolve(screenshot), fullPage: true });
    reports.push({ viewport: viewport.name, width: viewport.width, height: viewport.height, screenshot, ...metrics });
    expect(metrics.horizontalOverflow, `${viewport.name} has unexpected horizontal overflow`).toBe(false);
    expect(metrics.workspaceWidth, `${viewport.name} workspace does not fill the available width`).toBeGreaterThanOrEqual(metrics.documentWidth - 1);
    expect(metrics.sidebarStripeVisible, `${viewport.name} has an unintended sidebar stripe`).toBe(false);
    expect(metrics.spriteEffectCount, `${viewport.name} has filtered sprites`).toBe(0);
  }

  writeFileSync(resolve('artifacts/qa/visual-report.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), viewports: reports }, null, 2)}\n`, 'utf8');
});

test('uses a valid direct asset for every gym and Elite Four portrait', async ({ page, request }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Ginásios', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Ginásios e Elite Four' })).toBeVisible();
  const portraits = await page.locator('.league-portrait img').evaluateAll((images) => images.map((image) => ({
    alt: image.getAttribute('alt'),
    source: image.getAttribute('src') ?? '',
  })));

  expect(portraits).toHaveLength(12);
  expect(portraits.every((portrait) => portrait.source.includes('/media/upload/'))).toBe(true);

  for (const portrait of portraits) {
    const response = await request.get(portrait.source);
    expect(response.ok(), `${portrait.alt} asset is unavailable`).toBe(true);
    expect(response.headers()['content-type']).toContain('image/');
  }
});

test('uses four route columns on ultra-wide screens', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1080 });
  await page.goto('/');
  const firstRouteRow = page.locator('.location-row').first();
  await expect(firstRouteRow).toBeVisible();
  expect(await firstRouteRow.locator(':scope > .location-card').count()).toBe(4);
});

test('keeps encounter sprites large enough to preserve pixel detail', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const encounterSpriteSize = await page.locator('.encounter-row > img').first().evaluate((image) => image.getBoundingClientRect().width);
  expect(encounterSpriteSize).toBeGreaterThanOrEqual(56);

  await page.getByRole('button', { name: 'National Dex', exact: true }).click();
  const dexSpriteSize = await page.locator('.dex-card > img').first().evaluate((image) => image.getBoundingClientRect().width);
  expect(dexSpriteSize).toBeGreaterThanOrEqual(56);
});

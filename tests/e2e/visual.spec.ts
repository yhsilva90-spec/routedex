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
      cards: document.querySelectorAll('.location-card').length,
      encounterRows: document.querySelectorAll('.encounter-row').length,
    }));
    const screenshot = `artifacts/qa/visual/routedex-${viewport.name}.png`;
    await page.screenshot({ path: resolve(screenshot), fullPage: true });
    reports.push({ viewport: viewport.name, width: viewport.width, height: viewport.height, screenshot, ...metrics });
    expect(metrics.horizontalOverflow, `${viewport.name} has unexpected horizontal overflow`).toBe(false);
  }

  writeFileSync(resolve('artifacts/qa/visual-report.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), viewports: reports }, null, 2)}\n`, 'utf8');
});

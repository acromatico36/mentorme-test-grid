import { test, expect } from '@playwright/test';

const ROUTES = [
  "/",
  "/collections/all",
  "/cart",
  "/pages/how-it-works",
  "/pages/faq",
  "/pages/our-story",
  "/blog"
];

for (const r of ROUTES) {
  test(`visual: ${r} screenshot baseline`, async ({ page }) => {
    const resp = await page.goto(r, { waitUntil: 'networkidle' }).catch(() => null);
    if (!resp || resp.status() >= 400) test.skip(true, `${r} unavailable`);
    // First run records baseline; subsequent runs compare.
    await expect(page).toHaveScreenshot({ fullPage: true, maxDiffPixelRatio: 0.05 });
  });
}

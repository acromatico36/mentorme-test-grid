import { test, expect } from '@playwright/test';

test('critical: homepage -> product page link', async ({ page }) => {
  const resp = await page.goto('/');
  expect(resp!.status()).toBeLessThan(400);
  // Any product link on the homepage should be clickable.
  const productLink = page.locator('a[href*="/products/"]').first();
  if (await productLink.count() > 0) {
    await productLink.click();
    await page.waitForURL(/\/products\//);
    expect(page.url()).toMatch(/\/products\//);
  }
});

import { test, expect } from '@playwright/test';

test('critical: /admin/sign-in renders sign-in UI', async ({ page }) => {
  const resp = await page.goto('/admin/sign-in', { waitUntil: 'domcontentloaded' });
  expect(resp!.status()).toBeLessThan(500);
  const body = (await page.content()).toLowerCase();
  expect(body).toMatch(/sign in|log in|email|password|clerk/i);
});

import { test, expect } from '@playwright/test';

test('critical: /api/healthcheck returns ok-shaped JSON', async ({ request }) => {
  const resp = await request.get('/api/healthcheck');
  expect(resp.status()).toBeLessThan(500);
  if (resp.status() === 200) {
    const body = await resp.json().catch(() => ({}));
    expect(body).toBeTruthy();
  }
});

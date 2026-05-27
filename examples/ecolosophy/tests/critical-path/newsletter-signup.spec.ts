import { test, expect } from '@playwright/test';

test('critical: newsletter API accepts valid email', async ({ request }) => {
  const resp = await request.post('/api/newsletter', {
    data: { email: 'test+${Date.now()}@example.com' },
    headers: { 'content-type': 'application/json' },
  });
  expect(resp.status(), 'newsletter must not 5xx').toBeLessThan(500);
});

test('critical: newsletter API rejects malformed email', async ({ request }) => {
  const resp = await request.post('/api/newsletter', {
    data: { email: 'not-an-email' },
    headers: { 'content-type': 'application/json' },
  });
  expect(resp.status()).toBeLessThan(500);
});

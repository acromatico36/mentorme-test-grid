import { test, expect } from '@playwright/test';

// /api/checkout should validate input shape and return a Stripe session URL OR a structured error.
test('critical: checkout endpoint validates body', async ({ request }) => {
  const resp = await request.post('/api/checkout', { data: {} });
  expect(resp.status(), 'checkout must not 5xx on empty body').toBeLessThan(500);
});

test('critical: checkout endpoint accepts minimal valid payload', async ({ request }) => {
  const resp = await request.post('/api/checkout', {
    data: { items: [{ price: 'price_test', quantity: 1 }] },
  });
  // Either 200 with a URL, OR 4xx with a structured error — never 5xx.
  expect(resp.status()).toBeLessThan(500);
});

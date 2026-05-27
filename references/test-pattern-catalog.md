# Test Pattern Catalog

Every test in the grid falls into one of these patterns. Use this catalog when you need to add new tests by hand.

## 1. Smoke

**What it asserts**: page returns < 400 status, body renders, no JS console errors.

**When to use**: every public page. Cheap insurance.

```ts
test('@smoke @public loads /', async ({ page }) => {
  const res = await page.goto('/');
  expect(res!.status()).toBeLessThan(400);
  await expect(page.locator('body')).toBeVisible();
});
```

## 2. API health probe

**What it asserts**: GET endpoint returns < 500.

**When to use**: every read-only endpoint. Avoid POST/PUT/DELETE in this pattern.

```ts
test('@api GET /api/products', async ({ request }) => {
  const r = await request.get('/api/products', { failOnStatusCode: false });
  expect(r.status()).toBeLessThan(500);
});
```

## 3. Form submission

**What it asserts**: form accepts input, submits, no JS error, network call returns OK.

```ts
test('@critical newsletter signup', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[type="email"]', 'grid+ok@example.com');
  const [resp] = await Promise.all([
    page.waitForResponse(r => r.url().includes('/api/newsletter')),
    page.click('button[type="submit"]'),
  ]);
  expect(resp.status()).toBeLessThan(400);
});
```

## 4. Critical-path E2E

**What it asserts**: end-to-end flow (signup -> dashboard, add-to-cart -> checkout, book -> confirm).

```ts
test('@critical @payment checkout reaches Stripe', async ({ page }) => {
  await page.goto('/');
  await page.click('a[href^="/products/"]');
  await page.click('button:has-text("Add to cart")');
  await page.goto('/cart');
  await page.click('button:has-text("Checkout")');
  await page.waitForURL(/checkout\.stripe\.com/);
});
```

## 5. Visual regression

**What it asserts**: screenshot matches baseline within 2% diff.

```ts
test('@visual homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('home.png', { maxDiffPixelRatio: 0.02 });
});
```

## 6. Auth-gated smoke

**What it asserts**: with a test session cookie, admin page loads.

```ts
test('@admin @auth /admin loads with session', async ({ browser }) => {
  const ctx = await browser.newContext({
    storageState: 'tests/.auth/admin.json',  // pre-saved session
  });
  const page = await ctx.newPage();
  const r = await page.goto('/admin');
  expect(r!.status()).toBeLessThan(400);
});
```

To save a session: `npx playwright codegen --save-storage=tests/.auth/admin.json https://yoursite/admin/sign-in`

## 7. Performance budget

**What it asserts**: page loads under N ms, transfers under M kb.

```ts
test('@perf homepage TTFB < 1500ms', async ({ page }) => {
  const start = Date.now();
  await page.goto('/');
  expect(Date.now() - start).toBeLessThan(1500);
});
```

## 8. Accessibility (a11y)

Use `@axe-core/playwright`:

```ts
import AxeBuilder from '@axe-core/playwright';
test('@a11y homepage', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

## Tag taxonomy

| Tag | Bucket | Skip rule |
|---|---|---|
| `@smoke` | smoke | never |
| `@api` | api | never |
| `@critical` | critical | never |
| `@visual` | visual | first run = baseline |
| `@payment` | payment | skip unless `STRIPE_TEST_MODE=1` |
| `@destructive` | admin | skip unless `RUN_DESTRUCTIVE=1` |
| `@auth` | auth | skip if no `tests/.auth/*.json` |
| `@admin` | admin | requires auth |
| `@a11y` | a11y | optional |
| `@perf` | perf | optional |

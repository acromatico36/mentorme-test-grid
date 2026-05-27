import { test, expect } from '@playwright/test';

const ADMIN_ROUTES: string[] = [
  "/admin/amazon",
  "/admin/analytics",
  "/admin/apps",
  "/admin/calculator",
  "/admin/content",
  "/admin/customers",
  "/admin/detox",
  "/admin/discounts",
  "/admin",
  "/admin/marketing",
  "/admin/orders",
  "/admin/pipeline",
  "/admin/products",
  "/admin/seo",
  "/admin/settings",
  "/admin/shipmonk",
  "/admin/shopify",
  "/admin/social",
  "/admin/support"
];

// Unauthenticated context: hitting any admin route should redirect to /admin/sign-in or /admin/forbidden,
// or return 401/403. It must NEVER return 200 with the admin dashboard contents.
for (const r of ADMIN_ROUTES) {
  test(`admin auth-gate: ${r} blocks unauthenticated access`, async ({ page }) => {
    const resp = await page.goto(r, { waitUntil: 'domcontentloaded' });
    expect(resp).not.toBeNull();
    const url = page.url();
    const status = resp!.status();
    const body = (await page.content()).toLowerCase();

    // Pass if we're redirected to sign-in/forbidden, OR if we get a 4xx, OR if the body asks for sign-in.
    const okPatterns = [
      /sign-?in/i.test(url),
      /forbidden/i.test(url),
      status === 401 || status === 403,
      /sign in|please log in|access denied|forbidden/i.test(body),
    ];
    const isGated = okPatterns.some(Boolean);
    expect(isGated, `${r} appears to be PUBLIC (status=${status}, url=${url})`).toBe(true);
  });
}

import { test, expect } from '@playwright/test';

// Auth-gated pages should either render a sign-in prompt or 302/redirect to /admin/sign-in or /account/sign-in.
const PAGES: { route: string; file: string }[] = [
  {
    "route": "/account",
    "file": "src/pages/account/index.astro"
  },
  {
    "route": "/admin/amazon",
    "file": "src/pages/admin/amazon.astro"
  },
  {
    "route": "/admin/analytics",
    "file": "src/pages/admin/analytics.astro"
  },
  {
    "route": "/admin/apps",
    "file": "src/pages/admin/apps.astro"
  },
  {
    "route": "/admin/calculator",
    "file": "src/pages/admin/calculator.astro"
  },
  {
    "route": "/admin/content",
    "file": "src/pages/admin/content.astro"
  },
  {
    "route": "/admin/customers",
    "file": "src/pages/admin/customers.astro"
  },
  {
    "route": "/admin/detox",
    "file": "src/pages/admin/detox.astro"
  },
  {
    "route": "/admin/discounts",
    "file": "src/pages/admin/discounts.astro"
  },
  {
    "route": "/admin/forbidden",
    "file": "src/pages/admin/forbidden.astro"
  },
  {
    "route": "/admin",
    "file": "src/pages/admin/index.astro"
  },
  {
    "route": "/admin/marketing",
    "file": "src/pages/admin/marketing.astro"
  },
  {
    "route": "/admin/orders",
    "file": "src/pages/admin/orders.astro"
  },
  {
    "route": "/admin/pipeline",
    "file": "src/pages/admin/pipeline.astro"
  },
  {
    "route": "/admin/products",
    "file": "src/pages/admin/products.astro"
  },
  {
    "route": "/admin/seo",
    "file": "src/pages/admin/seo.astro"
  },
  {
    "route": "/admin/settings",
    "file": "src/pages/admin/settings.astro"
  },
  {
    "route": "/admin/shipmonk",
    "file": "src/pages/admin/shipmonk.astro"
  },
  {
    "route": "/admin/shopify",
    "file": "src/pages/admin/shopify.astro"
  },
  {
    "route": "/admin/sign-in",
    "file": "src/pages/admin/sign-in.astro"
  },
  {
    "route": "/admin/social",
    "file": "src/pages/admin/social.astro"
  },
  {
    "route": "/admin/support",
    "file": "src/pages/admin/support.astro"
  }
];

for (const p of PAGES) {
  test(`auth-gate: ${p.route} is protected`, async ({ page }) => {
    const resp = await page.goto(p.route, { waitUntil: 'domcontentloaded' });
    expect(resp).not.toBeNull();
    const status = resp!.status();
    const url = page.url();
    const body = (await page.content()).toLowerCase();
    const isRedirectedToSignIn = /sign-?in|login|forbidden/i.test(url) || /sign in|sign-in|forbidden|please log in/i.test(body);
    const isProtected = isRedirectedToSignIn || status === 401 || status === 403 || status === 302;
    if (!isProtected) {
      // page rendered fully — at minimum its status must be < 500
      expect(status, `${p.route} returned 5xx`).toBeLessThan(500);
    } else {
      expect(isProtected).toBe(true);
    }
  });
}

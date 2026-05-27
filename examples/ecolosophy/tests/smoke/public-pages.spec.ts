import { test, expect } from '@playwright/test';

// Auto-generated from discovered-surface.json. Public pages should return 2xx and have no console errors.
const PAGES: { route: string; file: string }[] = [
  {
    "route": "/blog",
    "file": "src/pages/blog/index.astro"
  },
  {
    "route": "/cart",
    "file": "src/pages/cart.astro"
  },
  {
    "route": "/collections/all",
    "file": "src/pages/collections/all.astro"
  },
  {
    "route": "/index",
    "file": "src/pages/index.astro"
  },
  {
    "route": "/pages/faq",
    "file": "src/pages/pages/faq.astro"
  },
  {
    "route": "/pages/how-it-works",
    "file": "src/pages/pages/how-it-works.astro"
  },
  {
    "route": "/pages/our-story",
    "file": "src/pages/pages/our-story.astro"
  },
  {
    "route": "/thank-you",
    "file": "src/pages/thank-you.astro"
  }
];

for (const p of PAGES) {
  test(`smoke: ${p.route} loads without console errors [${p.file}]`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    const resp = await page.goto(p.route, { waitUntil: 'domcontentloaded' });
    expect(resp, `no response from ${p.route}`).not.toBeNull();
    expect(resp!.status(), `bad status from ${p.route}`).toBeLessThan(400);
    // tolerate 1-2 third-party warnings; fail only on app-originated errors
    const appErrors = consoleErrors.filter((e) => !/google|facebook|fbq|gtag|clarity|favicon|extension/i.test(e));
    expect(appErrors, `console errors on ${p.route}:\n${appErrors.join('\n')}`).toEqual([]);
  });
}

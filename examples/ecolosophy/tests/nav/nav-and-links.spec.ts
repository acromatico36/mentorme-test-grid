import { test, expect } from '@playwright/test';

const LINKS: string[] = [
  "/",
  "/account/sign-in",
  "/account/sign-up",
  "/admin",
  "/admin/analytics",
  "/admin/content",
  "/admin/detox",
  "/admin/orders",
  "/admin/products",
  "/admin/seo",
  "/admin/settings",
  "/admin/sign-in",
  "/admin/support",
  "/admin/support/${t.id}",
  "/api/admin/pipeline-add",
  "/api/test-relay",
  "/blog",
  "/collections/all",
  "/collections/concentrates",
  "/pages/how-it-works",
  "/products/citrus-burst-concentrate",
  "/the-cleaning-playbook.pdf"
];

for (const href of LINKS) {
  test(`nav: ${href} reachable (no 404 / 5xx)`, async ({ request }) => {
    const resp = await request.get(href, { maxRedirects: 5 });
    expect(resp.status(), `${href} returned ${resp.status()}`).toBeLessThan(500);
    expect(resp.status(), `${href} returned 404`).not.toBe(404);
  });
}

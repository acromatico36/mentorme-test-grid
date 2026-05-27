import { test, expect } from '@playwright/test';

const FORMS: any[] = [
  {
    "route": "/admin/seo",
    "action": "",
    "method": "get",
    "id": "kw-add-form",
    "inputs": [],
    "index": 0
  },
  {
    "route": "/admin/seo",
    "action": "",
    "method": "get",
    "id": "",
    "inputs": [
      {
        "name": "key",
        "type": "text",
        "required": false
      }
    ],
    "index": 1
  }
];

if (FORMS.length === 0) {
  test('forms: no forms discovered in source — placeholder', () => { /* nothing to test */ });
}

for (const f of FORMS) {
  test(`form: ${f.route} form#${f.index} renders + inputs visible`, async ({ page }) => {
    const resp = await page.goto(f.route, { waitUntil: 'domcontentloaded' });
    expect(resp!.status()).toBeLessThan(400);
    const formLocator = f.id ? page.locator(`form#${f.id}`) : page.locator('form').nth(f.index);
    await expect(formLocator).toBeVisible();
    for (const inp of f.inputs) {
      const sel = `[name="${inp.name}"]`;
      await expect(formLocator.locator(sel).first(), `missing field ${inp.name} on ${f.route}`).toBeAttached();
    }
  });
}

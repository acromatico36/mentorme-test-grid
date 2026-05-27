import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Smoke tests: every page returns 200 and renders without console errors.
 * Auto-generated from discovered-surface.json. Edit freely — re-running the
 * installer never overwrites this file.
 */

type Surface = {
  id: string;
  type: 'page' | 'api' | 'form' | 'cta' | 'flow';
  path: string;
  bucket?: string;
  requires_auth?: boolean;
};

const surfaceFile = path.resolve(process.cwd(), 'discovered-surface.json');
const surface = fs.existsSync(surfaceFile)
  ? JSON.parse(fs.readFileSync(surfaceFile, 'utf8'))
  : { surfaces: [] };

const pages: Surface[] = (surface.surfaces || []).filter(
  (s: Surface) => s.type === 'page' && !s.requires_auth
);

if (pages.length === 0) {
  test('smoke placeholder — no public pages discovered yet', async ({ page }) => {
    await page.goto('/');
    expect(page).toBeTruthy();
  });
} else {
  for (const surf of pages) {
    test(`@smoke @${surf.bucket || 'public'} loads ${surf.path}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text());
      });

      const response = await page.goto(surf.path, { waitUntil: 'domcontentloaded' });
      expect(response, `no response for ${surf.path}`).not.toBeNull();
      expect(response!.status(), `status for ${surf.path}`).toBeLessThan(400);

      // Page should have at least one rendered element
      await expect(page.locator('body')).toBeVisible();

      // Hard-fail on JS console errors (catch silent breakage)
      const filtered = errors.filter(
        (e) =>
          !e.includes('favicon') &&
          !e.includes('Failed to load resource: net::ERR_BLOCKED_BY_CLIENT')
      );
      expect(filtered, `console errors on ${surf.path}: ${filtered.join('\n')}`).toHaveLength(0);
    });
  }
}

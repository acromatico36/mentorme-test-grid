import { test, expect, request } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * API health probes. GETs every discovered /api/* endpoint and asserts
 * a non-5xx response. POST/PUT/DELETE endpoints are skipped unless
 * marked `safe_method: 'GET'` in discovered-surface.json.
 */

type Surface = {
  id: string;
  type: 'api';
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  safe_method?: 'GET';
  bucket?: string;
};

const surfaceFile = path.resolve(process.cwd(), 'discovered-surface.json');
const surface = fs.existsSync(surfaceFile)
  ? JSON.parse(fs.readFileSync(surfaceFile, 'utf8'))
  : { surfaces: [] };

const endpoints: Surface[] = (surface.surfaces || []).filter(
  (s: Surface) =>
    s.type === 'api' && (s.method === 'GET' || s.safe_method === 'GET' || !s.method)
);

if (endpoints.length === 0) {
  test('api-health placeholder — no public endpoints discovered', async () => {
    expect(true).toBe(true);
  });
} else {
  for (const ep of endpoints) {
    test(`@api @${ep.bucket || 'api'} GET ${ep.path}`, async ({ request }) => {
      const res = await request.get(ep.path, { failOnStatusCode: false });
      expect(
        res.status(),
        `${ep.path} returned ${res.status()}`
      ).toBeLessThan(500);
    });
  }
}

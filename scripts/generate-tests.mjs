#!/usr/bin/env node
/**
 * generate-tests.mjs
 * Reads discovered-surface.json and copies template specs into tests/.
 *
 * Usage: node scripts/generate-tests.mjs [projectDir]
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(__dirname, '..');
const PROJECT = path.resolve(process.argv[2] || process.cwd());

const TEMPLATES = [
  ['smoke.spec.ts.tmpl', 'smoke.spec.ts'],
  ['api-health.spec.ts.tmpl', 'api-health.spec.ts'],
  ['critical-path.spec.ts.tmpl', 'critical-path.spec.ts'],
  ['visual.spec.ts.tmpl', 'visual.spec.ts'],
];

async function main() {
  const surfacePath = path.join(PROJECT, 'discovered-surface.json');
  try {
    await fs.access(surfacePath);
  } catch {
    console.error('[generate] No discovered-surface.json. Run: node scripts/discover.mjs');
    process.exit(1);
  }

  await fs.mkdir(path.join(PROJECT, 'tests'), { recursive: true });

  for (const [tmpl, dest] of TEMPLATES) {
    const destPath = path.join(PROJECT, 'tests', dest);
    const tmplPath = path.join(SKILL_ROOT, 'templates', tmpl);
    try {
      await fs.access(destPath);
      console.log(`[generate] skip (exists) tests/${dest}`);
    } catch {
      const body = await fs.readFile(tmplPath, 'utf8');
      await fs.writeFile(destPath, body);
      console.log(`[generate] wrote tests/${dest}`);
    }
  }

  const cfgDest = path.join(PROJECT, 'playwright.config.ts');
  try {
    await fs.access(cfgDest);
    console.log('[generate] skip (exists) playwright.config.ts');
  } catch {
    const body = await fs.readFile(path.join(SKILL_ROOT, 'templates/playwright.config.ts'), 'utf8');
    await fs.writeFile(cfgDest, body);
    console.log('[generate] wrote playwright.config.ts');
  }

  console.log('[generate] done');
}

main().catch((e) => { console.error(e); process.exit(1); });

#!/usr/bin/env node
/**
 * embed-widget.mjs
 *
 * Copies the widget files into the target project's public/test-grid/
 * directory and prints the iframe snippet to drop into any dashboard.
 *
 * Usage:
 *   node scripts/embed-widget.mjs [projectDir]
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(__dirname, '..');
const PROJECT = path.resolve(process.argv[2] || process.cwd());

const FILES = ['widget.html', 'widget.css', 'widget.js'];

async function main() {
  const dest = path.join(PROJECT, 'public/test-grid');
  await fs.mkdir(dest, { recursive: true });
  for (const f of FILES) {
    const body = await fs.readFile(path.join(SKILL_ROOT, 'templates/widget', f), 'utf8');
    await fs.writeFile(path.join(dest, f), body);
    console.log(`[embed] wrote public/test-grid/${f}`);
  }

  // Empty fallback status
  const statusDir = path.join(dest, 'api');
  await fs.mkdir(statusDir, { recursive: true });
  const statusPath = path.join(statusDir, 'status.json');
  try {
    await fs.access(statusPath);
  } catch {
    await fs.writeFile(statusPath, JSON.stringify({
      updated_at: null, total: 0, passed: 0, failed: 0, surfaces: [],
    }, null, 2));
    console.log('[embed] wrote public/test-grid/api/status.json (empty fallback)');
  }

  console.log('\nDrop this anywhere in your dashboard:\n');
  console.log('  <iframe src="/test-grid/widget.html" style="border:0;width:100%;height:240px" title="System status"></iframe>\n');
}

main().catch((e) => { console.error(e); process.exit(1); });

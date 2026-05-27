#!/usr/bin/env node
/**
 * run-grid.mjs
 * Runs Playwright tests and writes test-grid/api/status.json + public/test-grid/api/status.json.
 *
 * Safe to call when @playwright/test isn't installed yet — emits an "empty"
 * status payload so the widget renders "no tests run yet".
 *
 * Usage:
 *   node scripts/run-grid.mjs [projectDir]
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const PROJECT = path.resolve(process.argv[2] || process.cwd());

async function ensureDir(p) { await fs.mkdir(p, { recursive: true }); }

function summarize(reportJson) {
  const buckets = {};
  let total = 0, passed = 0, failed = 0;

  const visit = (suites = []) => {
    for (const suite of suites) {
      for (const spec of (suite.specs || [])) {
        for (const t of (spec.tests || [])) {
          total++;
          const ok = (t.results || []).every((x) => x.status === 'passed');
          if (ok) passed++; else failed++;
          const m = spec.title && spec.title.match(/@(\w+)/);
          const tag = (m && m[1]) || 'other';
          buckets[tag] = buckets[tag] || { name: tag, bucket: tag, total: 0, passed: 0, failed: 0 };
          buckets[tag].total++;
          if (ok) buckets[tag].passed++; else buckets[tag].failed++;
        }
      }
      if (suite.suites) visit(suite.suites);
    }
  };
  visit(reportJson.suites || []);

  return {
    updated_at: new Date().toISOString(),
    total, passed, failed,
    surfaces: Object.values(buckets),
  };
}

async function writeStatus(payload) {
  const stamps = [
    path.join(PROJECT, 'test-grid/api/status.json'),
    path.join(PROJECT, 'public/test-grid/api/status.json'),
  ];
  for (const s of stamps) {
    await ensureDir(path.dirname(s));
    await fs.writeFile(s, JSON.stringify(payload, null, 2));
  }
  console.log('[run-grid] status written:', stamps.join(', '));
}

async function main() {
  await ensureDir(path.join(PROJECT, 'test-grid/api'));

  const reportPath = path.join(PROJECT, 'test-grid/playwright-report.json');

  // Check if @playwright/test is available
  const playwrightPath = path.join(PROJECT, 'node_modules/@playwright/test/package.json');
  const playwrightAvailable = await fs.access(playwrightPath).then(() => true).catch(() => false);

  if (!playwrightAvailable) {
    console.warn('[run-grid] @playwright/test not installed. Writing empty status.');
    await writeStatus({
      updated_at: new Date().toISOString(),
      total: 0, passed: 0, failed: 0,
      surfaces: [],
      note: 'Playwright not installed. Run: npm install && npx playwright install chromium',
    });
    return;
  }

  // Spawn playwright
  const args = ['playwright', 'test', '--reporter=list,json'];
  const child = spawn('npx', args, {
    cwd: PROJECT,
    env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: 'test-grid/playwright-report.json' },
    stdio: 'inherit',
  });

  await new Promise((resolve) => child.on('close', resolve));

  // Read JSON report
  let report = null;
  try {
    const body = await fs.readFile(reportPath, 'utf8');
    report = JSON.parse(body);
  } catch (e) {
    console.warn('[run-grid] no JSON report; writing minimal status');
    await writeStatus({
      updated_at: new Date().toISOString(),
      total: 0, passed: 0, failed: 0, surfaces: [],
      note: 'No JSON report; check Playwright config.',
    });
    return;
  }

  const summary = summarize(report);
  await writeStatus(summary);

  console.log('[run-grid] ' + summary.passed + '/' + summary.total + ' passed, ' + summary.failed + ' failed');
}

main().catch((e) => { console.error(e); process.exit(1); });

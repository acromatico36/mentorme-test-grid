#!/usr/bin/env node
/**
 * fanout.mjs
 *
 * Splits Playwright tests into N parallel shards by tag bucket
 * (auth, admin, payment, api, public) and runs them concurrently.
 *
 * This is the CLI version of the multi-agent fanout. The Claude-driven
 * version lives at workflows/05-multi-agent-fanout.md.
 *
 * Usage:
 *   node scripts/fanout.mjs [projectDir] [--workers=5]
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const PROJECT = path.resolve(process.argv.find((a) => !a.startsWith('--') && a !== process.argv[0] && a !== process.argv[1]) || process.cwd());
const workersArg = process.argv.find((a) => a.startsWith('--workers='));
const WORKERS = workersArg ? parseInt(workersArg.split('=')[1], 10) : 5;

const BUCKETS = ['auth', 'admin', 'payment', 'api', 'public', 'critical', 'smoke', 'visual'];

function runBucket(bucket) {
  return new Promise((resolve) => {
    const child = spawn('npx', ['playwright', 'test', '--grep', `@${bucket}`, '--reporter=json'], {
      cwd: PROJECT,
      env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: `test-grid/shard-${bucket}.json` },
    });
    let out = '';
    child.stdout.on('data', (d) => out += d.toString());
    child.stderr.on('data', () => {}); // discard noise
    child.on('close', (code) => resolve({ bucket, code, out }));
  });
}

async function main() {
  console.log(`[fanout] running ${BUCKETS.length} buckets in parallel (workers=${WORKERS})`);
  await fs.mkdir(path.join(PROJECT, 'test-grid'), { recursive: true });

  // Simple worker-pool
  const queue = [...BUCKETS];
  const results = [];
  async function worker() {
    while (queue.length) {
      const b = queue.shift();
      const start = Date.now();
      const r = await runBucket(b);
      console.log(`[fanout] ${b}: exit ${r.code} (${((Date.now() - start) / 1000).toFixed(1)}s)`);
      results.push(r);
    }
  }
  await Promise.all(Array.from({ length: WORKERS }, () => worker()));

  console.log('[fanout] done. Merge shards into status.json with: node scripts/run-grid.mjs');
}

main().catch((e) => { console.error(e); process.exit(1); });

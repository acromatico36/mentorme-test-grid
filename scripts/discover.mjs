#!/usr/bin/env node
/**
 * discover.mjs
 * Walks a project, finds testable surfaces, writes discovered-surface.json.
 *
 * Supports:
 *   - Astro:  src/pages, src/pages/api, functions
 *   - Next:   pages, app, pages/api, app/api
 *   - Plain:  *.html in repo root or public/
 *
 * Usage:
 *   node scripts/discover.mjs [projectDir]
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

const PROJECT = path.resolve(process.argv[2] || process.cwd());

async function walk(dir, hits = []) {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return hits; }
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'dist' || e.name === 'build') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, hits);
    else hits.push(full);
  }
  return hits;
}

function bucketFor(p) {
  if (/\/admin\//.test(p)) return 'admin';
  if (/\/api\//.test(p) || /functions\//.test(p)) return 'api';
  if (/\/account\//.test(p) || /sign-?in|sign-?up|login|register|auth/i.test(p)) return 'auth';
  if (/checkout|cart|payment|stripe/i.test(p)) return 'payment';
  if (/\/blog\//.test(p) || /\/posts\//.test(p)) return 'content';
  return 'public';
}

function routeFromAstro(filePath, projectDir) {
  const rel = path.relative(path.join(projectDir, 'src/pages'), filePath);
  let route = '/' + rel.replace(/\\/g, '/').replace(/\.astro$/, '').replace(/\.(ts|js)$/, '');
  route = route.replace(/\/index$/, '/');
  if (route !== '/' && route.endsWith('/')) route = route.slice(0, -1);
  if (route === '') route = '/';
  return route;
}

function routeFromNext(filePath, projectDir) {
  let rel = path.relative(path.join(projectDir, 'pages'), filePath);
  if (rel.startsWith('..')) {
    rel = path.relative(path.join(projectDir, 'app'), filePath);
    rel = rel.replace(/\/page\.(tsx|ts|jsx|js)$/, '/');
  } else {
    rel = rel.replace(/\.(tsx|ts|jsx|js)$/, '');
  }
  let route = '/' + rel.replace(/\\/g, '/');
  route = route.replace(/\/index$/, '/');
  if (route !== '/' && route.endsWith('/')) route = route.slice(0, -1);
  if (route === '') route = '/';
  return route;
}

function isAuthGated(filePath, projectDir, source) {
  if (/\/admin\//.test(filePath)) return true;
  if (/\/account\//.test(filePath)) return true;
  if (source && /requires?Auth|withAuth|getServerSession|useSession|session\.user|cookie.*token/i.test(source)) return true;
  return false;
}

async function exists(p) { return fs.access(p).then(() => true).catch(() => false); }

async function main() {
  const all = await walk(PROJECT);
  const surfaces = [];
  let projectType = 'unknown';

  if (await exists(path.join(PROJECT, 'astro.config.mjs')) ||
      await exists(path.join(PROJECT, 'astro.config.ts')) ||
      await exists(path.join(PROJECT, 'astro.config.js'))) {
    projectType = 'astro';
  } else if (await exists(path.join(PROJECT, 'next.config.js')) ||
             await exists(path.join(PROJECT, 'next.config.mjs')) ||
             await exists(path.join(PROJECT, 'next.config.ts'))) {
    projectType = 'next';
  } else if (await exists(path.join(PROJECT, 'index.html'))) {
    projectType = 'static';
  }

  for (const f of all) {
    const rel = path.relative(PROJECT, f);

    // ASTRO PAGES
    if (projectType === 'astro' && rel.startsWith('src/pages/') && f.endsWith('.astro')) {
      if (/\[\.\.\.|\[/.test(rel)) continue; // skip dynamic routes
      const src = await fs.readFile(f, 'utf8').catch(() => '');
      const route = routeFromAstro(f, PROJECT);
      surfaces.push({
        id: 'page:' + route,
        type: 'page',
        path: route,
        bucket: bucketFor(rel),
        requires_auth: isAuthGated(f, PROJECT, src),
        source_file: rel,
      });
    }

    // ASTRO API ROUTES
    if (projectType === 'astro' && rel.startsWith('src/pages/api/') && /\.(ts|js)$/.test(f)) {
      const src = await fs.readFile(f, 'utf8').catch(() => '');
      const method =
        /export\s+(const|async\s+function)\s+POST/.test(src) ? 'POST' :
        /export\s+(const|async\s+function)\s+GET/.test(src) ? 'GET' :
        'GET';
      const route = routeFromAstro(f, PROJECT);
      surfaces.push({
        id: 'api:' + route,
        type: 'api',
        path: route,
        method,
        safe_method: method === 'GET' ? 'GET' : undefined,
        bucket: 'api',
        source_file: rel,
      });
    }

    // CLOUDFLARE PAGES FUNCTIONS
    if (rel.startsWith('functions/') && /\.(ts|js|mjs)$/.test(f) && !rel.includes('test-grid')) {
      const src = await fs.readFile(f, 'utf8').catch(() => '');
      const route = '/' + rel.replace(/^functions\//, '').replace(/\.(ts|js|mjs)$/, '').replace(/\/index$/, '');
      const hasGet = /onRequestGet|export\s+default\s+(async\s+)?function/.test(src);
      if (route.match(/\/_[a-z]+$/)) continue; // _scheduled / _middleware
      surfaces.push({
        id: 'fn:' + route,
        type: 'api',
        path: route,
        method: hasGet ? 'GET' : 'POST',
        safe_method: hasGet ? 'GET' : undefined,
        bucket: 'api',
        source_file: rel,
      });
    }

    // NEXT PAGES
    if (projectType === 'next' && (rel.startsWith('pages/') || rel.startsWith('app/')) && /\.(tsx|jsx|ts|js)$/.test(f)) {
      if (/\[/.test(rel)) continue;
      const src = await fs.readFile(f, 'utf8').catch(() => '');
      const route = routeFromNext(f, PROJECT);
      if (route.startsWith('/api')) {
        surfaces.push({
          id: 'api:' + route,
          type: 'api',
          path: route,
          method: 'GET',
          safe_method: 'GET',
          bucket: 'api',
          source_file: rel,
        });
      } else {
        surfaces.push({
          id: 'page:' + route,
          type: 'page',
          path: route,
          bucket: bucketFor(rel),
          requires_auth: isAuthGated(f, PROJECT, src),
          source_file: rel,
        });
      }
    }

    // PLAIN HTML
    if (projectType === 'static' && rel.endsWith('.html') && !rel.includes('node_modules')) {
      const route = '/' + rel.replace(/index\.html$/, '').replace(/\.html$/, '');
      surfaces.push({
        id: 'page:' + route,
        type: 'page',
        path: route === '/' ? '/' : route,
        bucket: bucketFor(rel),
        requires_auth: false,
        source_file: rel,
      });
    }
  }

  // dedupe by id
  const seen = new Set();
  const deduped = surfaces.filter((s) => (seen.has(s.id) ? false : seen.add(s.id)));

  const output = {
    version: 1,
    project_type: projectType,
    project_dir: PROJECT,
    base_url: process.env.TEST_GRID_BASE_URL || (projectType === 'astro' ? 'http://localhost:4321' : 'http://localhost:3000'),
    generated_at: new Date().toISOString(),
    surfaces: deduped,
  };

  const outPath = path.join(PROJECT, 'discovered-surface.json');
  await fs.writeFile(outPath, JSON.stringify(output, null, 2));
  console.log(`[discover] ${deduped.length} surfaces -> ${outPath}`);
  const counts = deduped.reduce((acc, s) => ((acc[s.bucket] = (acc[s.bucket] || 0) + 1), acc), {});
  console.log('[discover] buckets:', counts);
}

main().catch((e) => { console.error(e); process.exit(1); });

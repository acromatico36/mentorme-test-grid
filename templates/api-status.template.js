/**
 * mentorme-test-grid status endpoint.
 *
 * Cloudflare Pages Function shape (default export onRequestGet).
 * Also works as a Next.js Pages Router API route (default export handler).
 *
 * Reads the latest test-grid/api/status.json file from the deployed site's
 * `/test-grid/api/status.json` static asset path. If unavailable, returns an
 * empty status payload so the widget renders "no tests run yet" gracefully.
 */

const EMPTY = {
  updated_at: null,
  total: 0,
  passed: 0,
  failed: 0,
  surfaces: [],
};

// Cloudflare Pages Function entry
export async function onRequestGet({ request, env, next }) {
  try {
    const url = new URL(request.url);
    const assetUrl = new URL('/test-grid/api/status.json', url.origin);
    const assetRes = await fetch(assetUrl.toString(), { cf: { cacheTtl: 30 } });
    if (assetRes.ok) {
      const body = await assetRes.text();
      return new Response(body, {
        headers: {
          'content-type': 'application/json',
          'cache-control': 'public, max-age=30',
          'access-control-allow-origin': '*',
        },
      });
    }
  } catch (_) {}
  return new Response(JSON.stringify(EMPTY), {
    headers: { 'content-type': 'application/json' },
  });
}

// Next.js Pages Router API route default export
export default async function handler(req, res) {
  res.setHeader('content-type', 'application/json');
  res.setHeader('cache-control', 'public, max-age=30');
  res.setHeader('access-control-allow-origin', '*');
  try {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const filePath = path.resolve(process.cwd(), 'public/test-grid/api/status.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return res.status(200).send(data);
    }
  } catch (_) {}
  return res.status(200).send(JSON.stringify(EMPTY));
}

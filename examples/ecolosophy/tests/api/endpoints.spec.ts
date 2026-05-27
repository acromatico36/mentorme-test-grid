import { test, expect } from '@playwright/test';

// Probe each endpoint with a method it claims to support.
const ENDPOINTS: { route: string; methods: string[]; auth: boolean; readsBody: boolean }[] = [
  {
    "route": "/api/chat",
    "methods": [
      "POST"
    ],
    "auth": false,
    "readsBody": true
  },
  {
    "route": "/api/checkout",
    "methods": [
      "POST"
    ],
    "auth": false,
    "readsBody": true
  },
  {
    "route": "/api/cron/seo-refresh",
    "methods": [
      "GET",
      "POST"
    ],
    "auth": true,
    "readsBody": false
  },
  {
    "route": "/api/dashboard/cloudflare",
    "methods": [
      "GET"
    ],
    "auth": false,
    "readsBody": false
  },
  {
    "route": "/api/dashboard/detox",
    "methods": [
      "GET"
    ],
    "auth": false,
    "readsBody": false
  },
  {
    "route": "/api/dashboard/pagespeed",
    "methods": [
      "GET"
    ],
    "auth": false,
    "readsBody": false
  },
  {
    "route": "/api/dashboard/resend",
    "methods": [
      "GET"
    ],
    "auth": false,
    "readsBody": false
  },
  {
    "route": "/api/dashboard/stripe",
    "methods": [
      "GET"
    ],
    "auth": false,
    "readsBody": false
  },
  {
    "route": "/api/healthcheck",
    "methods": [
      "GET"
    ],
    "auth": false,
    "readsBody": false
  },
  {
    "route": "/api/integrations/health",
    "methods": [
      "GET"
    ],
    "auth": false,
    "readsBody": false
  },
  {
    "route": "/api/integrations/test",
    "methods": [
      "POST"
    ],
    "auth": false,
    "readsBody": true
  },
  {
    "route": "/api/newsletter",
    "methods": [
      "POST"
    ],
    "auth": false,
    "readsBody": true
  },
  {
    "route": "/api/seo/ai-citation-check",
    "methods": [
      "GET"
    ],
    "auth": false,
    "readsBody": false
  },
  {
    "route": "/api/seo/backlinks",
    "methods": [
      "GET"
    ],
    "auth": false,
    "readsBody": false
  },
  {
    "route": "/api/seo/competitors",
    "methods": [
      "GET",
      "POST"
    ],
    "auth": false,
    "readsBody": true
  },
  {
    "route": "/api/seo/content-inventory",
    "methods": [
      "GET"
    ],
    "auth": false,
    "readsBody": false
  },
  {
    "route": "/api/seo/gsc",
    "methods": [
      "GET"
    ],
    "auth": false,
    "readsBody": false
  },
  {
    "route": "/api/seo/integrations",
    "methods": [
      "GET",
      "POST"
    ],
    "auth": false,
    "readsBody": true
  },
  {
    "route": "/api/seo/keywords",
    "methods": [
      "GET",
      "POST"
    ],
    "auth": false,
    "readsBody": true
  },
  {
    "route": "/api/seo/llms-txt",
    "methods": [
      "GET"
    ],
    "auth": false,
    "readsBody": false
  },
  {
    "route": "/api/seo/rankings",
    "methods": [
      "GET",
      "POST"
    ],
    "auth": false,
    "readsBody": false
  },
  {
    "route": "/api/seo/schema-check",
    "methods": [
      "GET"
    ],
    "auth": false,
    "readsBody": false
  },
  {
    "route": "/api/seo/trends",
    "methods": [
      "GET"
    ],
    "auth": false,
    "readsBody": false
  },
  {
    "route": "/api/support",
    "methods": [
      "GET",
      "POST"
    ],
    "auth": false,
    "readsBody": true
  },
  {
    "route": "/api/team",
    "methods": [
      "GET",
      "POST"
    ],
    "auth": true,
    "readsBody": true
  },
  {
    "route": "/api/test-relay",
    "methods": [
      "GET",
      "POST"
    ],
    "auth": false,
    "readsBody": false
  },
  {
    "route": "/api/webhooks/shipmonk",
    "methods": [
      "POST"
    ],
    "auth": false,
    "readsBody": true
  },
  {
    "route": "/api/webhooks/stripe",
    "methods": [
      "POST"
    ],
    "auth": false,
    "readsBody": true
  },
  {
    "route": "/api/zerotouch/start",
    "methods": [
      "POST"
    ],
    "auth": false,
    "readsBody": true
  },
  {
    "route": "/api/zerotouch/status",
    "methods": [
      "GET"
    ],
    "auth": false,
    "readsBody": false
  },
  {
    "route": "/_scheduled",
    "methods": [
      "ALL"
    ],
    "auth": false,
    "readsBody": false
  }
];

for (const ep of ENDPOINTS) {
  for (const m of ep.methods) {
    test(`api: ${m} ${ep.route} responds (auth=${ep.auth})`, async ({ request }) => {
      const method = m === 'ALL' ? 'GET' : m;
      const opts: any = { headers: { 'content-type': 'application/json' } };
      if (['POST', 'PUT', 'PATCH'].includes(method) && ep.readsBody) opts.data = {};
      const resp = await request.fetch(ep.route, { method, ...opts });
      // Acceptable: 2xx, 3xx, 4xx (auth/validation), but NEVER 5xx
      expect(resp.status(), `5xx from ${method} ${ep.route}`).toBeLessThan(500);
    });
  }
}

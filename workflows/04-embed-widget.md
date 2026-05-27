# 04 — Embed the Trust Grid Widget

Goal: drop a live, auto-refreshing system-status widget into any dashboard page.

## Option A — iframe (simplest, works everywhere)

In any HTML/Astro/Next page:

```html
<iframe
  src="/test-grid/widget.html"
  style="border:0;width:100%;height:240px"
  title="System status">
</iframe>
```

The widget polls `/test-grid/api/status.json` every 60 seconds and renders a color-coded grid of test surfaces.

## Option B — script tag (no iframe)

```html
<div id="trust-grid"
     data-status-url="/test-grid/api/status.json"
     data-poll="60000"></div>
<link rel="stylesheet" href="/test-grid/widget.css" />
<script src="/test-grid/widget.js"></script>
```

## Option C — copy into a dashboard card

For Italo's Astro admin dashboards (e.g. Ecolosophy `/admin`):

```astro
---
// src/pages/admin/index.astro
---
<div class="card">
  <h3>System Status</h3>
  <iframe src="/test-grid/widget.html" style="border:0;width:100%;height:240px"></iframe>
</div>
```

## Public-facing trust signal

For customer-facing pages (footers, pricing pages, status pages), use the same iframe. Customers see a green "47/47 passing · 14 min ago" — converts skeptics into buyers.

## Status endpoint

- **Astro / Cloudflare Pages**: `functions/test-grid/api/status.js` (auto-installed)
- **Next.js**: `pages/api/test-grid/status.js` (auto-installed)
- **Static sites**: the widget polls `public/test-grid/api/status.json` directly

The endpoint just proxies the latest `status.json` written by `run-grid.mjs`.

## Customize colors

Edit `public/test-grid/widget.css`. CSS variables at the top:

```css
:root {
  --tg-pass: #1f8a4c;
  --tg-fail: #b32424;
  --tg-bg: #faf7f2;  /* match your brand */
}
```

For Ecolosophy: terracotta `--tg-pass: #2f5e3b` or clay `#c45a2f`.

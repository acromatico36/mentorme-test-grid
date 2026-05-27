# 01 — Discover

Goal: walk a project and produce `discovered-surface.json` listing every testable surface.

## Run

```bash
cd /path/to/project
node /Users/italo/.claude/skills/mentorme-test-grid/scripts/discover.mjs
# or, after install: node scripts/discover.mjs
```

## What it finds

| Surface | Astro | Next |
|---|---|---|
| Pages | `src/pages/**/*.astro` (skips `[dynamic]`) | `pages/**/*.{tsx,jsx,ts,js}` + `app/**/page.*` |
| APIs | `src/pages/api/**/*.ts`, `functions/**/*.{ts,js}` | `pages/api/**`, `app/api/**` |
| Auth-gated | `/admin/*`, `/account/*`, files referencing `requiresAuth`/`getServerSession` | same |

## Output schema

```json
{
  "version": 1,
  "project_type": "astro",
  "base_url": "http://localhost:4321",
  "generated_at": "2026-05-27T...",
  "surfaces": [
    {
      "id": "page:/cart",
      "type": "page",
      "path": "/cart",
      "bucket": "payment",
      "requires_auth": false,
      "source_file": "src/pages/cart.astro"
    },
    {
      "id": "api:/api/checkout",
      "type": "api",
      "path": "/api/checkout",
      "method": "POST",
      "bucket": "api",
      "source_file": "src/pages/api/checkout.ts"
    }
  ]
}
```

## Tips

- Set `TEST_GRID_BASE_URL=https://staging.example.com` before running to point tests at a remote env.
- Dynamic routes (`[slug].astro`) are skipped to avoid 404 noise. Add real sample paths manually if you want them tested.
- Re-run anytime — discover is idempotent.

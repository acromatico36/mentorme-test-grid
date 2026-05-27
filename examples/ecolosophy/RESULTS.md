# Ecolosophy — Test Grid Example (real run)

Generated 2026-05-27 on `/Users/italo/ecolosophy-store` (Astro 4.16 SSR + Cloudflare Pages).

## Surface inventory (`discovered-surface.json`)

| Surface | Count |
|---|---|
| Pages | 33 |
| API endpoints | 44 |
| Forms | 2 |
| Internal links | 59 |
| Buttons | 66 |
| Tracker pixels | 13 |
| Components | 29 |
| Lib files | 6 |
| Layouts | 2 |

## Generated Playwright specs

| Suite | Tests |
|---|---|
| `tests/smoke/public-pages.spec.ts` | 12 |
| `tests/smoke/auth-gated-pages.spec.ts` | 18 |
| `tests/api/endpoints.spec.ts` | 32 |
| `tests/forms/forms.spec.ts` | 2 |
| `tests/nav/nav-and-links.spec.ts` | 22 |
| `tests/admin/auth-gates.spec.ts` | 19 |
| `tests/critical-path/*.spec.ts` | 6 |
| `tests/trackers/pixels-load.spec.ts` | 7 |
| `tests/visual/screenshots.spec.ts` | 7 |
| **Total** | **139** |

## Run results (`playwright-report.json`)

- Passed: **105**
- Failed: **34**
- Duration: 83.6s
- Workers: 4

### Failure breakdown

- `admin/auth-gates.spec.ts` — **18 fails**: every `/admin/*` route serves HTTP 200 to unauthenticated requests in dev. (Auth runs only when `CLERK_SECRET_KEY` is set — `src/middleware.ts`.)
- `nav/nav-and-links.spec.ts` — **5 fails**: `/account/sign-in`, `/account/sign-up`, `/api/admin/pipeline-add`, `/collections/concentrates`, `/the-cleaning-playbook.pdf` all return 404.
- `forms/forms.spec.ts` — **2 fails**: `/admin/seo` form structure mismatched (admin gate is the upstream cause).
- `api/endpoints.spec.ts` — **1 fail**: `GET /api/seo/competitors` returns 5xx.
- `smoke/public-pages.spec.ts` — **1 fail**: `/` (index) logs console errors.
- `visual/screenshots.spec.ts` — **7 fails**: first run, no baselines on disk yet. (Expected — re-run with `--update-snapshots` once site state is final.)

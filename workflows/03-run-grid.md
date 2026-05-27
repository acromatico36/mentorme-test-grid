# 03 — Run the Grid

Goal: execute the full Playwright suite and produce `test-grid/api/status.json` for the widget to poll.

## Local

```bash
# First-time setup
npm install
npx playwright install --with-deps chromium

# Run
node scripts/run-grid.mjs
```

## What gets produced

- `test-grid/playwright-report.json` — raw Playwright JSON report
- `test-grid/playwright-html/` — full HTML report (drag-drop the `index.html` to view)
- `test-grid/api/status.json` — what the widget polls
- `public/test-grid/api/status.json` — what the deployed site serves

## status.json shape

```json
{
  "updated_at": "2026-05-27T14:33:12.000Z",
  "total": 47,
  "passed": 47,
  "failed": 0,
  "surfaces": [
    { "name": "smoke",    "bucket": "smoke",    "total": 28, "passed": 28, "failed": 0 },
    { "name": "api",      "bucket": "api",      "total": 6,  "passed": 6,  "failed": 0 },
    { "name": "critical", "bucket": "critical", "total": 9,  "passed": 9,  "failed": 0 },
    { "name": "visual",   "bucket": "visual",   "total": 4,  "passed": 4,  "failed": 0 }
  ]
}
```

## Running a single bucket

```bash
npx playwright test --grep @critical
npx playwright test --grep @api
npx playwright test --grep "@admin|@auth"
```

## Pointing at a deployed env

```bash
TEST_GRID_BASE_URL=https://www.ecolosophy.com node scripts/run-grid.mjs
```

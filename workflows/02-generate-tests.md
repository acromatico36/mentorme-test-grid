# 02 — Generate Tests

Goal: turn `discovered-surface.json` into real, runnable Playwright spec files.

## Run

```bash
node scripts/generate-tests.mjs
```

## What it writes

| File | Tag(s) | Purpose |
|---|---|---|
| `tests/smoke.spec.ts` | `@smoke @public/@admin/@auth` | Every page returns < 400, no console errors |
| `tests/api-health.spec.ts` | `@api` | Every GET endpoint returns < 500 |
| `tests/critical-path.spec.ts` | `@critical @payment` | Newsletter signup, add-to-cart, Stripe checkout (test mode) |
| `tests/visual.spec.ts` | `@visual` | Screenshot regression on top 5 public pages |
| `playwright.config.ts` | — | Headless chromium, JSON reporter, retries on CI |

## How specs read the surface

Each spec imports `discovered-surface.json` at runtime and loops over relevant surfaces. This means re-running `discover.mjs` automatically expands test coverage as your project grows — without editing specs.

## Customizing

- Tests are written as `*.spec.ts`, not `*.tmpl`. You own them.
- The generator NEVER overwrites a hand-edited spec (idempotent).
- To regenerate from scratch: `rm tests/*.spec.ts && node scripts/generate-tests.mjs`.

## Safety defaults

- Stripe payment specs skip unless `STRIPE_TEST_MODE=1`
- Destructive admin specs skip unless `RUN_DESTRUCTIVE=1`
- No real credentials in specs — all secrets come from env

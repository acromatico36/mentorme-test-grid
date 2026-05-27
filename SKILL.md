---
name: mentorme-test-grid
description: Universal testing system that auto-discovers features in any web project (Astro, Next.js, plain HTML, Cloudflare Pages, Vercel), generates Playwright test specs, runs them in parallel via multi-agent fanout, and renders an embeddable Trust Grid widget for any dashboard. Use when the user says "test this site", "is my site broken", "QA my project", "set up testing", "check if it works", "build a test grid", "trust the UI", "i can't trust the ui", "make sure my product works", "add testing to this dashboard", "wire tests for X", or mentions Playwright, smoke tests, E2E tests, visual regression, test coverage, status badge, uptime check, or trust signal. Works across all of Italo's brands (Acromatico, Ecolosophy, MentorMe, OceanFL, TravelDRD, MidPay) and any new project.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, ToolSearch
---

# mentorme-test-grid

> "If I can't trust the UI, why would my customers trust anything else?" — Italo Campilii

This skill solves the "I shipped it but I don't know if it actually works" problem. It auto-discovers every testable surface in a project, generates real Playwright tests, runs them in parallel via multiple agents, and gives you a green badge you can embed in any dashboard (or show customers as a trust signal).

## When to invoke this skill

Trigger phrases:
- "test this site" / "QA my X" / "build a test grid for"
- "is my site broken" / "make sure it works"
- "I can't trust the UI"
- "set up testing for [project]"
- "add a status widget"
- "wire Playwright into [project]"

## The 6-step workflow

1. **Discover** — `scripts/discover.mjs` walks the project, identifies routes, API endpoints, forms, CTAs, payment flows → writes `discovered-surface.json`.
2. **Generate** — `scripts/generate-tests.mjs` reads the surface JSON and emits Playwright specs from the templates in `templates/`.
3. **Fanout** — `workflows/05-multi-agent-fanout.md` dispatches one sub-agent per surface (auth, payments, admin, customer, API). Each runs in parallel.
4. **Run** — `scripts/run-grid.mjs` executes `npx playwright test` and writes `test-grid/api/status.json`.
5. **Embed** — `scripts/embed-widget.mjs` drops `templates/widget/*` into any dashboard. Polls status every 60s.
6. **CI** — `templates/github-actions.yml` runs the grid on every push + nightly cron.

## Quick install for any project

```bash
cd /path/to/project
curl -fsSL https://raw.githubusercontent.com/acromatico36/mentorme-test-grid/main/install.sh | bash
```

The installer is idempotent. It auto-detects project type (Astro / Next / plain HTML / CF Pages / Vercel) and drops in:
- `tests/` — generated Playwright specs
- `playwright.config.ts` — preconfigured
- `.github/workflows/test-grid.yml` — CI workflow
- `public/test-grid/widget.{html,css,js}` — drop-in widget
- `functions/test-grid/api/status.ts` — Cloudflare Function that serves status JSON (or `pages/api/test-grid/status.ts` for Next.js)

## Files in this skill

- **SKILL.md** — this entrypoint
- **README.md** — repo README (Italo voice)
- **install.sh** — one-line installer
- **package.json** — Playwright + utility deps
- **workflows/** — six step-by-step playbooks
- **templates/** — Playwright specs, widget, GitHub Actions, CF Function
- **scripts/** — discover / generate / run / embed / fanout
- **examples/ecolosophy/** — complete working proof-of-concept
- **references/** — test-pattern catalog, trust-signal UX, failure-mode playbook

## Multi-agent fanout (the killer feature)

See `workflows/05-multi-agent-fanout.md`. Pattern: dispatch N background sub-agents, one per surface bucket, each running its slice of `npx playwright test --grep`. Then merge results into a single status JSON. This collapses a 12-minute serial test run into 2-3 minutes.

## Safety rules baked into templates

- No tests authorize real payment — Stripe test-mode flag enforced; payment specs skip in CI unless `STRIPE_TEST_MODE=1`
- No tests delete production data — read-only by default; mutating specs are tagged `@destructive` and skipped unless `RUN_DESTRUCTIVE=1`
- No credentials hardcoded — all secrets via env vars
- No headed-only browser deps — runs cleanly on CI

## What to do next

If the user wants to test a specific project, follow the workflows in order. If they want to embed the widget into an existing dashboard, jump straight to `workflows/04-embed-widget.md`.

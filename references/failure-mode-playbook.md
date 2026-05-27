# Failure Mode Playbook

When a test fails, what does it mean and what do you do?

## 1. Smoke test fails (page returns 500/404)

**Likely cause**: route was deleted/renamed, build broke, env var missing.

**First check**:
```bash
curl -I https://yoursite.com/path-that-failed
```

If 404 → route is genuinely gone. Update `discovered-surface.json` or restore the route.

If 500 → check server logs:
```bash
wrangler tail   # Cloudflare Pages
vercel logs     # Vercel
```

## 2. Smoke test fails (console error)

**Likely cause**: JS bundle broke, undefined global, third-party script 404'd.

**First check**: open the HTML report:
```bash
open test-grid/playwright-html/index.html
```

Click the failed test → see the actual console message + screenshot.

Common fixes:
- Missing env var on client (Astro: `PUBLIC_*` prefix)
- Stale CDN cache (purge `?v=` or revisioned asset)
- Removed dependency still referenced

## 3. API health probe fails (5xx)

**Likely cause**: server crashed, DB down, env var missing, rate limit.

**First check**: hit the endpoint directly:
```bash
curl -i https://yoursite.com/api/endpoint
```

For Cloudflare Pages Functions:
```bash
wrangler tail --format=pretty
```

## 4. Critical-path E2E fails (selector not found)

**Likely cause**: UI changed (button text, class, structure).

**First check**: trace viewer:
```bash
npx playwright show-trace test-grid/playwright-html/data/<trace-id>.zip
```

Fix: update the selector in the spec. Prefer `[data-testid="..."]` over text for resilience.

## 5. Visual regression fails

**Likely cause**: intentional UI change OR unintentional CSS regression.

**First check**: look at the diff image in the HTML report. Side-by-side baseline vs current.

If intentional:
```bash
npx playwright test --update-snapshots
git add tests/__snapshots__/
git commit -m "test: update visual baselines"
```

If unintentional: fix the CSS bug, don't update the baseline.

## 6. Tests flake (pass sometimes, fail other times)

**Likely cause**: race condition in test, animation not waited, async side effect.

**Fixes** (in order):
1. Use `await expect(locator).toBeVisible()` (auto-retrying) instead of `await page.waitForTimeout(N)`
2. `await page.waitForLoadState('networkidle')` before assertions
3. Disable animations in Playwright config: `animations: 'disabled'`
4. Increase test timeout if action is genuinely slow

## 7. CI passes, local fails

**Likely cause**: different env, different browser version.

**Fix**:
```bash
npx playwright install --with-deps chromium   # match CI
```

## 8. Entire grid times out

**Likely cause**: serial run on a large project.

**Fix**: enable fanout. See `workflows/05-multi-agent-fanout.md`.

## When in doubt

Run a single spec with full debug:

```bash
PWDEBUG=1 npx playwright test tests/critical-path.spec.ts --grep "newsletter"
```

This opens the Playwright Inspector — step through the test, see live DOM, identify the exact failure point.

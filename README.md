# mentorme-test-grid

**They told us "ship fast" meant ship broken. They lied.**

You spent six weeks building the dashboard. Customers open it. Half the buttons don't do what they're supposed to. The booking form submits to nowhere. A payment flow silently 500s. You don't find out until someone tweets at you.

If you can't trust your own UI, why would your customers trust anything else they're paying you for?

This is the testing system I built because I needed it. One repo. Drop into any project. Auto-discovers every page, every API, every button worth testing. Generates real Playwright tests. Runs them in parallel via multiple AI sub-agents. Gives you a green badge you can embed in any dashboard — or show customers, as a trust signal that converts.

Free. Open source. MIT.

---

## Install

```bash
cd /path/to/your/project
curl -fsSL https://raw.githubusercontent.com/acromatico36/mentorme-test-grid/main/install.sh | bash
```

The installer is idempotent. Safe to re-run. It auto-detects:

- Astro projects (drops Cloudflare Function at `functions/test-grid/api/status.ts`)
- Next.js projects (drops API route at `pages/api/test-grid/status.ts`)
- Plain HTML / static sites (drops a JSON file polled by the widget)
- Vercel projects (adds the right config)
- Cloudflare Pages projects (adds wrangler binding hint)

## What it builds

```
your-project/
├── tests/
│   ├── smoke.spec.ts          # every page loads 200
│   ├── api-health.spec.ts     # every /api/* responds
│   ├── critical-path.spec.ts  # booking → checkout → signup E2E
│   └── visual.spec.ts         # screenshot regression
├── playwright.config.ts
├── public/test-grid/
│   ├── widget.html            # drop-in iframe
│   ├── widget.css
│   └── widget.js
├── .github/workflows/test-grid.yml
└── test-grid/api/status.json  # what the widget polls
```

## Embed the Trust Grid widget

In any dashboard page (Astro, Next, plain HTML — doesn't matter):

```html
<iframe
  src="/test-grid/widget.html"
  style="border:0;width:100%;height:240px"
  title="System status">
</iframe>
```

That's it. Renders a real-time grid: green tile per passing surface, red tile if anything broke, last-checked timestamp. Auto-refreshes every 60 seconds.

## Multi-agent parallel runs

The included Claude skill (`SKILL.md`) ships with a multi-agent fanout pattern. One sub-agent per surface bucket (auth, payments, admin, customer flows, API). Runs in parallel via Claude's Agent tool with `run_in_background: true`. Collapses a 12-minute serial test run into 2-3 minutes. Pattern is in `workflows/05-multi-agent-fanout.md`.

## CI

```yaml
# .github/workflows/test-grid.yml
on:
  push:
  schedule:
    - cron: '0 6 * * *'   # 6am UTC nightly
```

Failures auto-comment on the PR. Configure Slack webhook in repo secrets and it'll notify there too.

## Brands using this

- Ecolosophy Store (admin dashboard + checkout)
- MentorMe (auth + booking)
- OceanFL (lead capture)
- TravelDRD (check-in flow — wired post mid-deploy)
- Acromatico (album builder)
- MidPay (payment infra)

## Built by

Italo Campilii, founder. Built because I needed it. Open-sourced because you do too.

If you ship anything that customers depend on, you owe them this. And you owe yourself the sleep.

## License

MIT. Do whatever.

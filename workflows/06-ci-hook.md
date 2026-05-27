# 06 — CI Hook

Goal: run the grid on every push + nightly cron, with PR comments on failure.

## Install

The installer drops `.github/workflows/test-grid.yml` automatically. To install manually:

```bash
mkdir -p .github/workflows
cp /Users/italo/.claude/skills/mentorme-test-grid/templates/github-actions.yml .github/workflows/test-grid.yml
git add .github/workflows/test-grid.yml
git commit -m "ci: add test-grid"
```

## Triggers

```yaml
on:
  push:          # every commit to main/master
  pull_request:  # every PR
  schedule:
    - cron: '0 6 * * *'  # 06:00 UTC nightly
  workflow_dispatch:     # manual
```

## What CI does

1. Checkout
2. Install deps (`npm ci || npm install`)
3. Install Playwright browsers (`chromium` only — fast)
4. Build (if `npm run build` exists)
5. Run `npx playwright test`
6. Generate `public/test-grid/api/status.json`
7. Upload Playwright HTML report as artifact
8. On PR with failures: auto-comment on the PR

## Secrets / vars

Set in GitHub repo settings:

| Setting | Required | Default | Purpose |
|---|---|---|---|
| `vars.TEST_GRID_BASE_URL` | optional | `http://localhost:4321` | Point at a staging URL |
| `secrets.SLACK_WEBHOOK_URL` | optional | — | Slack alerts on failure |
| `secrets.STRIPE_TEST_MODE` | optional | `0` | Set `1` to run payment specs |

## Slack notifications

To add Slack alerts on failure, append this step to the workflow:

```yaml
- name: Slack alert on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {"text":"Test grid failed on ${{ github.repository }}: ${{ github.event.head_commit.message }}"}
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Status badge in your README

After the first CI run, add to your repo README:

```markdown
![test-grid](https://github.com/USER/REPO/actions/workflows/test-grid.yml/badge.svg)
```

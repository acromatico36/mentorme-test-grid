# 05 — Multi-Agent Fanout

> "I need a testing system that can test every single functionality of every single platform... multiple agents can get on it." — Italo

Goal: split the test grid into per-bucket shards and run them in parallel using Claude's Agent tool with `run_in_background: true`. Collapses a 12-min serial run into 2-3 min.

## The pattern (Claude-driven)

When the user says "run the test grid", an orchestrating agent dispatches N sub-agents — one per surface bucket — each running its slice of `npx playwright test --grep`. Results merge into one `status.json`.

### Step 1 — Orchestrator reads `discovered-surface.json`

Identifies buckets (`auth`, `admin`, `payment`, `api`, `public`, `critical`, `visual`).

### Step 2 — Orchestrator dispatches one sub-agent per bucket

Each sub-agent is invoked via the Anthropic Agent tool with:

```json
{
  "name": "Agent",
  "input": {
    "description": "Run test-grid bucket: @auth",
    "subagent_type": "general-purpose",
    "run_in_background": true,
    "prompt": "You are a sub-agent of mentorme-test-grid. Your task: run only the @auth bucket of the Playwright test suite for project at /Users/italo/ecolosophy-store. Execute exactly this command and report the JSON result file path:\n\ncd /Users/italo/ecolosophy-store && PLAYWRIGHT_JSON_OUTPUT_NAME=test-grid/shard-auth.json npx playwright test --grep @auth --reporter=json > /dev/null 2>&1; echo \"exit=$?\"; ls -la test-grid/shard-auth.json\n\nDo not interpret results. Do not modify any code. Just run, capture the JSON, and return the path."
  }
}
```

Dispatch 6–8 of these in parallel (one Agent tool call per bucket, all in the same assistant turn, each with `run_in_background: true`).

### Step 3 — Orchestrator waits for all sub-agents

Uses the Monitor tool with an `until` loop:

```bash
until [ "$(ls test-grid/shard-*.json 2>/dev/null | wc -l)" -ge 6 ]; do sleep 5; done
```

### Step 4 — Orchestrator merges shards

```bash
node scripts/run-grid.mjs   # also accepts pre-existing shard-*.json files
```

Or merge directly:

```bash
node -e "
  const fs=require('fs'); const path=require('path');
  const shards=fs.readdirSync('test-grid').filter(f=>f.startsWith('shard-')&&f.endsWith('.json'));
  const buckets={}; let total=0,passed=0,failed=0;
  for(const s of shards){
    const r=JSON.parse(fs.readFileSync(path.join('test-grid',s),'utf8'));
    for(const suite of (r.suites||[])){
      for(const spec of (suite.specs||[])){
        for(const t of (spec.tests||[])){
          total++; const ok=(t.results||[]).every(x=>x.status==='passed');
          if(ok)passed++; else failed++;
          const tag=(spec.title.match(/@(\w+)/)||[])[1]||'other';
          buckets[tag]=buckets[tag]||{name:tag,bucket:tag,total:0,passed:0,failed:0};
          buckets[tag].total++; if(ok)buckets[tag].passed++; else buckets[tag].failed++;
        }
      }
    }
  }
  const p={updated_at:new Date().toISOString(),total,passed,failed,surfaces:Object.values(buckets)};
  fs.mkdirSync('public/test-grid/api',{recursive:true});
  fs.writeFileSync('public/test-grid/api/status.json',JSON.stringify(p,null,2));
  console.log(JSON.stringify(p,null,2));
"
```

### Step 5 — Orchestrator returns summary

Reports total pass/fail and points the user at the widget URL.

## Why this matters

Serial test runs take 8-12 minutes on a real project. Parallel fanout brings that to 2-3 minutes. For Italo's daily workflow where he ships 5-10 times a day across 6 brands, that's the difference between "ship and pray" and "ship with confidence."

## CLI alternative

If you're not in an agent loop, `scripts/fanout.mjs` does the same thing via Node `spawn`:

```bash
node scripts/fanout.mjs --workers=6
```

## Safety rules for sub-agents

Each sub-agent prompt MUST include:

1. **Scope clamp**: "Do not modify any code"
2. **No interpretation**: "Just run, capture the JSON, and return the path"
3. **No credentials**: env vars only, never inline
4. **Bounded**: one bucket per agent, hard timeout via Playwright's `--timeout`

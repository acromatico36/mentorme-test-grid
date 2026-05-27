#!/usr/bin/env bash
# mentorme-test-grid installer
# One-line: curl -fsSL https://raw.githubusercontent.com/acromatico36/mentorme-test-grid/main/install.sh | bash
#
# Idempotent. Safe to re-run.

set -euo pipefail

GRID_VERSION="1.0.0"
RAW_BASE="${MENTORME_TEST_GRID_RAW:-https://raw.githubusercontent.com/acromatico36/mentorme-test-grid/main}"
PROJECT_DIR="${1:-$(pwd)}"

cd "$PROJECT_DIR"

say() { printf "\033[36m[test-grid]\033[0m %s\n" "$*"; }
ok()  { printf "\033[32m[test-grid]\033[0m %s\n" "$*"; }
warn() { printf "\033[33m[test-grid]\033[0m %s\n" "$*"; }

say "Installing mentorme-test-grid v${GRID_VERSION} into ${PROJECT_DIR}"

# 1) Detect project type
PROJECT_TYPE="unknown"
if [ -f "astro.config.mjs" ] || [ -f "astro.config.js" ] || [ -f "astro.config.ts" ]; then
  PROJECT_TYPE="astro"
elif [ -f "next.config.js" ] || [ -f "next.config.mjs" ] || [ -f "next.config.ts" ]; then
  PROJECT_TYPE="next"
elif [ -f "wrangler.toml" ] || [ -f "wrangler.jsonc" ]; then
  PROJECT_TYPE="cloudflare-pages"
elif [ -f "vercel.json" ]; then
  PROJECT_TYPE="vercel"
elif [ -f "index.html" ]; then
  PROJECT_TYPE="static"
fi
ok "Detected project type: ${PROJECT_TYPE}"

# 2) Ensure node + package.json exist
if [ ! -f "package.json" ]; then
  warn "No package.json found; initializing minimal one"
  cat > package.json <<'EOF'
{ "name": "project", "version": "0.0.0", "private": true, "type": "module", "scripts": {} }
EOF
fi

# 3) Create directories
mkdir -p tests test-grid public/test-grid .github/workflows

# 4) Fetch templates (or copy from sibling skill dir when running locally)
fetch() {
  local src="$1"; local dest="$2"
  if [ -f "${SKILL_LOCAL_DIR:-}/$src" ]; then
    cp "${SKILL_LOCAL_DIR}/$src" "$dest"
  else
    curl -fsSL "${RAW_BASE}/$src" -o "$dest"
  fi
}

# Core
[ -f playwright.config.ts ] || fetch "templates/playwright.config.ts" "playwright.config.ts"

# Specs (only if missing — never overwrite hand-edited tests)
[ -f tests/smoke.spec.ts ]         || fetch "templates/smoke.spec.ts.tmpl"         "tests/smoke.spec.ts"
[ -f tests/api-health.spec.ts ]    || fetch "templates/api-health.spec.ts.tmpl"    "tests/api-health.spec.ts"
[ -f tests/critical-path.spec.ts ] || fetch "templates/critical-path.spec.ts.tmpl" "tests/critical-path.spec.ts"
[ -f tests/visual.spec.ts ]        || fetch "templates/visual.spec.ts.tmpl"        "tests/visual.spec.ts"

# Widget
fetch "templates/widget/widget.html" "public/test-grid/widget.html"
fetch "templates/widget/widget.css"  "public/test-grid/widget.css"
fetch "templates/widget/widget.js"   "public/test-grid/widget.js"

# Status endpoint (per project type)
case "$PROJECT_TYPE" in
  astro|cloudflare-pages)
    mkdir -p functions/test-grid/api
    fetch "templates/api-status.template.js" "functions/test-grid/api/status.js"
    ok "Cloudflare Function dropped at functions/test-grid/api/status.js"
    ;;
  next)
    mkdir -p pages/api/test-grid
    fetch "templates/api-status.template.js" "pages/api/test-grid/status.js"
    ok "Next API route dropped at pages/api/test-grid/status.js"
    ;;
  vercel|static|unknown)
    # Fall back to a static JSON the widget can poll
    [ -f public/test-grid/api/status.json ] || {
      mkdir -p public/test-grid/api
      echo '{"updated_at":null,"total":0,"passed":0,"failed":0,"surfaces":[]}' > public/test-grid/api/status.json
    }
    ok "Static status JSON at public/test-grid/api/status.json"
    ;;
esac

# CI workflow
[ -f .github/workflows/test-grid.yml ] || fetch "templates/github-actions.yml" ".github/workflows/test-grid.yml"

# 5) Install Playwright as devDep if not present
if ! grep -q '@playwright/test' package.json 2>/dev/null; then
  say "Adding @playwright/test to package.json (won't run npm install for you)"
  node -e "
    const fs = require('fs');
    const p = JSON.parse(fs.readFileSync('package.json','utf8'));
    p.devDependencies = p.devDependencies || {};
    p.devDependencies['@playwright/test'] = '^1.48.0';
    p.scripts = p.scripts || {};
    p.scripts['test:grid'] = p.scripts['test:grid'] || 'playwright test';
    p.scripts['test:grid:install'] = p.scripts['test:grid:install'] || 'playwright install --with-deps chromium';
    fs.writeFileSync('package.json', JSON.stringify(p, null, 2));
  "
fi

# 6) Write a discovered-surface.json stub if not present
[ -f discovered-surface.json ] || cat > discovered-surface.json <<'EOF'
{
  "version": 1,
  "project_type": "AUTO",
  "base_url": "http://localhost:4321",
  "surfaces": []
}
EOF

ok "Install complete."
echo ""
echo "Next steps:"
echo "  1) npm install"
echo "  2) npm run test:grid:install      # install browsers"
echo "  3) npm run test:grid              # run the grid"
echo "  4) Embed widget: <iframe src=\"/test-grid/widget.html\" style=\"border:0;width:100%;height:240px\"></iframe>"
echo ""
echo "Re-run safely. The installer never overwrites your hand-edited specs."

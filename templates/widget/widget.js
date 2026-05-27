(function () {
  'use strict';
  const root = document.getElementById('trust-grid');
  if (!root) return;
  const statusUrl = root.getAttribute('data-status-url') || '/test-grid/api/status.json';
  const pollMs = parseInt(root.getAttribute('data-poll') || '60000', 10);

  const dot = document.getElementById('tg-dot');
  const label = document.getElementById('tg-label');
  const stamp = document.getElementById('tg-stamp');
  const grid = document.getElementById('tg-grid');

  function fmtAge(iso) {
    if (!iso) return '--';
    const diff = Math.max(0, Date.now() - new Date(iso).getTime());
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return m + ' min ago';
    const h = Math.floor(m / 60);
    if (h < 24) return h + 'h ago';
    return Math.floor(h / 24) + 'd ago';
  }

  function render(data) {
    grid.innerHTML = '';
    const surfaces = (data && data.surfaces) || [];
    const total = data.total || 0;
    const passed = data.passed || 0;
    const failed = data.failed || 0;

    let state = 'pass';
    if (failed > 0) state = 'fail';
    else if (total === 0) state = 'warn';

    dot.className = 'tg-dot ' + state;
    if (state === 'pass') label.textContent = passed + '/' + total + ' tests passing';
    else if (state === 'fail') label.textContent = failed + ' failing · ' + passed + '/' + total + ' passed';
    else label.textContent = 'No tests run yet';

    stamp.textContent = data.updated_at ? 'Last check: ' + fmtAge(data.updated_at) : 'never run';

    if (surfaces.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'tg-tile warn';
      empty.innerHTML = '<div class="tg-tile-name">No surfaces</div><div class="tg-tile-count">run discover</div>';
      grid.appendChild(empty);
      return;
    }
    for (const s of surfaces) {
      const tile = document.createElement('div');
      const tileState = s.failed > 0 ? 'fail' : (s.total === 0 ? 'warn' : 'pass');
      tile.className = 'tg-tile ' + tileState;
      const name = (s.name || s.bucket || 'surface').replace(/[_-]/g, ' ');
      tile.innerHTML =
        '<div class="tg-tile-name">' + name + '</div>' +
        '<div class="tg-tile-count">' + s.passed + '/' + s.total + ' passing</div>';
      grid.appendChild(tile);
    }
  }

  async function poll() {
    try {
      const res = await fetch(statusUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error('status ' + res.status);
      const data = await res.json();
      render(data);
    } catch (err) {
      dot.className = 'tg-dot warn';
      label.textContent = 'Status unavailable';
      stamp.textContent = 'check console';
      console.warn('[trust-grid]', err);
    }
  }

  poll();
  setInterval(poll, pollMs);
})();

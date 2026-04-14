/**
 * panel.js
 * Controls the detail panel: open/close, normal district view, IP folder UI.
 * Depends on: store (data.js), DISTRICTS, IP_SUB_DISTRICTS (districts.js),
 *             renderCharts, clearCharts (charts.js), resetZoom (island.js)
 */

const panelEl   = document.getElementById('detail-panel');
const overlayEl = document.getElementById('panel-overlay');

function openPanel(districtId) {
  const district = DISTRICTS[districtId];
  panelEl.innerHTML = '';

  if (district.isFolder) {
    renderIPPanel(district);
  } else {
    renderDistrictPanel(districtId, district);
  }

  panelEl.classList.add('open');
  overlayEl.classList.add('active');

  overlayEl.addEventListener('click', closePanel, { once: true });
}

function closePanel() {
  panelEl.classList.remove('open');
  overlayEl.classList.remove('active');
  clearCharts();
  resetZoom();
}

// ── Normal district panel ─────────────────────────────────────────────────

function renderDistrictPanel(districtId, district) {
  const data = store.aggregated[districtId];
  const rows = store.byDistrict[districtId] || [];

  panelEl.innerHTML = `
    <div class="panel-header">
      <div class="panel-header-accent" style="background:${district.color};"></div>
      <button class="panel-close" aria-label="Close panel">&times;</button>
      <div class="panel-title">${district.label}</div>
      <div class="panel-desc">${district.description}</div>
    </div>
    ${renderStatsHTML(data.stats, district.color)}
    <div class="panel-body">
      <div class="chart-section">
        <div class="chart-title">Sets released per year</div>
        <div class="chart-container" id="chart-timeline"></div>
      </div>
      <div class="chart-section">
        <div class="chart-title">Piece count distribution</div>
        <div class="chart-container" id="chart-histogram"></div>
      </div>
      <div class="chart-section">
        <div class="chart-title">Average retail price over time</div>
        <div class="chart-container" id="chart-price"></div>
      </div>
      <div class="chart-section">
        <div class="chart-title">Top subthemes</div>
        <div class="chart-container" id="chart-subthemes"></div>
      </div>
      ${renderSetGridHTML(rows, district.color)}
    </div>
  `;

  panelEl.querySelector('.panel-close').addEventListener('click', closePanel);
  requestAnimationFrame(() => renderCharts(data, district.color));
}

// ── IP folder panel ───────────────────────────────────────────────────────

function renderIPPanel(district) {
  const ipCards = Object.entries(IP_SUB_DISTRICTS).map(([id, sub]) => {
    const sets = store.aggregated['ip_' + id];
    const count = sets ? sets.stats.totalSets : 0;
    return `
      <div class="ip-card" data-sub="${id}" role="button" tabindex="0"
           style="border-color: ${sub.color};"
           aria-label="${sub.label}, ${count} sets">
        <div class="ip-card-label">${sub.label}</div>
        <div class="ip-card-count">${count} sets</div>
      </div>
    `;
  }).join('');

  panelEl.innerHTML = `
    <div class="panel-header">
      <div class="panel-header-accent" style="background:${district.color};"></div>
      <button class="panel-close" aria-label="Close panel">&times;</button>
      <div class="panel-title">${district.label}</div>
      <div class="panel-desc">${district.description}</div>
    </div>
    <div class="ip-folder-header">Select a franchise</div>
    <div class="ip-folder">${ipCards}</div>
    <div id="ip-sub-panel"></div>
  `;

  panelEl.querySelector('.panel-close').addEventListener('click', closePanel);

  panelEl.querySelectorAll('.ip-card').forEach(card => {
    const activate = () => {
      const subId = card.dataset.sub;
      selectIPSub(subId, card);
    };
    card.addEventListener('click', activate);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') activate();
    });
  });
}

function selectIPSub(subId, cardEl) {
  // Update card selection state
  panelEl.querySelectorAll('.ip-card').forEach(c => {
    c.classList.remove('selected');
    c.style.background   = '';
    c.style.color        = '';
    c.style.borderColor  = IP_SUB_DISTRICTS[c.dataset.sub].color;
  });
  const sub = IP_SUB_DISTRICTS[subId];
  cardEl.classList.add('selected');
  cardEl.style.background  = sub.color;
  cardEl.style.color       = '#ffffff';
  cardEl.style.borderColor = sub.color;

  // Render charts in the sub-panel
  const data       = store.aggregated['ip_' + subId];
  const rows       = store.byIPSub[subId] || [];
  const subPanelEl = document.getElementById('ip-sub-panel');

  subPanelEl.innerHTML = `
    <div class="panel-body">
      <div class="chart-section">
        <div class="chart-title">Sets released per year</div>
        <div class="chart-container" id="chart-timeline"></div>
      </div>
      <div class="chart-section">
        <div class="chart-title">Piece count distribution</div>
        <div class="chart-container" id="chart-histogram"></div>
      </div>
      <div class="chart-section">
        <div class="chart-title">Average retail price over time</div>
        <div class="chart-container" id="chart-price"></div>
      </div>
      <div class="chart-section">
        <div class="chart-title">Top subthemes</div>
        <div class="chart-container" id="chart-subthemes"></div>
      </div>
      ${renderSetGridHTML(rows, sub.color)}
    </div>
  `;

  // Insert stats above charts
  subPanelEl.insertAdjacentHTML('afterbegin', renderStatsHTML(data.stats, sub.color));

  clearCharts();
  requestAnimationFrame(() => renderCharts(data, sub.color));
}

// ── Set card grid ──────────────────────────────────────────────────────────

function renderSetGridHTML(rows, color) {
  // Pick up to 24 sets that have an image URL, sorted by piece count descending
  const featured = rows
    .filter(r => r.imageURL && r.imageURL.trim())
    .sort((a, b) => (+b.pieces || 0) - (+a.pieces || 0))
    .slice(0, 24);

  if (!featured.length) return '';

  const cards = featured.map(r => {
    const pieces = r.pieces ? `${r.pieces} pcs` : null;
    const price  = r.US_retailPrice ? `$${(+r.US_retailPrice).toFixed(2)}` : null;
    const year   = r.year || null;

    const meta = [pieces, price, year].filter(Boolean).join(' &middot; ');

    // Escape set name for HTML attribute
    const safeName = (r.name || '').replace(/"/g, '&quot;');

    return `
      <div class="set-card" tabindex="0" role="article" aria-label="${safeName}">
        <div class="set-card-img-wrap">
          <img
            class="set-card-img"
            src="${r.imageURL}"
            alt="${safeName}"
            loading="lazy"
            decoding="async"
            onerror="this.closest('.set-card-img-wrap').classList.add('img-error')"
          >
          <div class="set-card-img-fallback" aria-hidden="true"></div>
        </div>
        <div class="set-card-body">
          <div class="set-card-name">${r.name || 'Unnamed Set'}</div>
          <div class="set-card-meta" style="color:${color}">${meta}</div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="chart-section set-grid-section">
      <div class="chart-title">Featured sets</div>
      <div class="set-grid">${cards}</div>
    </div>
  `;
}

// ── Stats row HTML ─────────────────────────────────────────────────────────

function renderStatsHTML(stats, color) {
  const fmt    = v => (v == null ? 'N/A' : v);
  const fmtUSD = v => (v == null ? 'N/A' : '$' + v.toFixed(2));

  const years = (stats.yearMin != null && stats.yearMax != null)
    ? `${stats.yearMin}\u2013${stats.yearMax}`
    : 'N/A';

  const priceRange = (stats.priceMin != null && stats.priceMax != null)
    ? `$${stats.priceMin.toFixed(0)}\u2013$${stats.priceMax.toFixed(0)}`
    : 'N/A';

  return `
    <div class="stats-row">
      <div class="stat-item">
        <span class="stat-label">Total sets</span>
        <span class="stat-value" style="color:${color}">${fmt(stats.totalSets)}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Years active</span>
        <span class="stat-value">${years}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Avg pieces</span>
        <span class="stat-value">${fmt(stats.avgPieces)}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Price range</span>
        <span class="stat-value">${priceRange}</span>
      </div>
    </div>
  `;
}

/**
 * charts.js
 * All four D3 v7 chart components.
 * Exports: renderCharts(aggData, color), clearCharts()
 */

const CHART_IDS = ['chart-timeline', 'chart-histogram', 'chart-price', 'chart-subthemes'];
const tooltip   = document.getElementById('chart-tooltip');

function renderCharts(data, color) {
  clearCharts();
  // Stagger slightly so animations look good
  renderTimeline(data, color);
  setTimeout(() => renderHistogram(data, color),  80);
  setTimeout(() => renderPriceTrend(data, color), 160);
  setTimeout(() => renderSubthemes(data, color),  240);
}

function clearCharts() {
  CHART_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const svg = el.querySelector('svg');
      if (svg) svg.remove();
      const notice = el.querySelector('.chart-notice');
      if (notice) notice.remove();
    }
  });
}

// ── Shared helpers ────────────────────────────────────────────────────────

function getWidth(containerId) {
  const el = document.getElementById(containerId);
  return el ? el.offsetWidth - 4 : 370;
}

function showTooltip(html, event) {
  tooltip.innerHTML = html;
  tooltip.style.opacity = '1';
  moveTooltip(event);
}

function moveTooltip(event) {
  const tx = Math.min(event.clientX + 14, window.innerWidth - 180);
  const ty = Math.max(event.clientY - 32, 8);
  tooltip.style.left = tx + 'px';
  tooltip.style.top  = ty + 'px';
}

function hideTooltip() {
  tooltip.style.opacity = '0';
}

// ── 1. Timeline: sets released per year ──────────────────────────────────

function renderTimeline(data, color) {
  const containerId = 'chart-timeline';
  const el = document.getElementById(containerId);
  if (!el || !data.timeline.length) return;

  const margin = { top: 12, right: 14, bottom: 26, left: 36 };
  const totalW = getWidth(containerId);
  const width  = totalW - margin.left - margin.right;
  const height = 110 - margin.top - margin.bottom;

  const svg = d3.select('#' + containerId)
    .append('svg')
    .attr('width',  totalW)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain(d3.extent(data.timeline, d => d.year))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data.timeline, d => d.count)])
    .nice()
    .range([height, 0]);

  // Area fill
  const area = d3.area()
    .x(d => x(d.year))
    .y0(height)
    .y1(d => y(d.count))
    .curve(d3.curveMonotoneX);

  svg.append('path')
    .datum(data.timeline)
    .attr('class', 'chart-area')
    .attr('fill', color)
    .attr('d', area);

  // Line
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.count))
    .curve(d3.curveMonotoneX);

  svg.append('path')
    .datum(data.timeline)
    .attr('class', 'chart-line')
    .attr('stroke', color)
    .attr('d', line);

  // Hover dots
  svg.selectAll('.chart-dot')
    .data(data.timeline)
    .enter()
    .append('circle')
    .attr('class', 'chart-dot')
    .attr('cx', d => x(d.year))
    .attr('cy', d => y(d.count))
    .attr('r', 3)
    .attr('fill', color)
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .on('mouseover', (event, d) => showTooltip(`${d.year}: ${d.count} set${d.count !== 1 ? 's' : ''}`, event))
    .on('mousemove', moveTooltip)
    .on('mouseout',  hideTooltip);

  // Axes
  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x)
      .ticks(Math.min(data.timeline.length, 6))
      .tickFormat(d3.format('d'))
      .tickSize(3));

  svg.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(y).ticks(4).tickSize(3));
}

// ── 2. Piece count histogram ──────────────────────────────────────────────

function renderHistogram(data, color) {
  const containerId = 'chart-histogram';
  const el = document.getElementById(containerId);
  if (!el || !data.histogram.length) return;

  const margin = { top: 12, right: 14, bottom: 46, left: 36 };
  const totalW = getWidth(containerId);
  const width  = totalW - margin.left - margin.right;
  const height = 110 - margin.top - margin.bottom;

  const svg = d3.select('#' + containerId)
    .append('svg')
    .attr('width',  totalW)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.histogram.map(d => d.label))
    .range([0, width])
    .padding(0.22);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data.histogram, d => d.count)])
    .nice()
    .range([height, 0]);

  svg.selectAll('.chart-bar')
    .data(data.histogram)
    .enter()
    .append('rect')
    .attr('class', 'chart-bar')
    .attr('x',      d => x(d.label))
    .attr('y',      d => y(d.count))
    .attr('width',  x.bandwidth())
    .attr('height', d => Math.max(0, height - y(d.count)))
    .attr('fill',   color)
    .attr('rx',     2)
    .attr('opacity', 0.82)
    .on('mouseover', (event, d) => showTooltip(`${d.label} pieces: ${d.count} set${d.count !== 1 ? 's' : ''}`, event))
    .on('mousemove', moveTooltip)
    .on('mouseout',  hideTooltip);

  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).tickSize(3))
    .selectAll('text')
    .attr('transform', 'rotate(-38)')
    .style('text-anchor', 'end')
    .attr('dx', '-0.3em')
    .attr('dy', '0.5em');

  svg.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(y).ticks(4).tickSize(3));
}

// ── 3. Average price over time ────────────────────────────────────────────

function renderPriceTrend(data, color) {
  const containerId = 'chart-price';
  const el = document.getElementById(containerId);
  if (!el) return;

  if (!data.priceTrend.length) {
    el.insertAdjacentHTML('beforeend',
      '<p class="chart-notice">No retail price data available.</p>');
    return;
  }

  // Show notice when price data is sparse / starts late
  if (data.stats.hasSparsePrice) {
    el.insertAdjacentHTML('beforeend',
      '<p class="chart-notice">Price data sparse before 2000.</p>');
  }

  const margin = { top: 12, right: 14, bottom: 26, left: 44 };
  const totalW = getWidth(containerId);
  const width  = totalW - margin.left - margin.right;
  const height = 110 - margin.top - margin.bottom;

  const svg = d3.select('#' + containerId)
    .append('svg')
    .attr('width',  totalW)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain(d3.extent(data.priceTrend, d => d.year))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data.priceTrend, d => d.avg)])
    .nice()
    .range([height, 0]);

  // Area fill
  const area = d3.area()
    .x(d => x(d.year))
    .y0(height)
    .y1(d => y(d.avg))
    .curve(d3.curveMonotoneX);

  svg.append('path')
    .datum(data.priceTrend)
    .attr('class', 'chart-area')
    .attr('fill', color)
    .attr('d', area);

  // Line
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.avg))
    .curve(d3.curveMonotoneX);

  svg.append('path')
    .datum(data.priceTrend)
    .attr('class', 'chart-line')
    .attr('stroke', color)
    .attr('d', line);

  // Dots
  svg.selectAll('.chart-dot')
    .data(data.priceTrend)
    .enter()
    .append('circle')
    .attr('class', 'chart-dot')
    .attr('cx', d => x(d.year))
    .attr('cy', d => y(d.avg))
    .attr('r', 3)
    .attr('fill', color)
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .on('mouseover', (event, d) =>
      showTooltip(`${d.year}: avg $${d.avg.toFixed(2)} (${d.count} set${d.count !== 1 ? 's' : ''})`, event))
    .on('mousemove', moveTooltip)
    .on('mouseout',  hideTooltip);

  // Axes
  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x)
      .ticks(Math.min(data.priceTrend.length, 6))
      .tickFormat(d3.format('d'))
      .tickSize(3));

  svg.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(y)
      .ticks(4)
      .tickFormat(d => '$' + d3.format(',.0f')(d))
      .tickSize(3));
}

// ── 4. Top subthemes horizontal bar chart ─────────────────────────────────

function renderSubthemes(data, color) {
  const containerId = 'chart-subthemes';
  const el = document.getElementById(containerId);
  if (!el) return;

  if (!data.subthemes.length) {
    el.insertAdjacentHTML('beforeend',
      '<p class="chart-notice">No subtheme data available.</p>');
    return;
  }

  const BAR_H   = 18;
  const BAR_GAP = 5;
  const margin  = { top: 4, right: 44, bottom: 4, left: 88 };
  const totalW  = getWidth(containerId);
  const width   = totalW - margin.left - margin.right;
  const height  = data.subthemes.length * (BAR_H + BAR_GAP) - BAR_GAP;

  const svg = d3.select('#' + containerId)
    .append('svg')
    .attr('width',  totalW)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, d3.max(data.subthemes, d => d.count)])
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(data.subthemes.map(d => d.name))
    .range([0, height])
    .padding(0.18);

  // Bars
  svg.selectAll('.chart-bar')
    .data(data.subthemes)
    .enter()
    .append('rect')
    .attr('class', 'chart-bar')
    .attr('y',      d => y(d.name))
    .attr('x',      0)
    .attr('height', y.bandwidth())
    .attr('width',  d => Math.max(2, x(d.count)))
    .attr('fill',   color)
    .attr('rx',     2)
    .attr('opacity', 0.82)
    .on('mouseover', (event, d) => showTooltip(`${d.name}: ${d.count} set${d.count !== 1 ? 's' : ''}`, event))
    .on('mousemove', moveTooltip)
    .on('mouseout',  hideTooltip);

  // Count labels at bar ends
  svg.selectAll('.bar-label')
    .data(data.subthemes)
    .enter()
    .append('text')
    .attr('class', 'bar-label')
    .attr('y', d => y(d.name) + y.bandwidth() / 2 + 3.5)
    .attr('x', d => x(d.count) + 5)
    .text(d => d.count);

  // Y axis (subtheme names) — truncate to 12 chars
  svg.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(y)
      .tickSize(0)
      .tickFormat(name => name.length > 13 ? name.slice(0, 12) + '...' : name))
    .selectAll('text')
    .style('font-size', '10px')
    .attr('dx', '-4px');
}

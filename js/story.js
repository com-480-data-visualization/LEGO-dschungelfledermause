/* story.js — From Bricks to Blockbusters */
'use strict';

/* ── Palette ──────────────────────────────────────────────────────────── */
const GP = {
  'Licensed':        '#e3000b',
  'Modern day':      '#006cb7',
  'Miscellaneous':   '#8b5cf6',
  'Pre-school':      '#f59e0b',
  'Action/Adventure':'#f97316',
  'Basic':           '#64748b',
  'Model making':    '#00a650',
  'Technical':       '#1d4ed8',
  'Educational':     '#06b6d4',
  'Historical':      '#a16207',
  'Constraction':    '#dc2626',
  'Vintage':         '#9ca3af',
  'Girls':           '#ec4899',
  'Racing':          '#eab308',
};
const gColor = g => GP[g] || '#94a3b8';

/* ── Utilities ────────────────────────────────────────────────────────── */
function fmt(n) { return n >= 1000 ? (n/1000).toFixed(1).replace(/\.0$/,'')+'k' : String(Math.round(n)); }
function animN(el, target, dur=1400) {
  const t0 = performance.now();
  (function go() {
    const p = Math.min((performance.now()-t0)/dur, 1);
    const e = 1-Math.pow(1-p,3);
    el.textContent = fmt(Math.round(e*target));
    if(p<1) requestAnimationFrame(go);
  })();
}

const tip = document.getElementById('tip');
function showTip(html, evt) {
  tip.innerHTML = html; tip.style.opacity = '1';
  moveTip(evt);
}
function moveTip(evt) {
  tip.style.left = (evt.clientX+14)+'px';
  tip.style.top  = (evt.clientY-10)+'px';
}
function hideTip() { tip.style.opacity='0'; }

/* ── Load ─────────────────────────────────────────────────────────────── */
async function main() {
  const loading = document.getElementById('loading');
  let rows;
  try {
    rows = await new Promise((res,rej)=>Papa.parse('LEGO+Sets/lego_sets.csv',{
      download:true, header:true, dynamicTyping:true, skipEmptyLines:true,
      complete:r=>res(r.data), error:rej
    }));
  } catch(e) {
    document.querySelector('#loading p').textContent='Failed to load.'; return;
  }
  const normal = rows.filter(r=>r.category==='Normal');
  loading.classList.add('out');
  setTimeout(()=>loading.remove(), 500);

  const themes  = new Set(normal.map(r=>r.theme).filter(Boolean));
  const groups  = new Set(normal.map(r=>r.themeGroup).filter(Boolean));
  const pieces  = normal.map(r=>+r.pieces).filter(p=>p>0);

  animN(document.getElementById('s-sets'),   normal.length);
  animN(document.getElementById('s-themes'), themes.size, 900);
  animN(document.getElementById('s-groups'), groups.size, 700);

  buildHeatmap(normal);
  buildRose(normal);
  buildTreemap(normal);
  buildChord(normal);
  initFade();
}

/* ══════════════════════════════════════════════════════════════════════
   1. HEATMAP — themeGroup × 5-year period
══════════════════════════════════════════════════════════════════════ */
function buildHeatmap(rows) {
  const periods = d3.range(1970, 2023, 5).map(y => `${y}–${y+4}`);
  const periodOf = y => `${Math.floor(y/5)*5}–${Math.floor(y/5)*5+4}`;

  const groups = [...new Set(rows.map(r=>r.themeGroup).filter(Boolean))]
    .map(g => ({ g, n: rows.filter(r=>r.themeGroup===g).length }))
    .sort((a,b)=>b.n-a.n).map(d=>d.g).slice(0,12);

  // Build matrix
  const matrix = [];
  groups.forEach(g => {
    periods.forEach(p => {
      const cnt = rows.filter(r=>r.themeGroup===g && r.year && periodOf(+r.year)===p).length;
      matrix.push({ g, p, cnt });
    });
  });

  const wrap = document.getElementById('heatmap-wrap');
  const TOTAL_W = Math.max(600, wrap.clientWidth);
  const cellW = Math.max(28, Math.floor((TOTAL_W - 160) / periods.length));
  const cellH = 32;
  const marginL = 150, marginT = 50, marginB = 14;
  const W = marginL + periods.length * cellW;
  const H = marginT + groups.length * cellH + marginB;

  const svg = d3.select('#heatmap-svg').attr('width',W).attr('height',H);

  const maxCnt = d3.max(matrix, d=>d.cnt);
  const color = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, maxCnt]);

  // Gradient legend bar
  const lgBar = document.getElementById('hm-lgbar');
  lgBar.style.background = `linear-gradient(to right,${d3.interpolateYlOrRd(0)},${d3.interpolateYlOrRd(.5)},${d3.interpolateYlOrRd(1)})`;

  // Column headers (period labels)
  svg.append('g').selectAll('text').data(periods).join('text')
    .attr('x', (_,i) => marginL + i*cellW + cellW/2)
    .attr('y', marginT - 8)
    .attr('text-anchor','middle')
    .style('font-size','9px').style('font-weight','600')
    .style('fill','#777').style('font-family','Inter,system-ui')
    .text(d=>d.replace('–','-'));

  // Row headers (group labels)
  svg.append('g').selectAll('text').data(groups).join('text')
    .attr('x', marginL - 8)
    .attr('y', (_,i) => marginT + i*cellH + cellH/2)
    .attr('text-anchor','end').attr('dy','0.35em')
    .style('font-size','11px').style('font-weight','600')
    .style('fill','#333').style('font-family','Inter,system-ui')
    .text(d=>d);

  // Cells
  svg.append('g').selectAll('rect').data(matrix).join('rect')
    .attr('x', d => marginL + periods.indexOf(d.p)*cellW + 1.5)
    .attr('y', d => marginT + groups.indexOf(d.g)*cellH + 1.5)
    .attr('width', cellW - 3).attr('height', cellH - 3)
    .attr('rx', 3)
    .attr('fill', d => d.cnt===0 ? '#f0f0eb' : color(d.cnt))
    .style('cursor','pointer')
    .on('mouseover', (evt,d) => {
      showTip(`<strong>${d.g}</strong><br>${d.p}<br>${d.cnt} sets`, evt);
      d3.select(evt.currentTarget).attr('stroke','#fff').attr('stroke-width',2);
    })
    .on('mousemove', moveTip)
    .on('mouseleave', (evt) => {
      hideTip();
      d3.select(evt.currentTarget).attr('stroke',null);
    });

  // Cell count labels (only for cells with enough space)
  svg.append('g').selectAll('text').data(matrix.filter(d=>d.cnt>0)).join('text')
    .attr('x', d => marginL + periods.indexOf(d.p)*cellW + cellW/2)
    .attr('y', d => marginT + groups.indexOf(d.g)*cellH + cellH/2)
    .attr('text-anchor','middle').attr('dy','0.35em')
    .style('font-size','8px').style('font-weight','700')
    .style('fill', d => color(d.cnt) && d.cnt > maxCnt*0.5 ? '#fff' : '#333')
    .style('pointer-events','none')
    .style('font-family','Inter,system-ui')
    .text(d => cellW > 36 && d.cnt > 0 ? d.cnt : '');
}

/* ══════════════════════════════════════════════════════════════════════
   2. NIGHTINGALE ROSE — theme groups
══════════════════════════════════════════════════════════════════════ */
function buildRose(rows) {
  const byGroup = d3.rollup(rows, v=>v.length, r=>r.themeGroup);
  const data = Array.from(byGroup, ([g,n])=>({g,n}))
    .filter(d=>d.g)
    .sort((a,b)=>b.n-a.n);

  const SIZE = 340, cx = SIZE/2, cy = SIZE/2;
  const svg = d3.select('#rose-svg').attr('width',SIZE).attr('height',SIZE);

  const maxN = d3.max(data, d=>d.n);
  const r = d3.scaleSqrt().domain([0,maxN]).range([0, SIZE/2 - 24]);
  const tau = 2*Math.PI;
  const sliceAngle = tau / data.length;

  let selectedG = null;

  const arcs = svg.append('g').attr('transform',`translate(${cx},${cy})`);

  const arcGen = d3.arc()
    .innerRadius(22)
    .outerRadius(d => r(d.n))
    .startAngle((_,i) => i*sliceAngle - tau/4)
    .endAngle((_,i) => (i+1)*sliceAngle - tau/4)
    .padAngle(0.025)
    .padRadius(22);

  const paths = arcs.selectAll('path').data(data).join('path')
    .attr('d', arcGen)
    .attr('fill', d=>gColor(d.g))
    .attr('opacity', 0.85)
    .attr('stroke','#fff').attr('stroke-width',1.2)
    .style('cursor','pointer')
    .on('mouseover', (evt,d) => {
      showTip(`<strong>${d.g}</strong><br>${d.n.toLocaleString()} sets`, evt);
      d3.select(evt.currentTarget).attr('opacity',1).attr('stroke-width',2.5);
    })
    .on('mousemove', moveTip)
    .on('mouseleave', (evt,d) => {
      hideTip();
      d3.select(evt.currentTarget)
        .attr('opacity', selectedG && selectedG!==d.g ? 0.25 : 0.85)
        .attr('stroke-width', 1.2);
    })
    .on('click', (_,d) => {
      if(selectedG===d.g){ selectedG=null; paths.attr('opacity',0.85); }
      else { selectedG=d.g; paths.attr('opacity', dd=>dd.g===d.g?1:0.25); }
    });

  // Entry animation
  paths.attr('transform','scale(0)').transition().duration(900)
    .delay((_,i)=>i*55).ease(d3.easeElasticOut.amplitude(1).period(0.45))
    .attr('transform','scale(1)');

  // Centre label
  const centerText = arcs.append('text').attr('text-anchor','middle')
    .attr('dy','-0.2em')
    .style('font-family','Nunito,sans-serif').style('font-weight','800')
    .style('font-size','12px').style('fill','#333').style('pointer-events','none')
    .text('Theme');
  arcs.append('text').attr('text-anchor','middle').attr('dy','1.1em')
    .style('font-family','Nunito,sans-serif').style('font-weight','700')
    .style('font-size','11px').style('fill','#888').style('pointer-events','none')
    .text('Groups');

  // Legend
  const lg = document.getElementById('rose-legend');
  lg.innerHTML = data.map(d=>`
    <span class="leg-item">
      <span class="leg-swatch" style="background:${gColor(d.g)}"></span>
      ${d.g} <span style="color:#aaa;font-weight:400">${d.n}</span>
    </span>`).join('');
}

/* ══════════════════════════════════════════════════════════════════════
   3. TREEMAP — themeGroup → theme
══════════════════════════════════════════════════════════════════════ */
function buildTreemap(rows) {
  const wrap = document.getElementById('treemap-svg').parentElement;
  const W = Math.max(480, wrap.clientWidth - 40);
  const H = 420;
  const svg = d3.select('#treemap-svg').attr('width',W).attr('height',H).attr('height',H);

  // Hierarchy
  const byGroup = d3.rollup(rows, v=>d3.rollup(v, vv=>vv.length, r=>r.theme), r=>r.themeGroup);
  const rootData = { name:'All themes', children:
    Array.from(byGroup, ([g,themes])=>({
      name:g,
      children: Array.from(themes, ([t,n])=>({name:t, group:g, value:n})).filter(d=>d.value>=2)
    })).filter(d=>d.name)
  };

  const root = d3.hierarchy(rootData).sum(d=>d.value||0).sort((a,b)=>b.value-a.value);

  const layout = d3.treemap().size([W,H]).paddingOuter(3).paddingTop(20).paddingInner(1.5).round(true);

  const crumb = document.getElementById('tm-breadcrumb');
  let currentRoot = root;

  function render(node) {
    layout(node.copy().sum(d=>d.value||0).sort((a,b)=>b.value-a.value));
    // Actually, we re-layout from the chosen subtree:
    const sub = node === root ? root : d3.hierarchy({...node.data, children: node.children?.map(c=>c.data)})
      .sum(d=>d.value||0).sort((a,b)=>b.value-a.value);
    layout(sub);

    svg.selectAll('*').remove();

    const leaves = sub.leaves();
    const groups = sub.children || [sub];
    const isLeaf = !sub.children;

    // Draw group headers
    if(!isLeaf) {
      svg.selectAll('.g-header').data(groups).join('rect')
        .attr('x',d=>d.x0).attr('y',d=>d.y0)
        .attr('width',d=>d.x1-d.x0).attr('height',d=>d.y1-d.y0)
        .attr('fill', d=>gColor(d.data.name||node.data.name))
        .attr('opacity',0.15).attr('rx',3);

      svg.selectAll('.g-title').data(groups).join('text')
        .attr('x',d=>d.x0+5).attr('y',d=>d.y0+14)
        .style('font-size','11px').style('font-weight','700')
        .style('fill',d=>gColor(d.data.name||node.data.name))
        .style('font-family','Inter,system-ui')
        .text(d=>d.data.name);
    }

    // Draw leaves
    const g = svg.selectAll('.leaf').data(leaves).join('g').attr('class','leaf')
      .style('cursor','pointer');

    g.append('rect')
      .attr('x',d=>d.x0).attr('y',d=>d.y0)
      .attr('width',d=>Math.max(0,d.x1-d.x0))
      .attr('height',d=>Math.max(0,d.y1-d.y0))
      .attr('rx',3)
      .attr('fill', d=>gColor(d.data.group||node.data.name||d.data.name))
      .attr('opacity',0.78)
      .attr('stroke','#fff').attr('stroke-width',.8);

    g.append('text')
      .attr('x',d=>d.x0+4).attr('y',d=>d.y0+12)
      .style('font-size',d=>Math.min(11, Math.max(7,(d.x1-d.x0)/7))+'px')
      .style('font-weight','700').style('fill','#fff')
      .style('font-family','Inter,system-ui').style('pointer-events','none')
      .text(d=>{
        const w=d.x1-d.x0, h=d.y1-d.y0;
        if(w<24||h<14) return '';
        return w > 50 ? d.data.name : d.data.name.slice(0,Math.floor(w/7));
      });

    g.on('mouseover',(evt,d)=>{
      showTip(`<strong>${d.data.name}</strong><br>${d.data.group||''}<br>${d.value} sets`, evt);
      d3.select(evt.currentTarget).select('rect').attr('opacity',1);
    }).on('mousemove',moveTip)
    .on('mouseleave',(evt)=>{
      hideTip();
      d3.select(evt.currentTarget).select('rect').attr('opacity',.78);
    }).on('click',(_,d)=>{
      // Drill into group
      const grp = node.children?.find(c=>c.data.name===d.data.group);
      if(grp && !isLeaf) { currentRoot=grp; renderFrom(grp); }
    });

    // Breadcrumb
    crumb.innerHTML = node===root
      ? `<span data-level="root" style="color:#333;font-weight:700">All themes</span>`
      : `<span data-level="root" style="cursor:pointer;color:var(--b)">All themes</span>
         <span class="sep">›</span>
         <span style="color:#333;font-weight:700">${node.data.name}</span>`;
    crumb.querySelector('[data-level="root"]')?.addEventListener('click',()=>renderFrom(root));
  }

  function renderFrom(node) {
    // Re-layout the node
    layout(node.copy().sum(d=>d.value||0).sort((a,b)=>b.value-a.value));
    render(node);
  }

  renderFrom(root);
}

/* ══════════════════════════════════════════════════════════════════════
   4. CHORD DIAGRAM — theme groups × piece-size tiers
══════════════════════════════════════════════════════════════════════ */
function buildChord(rows) {
  const GROUPS = ['Licensed','Modern day','Technical','Model making','Action/Adventure','Pre-school'];
  const SIZES  = ['>500 pcs','200–500','50–200','<50'];
  const sizeOf = p => p>=500?'>500 pcs': p>=200?'200–500': p>=50?'50–200':'<50';

  const N = GROUPS.length + SIZES.length; // 10 nodes
  const matrix = Array.from({length:N}, ()=>Array(N).fill(0));

  rows.forEach(r => {
    const gi = GROUPS.indexOf(r.themeGroup);
    const p = +r.pieces;
    if(gi<0 || isNaN(p) || p<=0) return;
    const si = GROUPS.length + SIZES.indexOf(sizeOf(p));
    if(si < GROUPS.length) return;
    matrix[gi][si]++;
    matrix[si][gi]++;
  });

  const SIZE = Math.min(520, document.getElementById('chord-svg').parentElement.clientWidth - 36);
  const svg = d3.select('#chord-svg').attr('width',SIZE).attr('height',SIZE)
    .attr('viewBox',`0 0 ${SIZE} ${SIZE}`);

  const outerR = SIZE/2 - 30, innerR = outerR - 20;

  const chord = d3.chord().padAngle(0.06).sortSubgroups(d3.descending)(matrix);

  const arc = d3.arc().innerRadius(innerR).outerRadius(outerR);
  const ribbon = d3.ribbon().radius(innerR - 2);

  const LABELS = [...GROUPS, ...SIZES];
  const COLORS = [
    ...GROUPS.map(g=>gColor(g)),
    '#1d4ed8','#0891b2','#16a34a','#64748b'
  ];

  const g = svg.append('g').attr('transform',`translate(${SIZE/2},${SIZE/2})`);

  // Ribbons
  g.append('g').attr('fill-opacity',.65)
    .selectAll('path').data(chord).join('path')
    .attr('d', ribbon)
    .attr('fill', d=>COLORS[d.source.index])
    .attr('stroke', d=>d3.color(COLORS[d.source.index]).darker(.5))
    .attr('stroke-width',.5)
    .style('cursor','pointer')
    .on('mouseover',(evt,d)=>{
      const src=LABELS[d.source.index], tgt=LABELS[d.target.index];
      showTip(`<strong>${src}</strong> ↔ <strong>${tgt}</strong><br>${d.source.value} sets`, evt);
      d3.select(evt.currentTarget).attr('fill-opacity',1);
    })
    .on('mousemove',moveTip)
    .on('mouseleave',(evt)=>{ hideTip(); d3.select(evt.currentTarget).attr('fill-opacity',.65); });

  // Arcs
  const arcG = g.append('g').selectAll('g').data(chord.groups).join('g');

  arcG.append('path')
    .attr('d',arc)
    .attr('fill', d=>COLORS[d.index])
    .attr('stroke','#fff').attr('stroke-width',1)
    .style('cursor','default')
    .on('mouseover',(evt,d)=>{
      showTip(`<strong>${LABELS[d.index]}</strong><br>${d.value} sets`, evt);
    })
    .on('mousemove',moveTip)
    .on('mouseleave',hideTip);

  // Arc labels
  arcG.append('text')
    .each(d=>{ d.angle=(d.startAngle+d.endAngle)/2; })
    .attr('dy','0.35em')
    .attr('transform', d=>`rotate(${d.angle*180/Math.PI-90}) translate(${outerR+10}) ${d.angle>Math.PI?'rotate(180)':''}`)
    .attr('text-anchor', d=>d.angle>Math.PI?'end':'start')
    .style('font-size','10px').style('font-weight','700')
    .style('fill','#333').style('font-family','Inter,system-ui')
    .text(d=>LABELS[d.index]);

  // Legend
  const lg = document.getElementById('chord-legend');
  lg.innerHTML = [
    ...GROUPS.map((g,i)=>`<span class="leg-item"><span class="leg-rect" style="background:${COLORS[i]}"></span>${g}</span>`),
    ...SIZES.map((s,i)=>`<span class="leg-item"><span class="leg-rect" style="background:${COLORS[GROUPS.length+i]}"></span>${s}</span>`)
  ].join('');
}

/* ── Fade-in observer ────────────────────────────────────────────────── */
function initFade() {
  const io = new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('vis'); io.unobserve(e.target); }
  }), {threshold:.1});
  document.querySelectorAll('.fi').forEach(el=>io.observe(el));
}

main();

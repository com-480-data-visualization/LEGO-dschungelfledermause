/**
 * data.js
 * Loads and processes the LEGO dataset.
 * Exports: initData(), store
 */

const store = {
  allSets:    [],   // all Normal-category rows
  byDistrict: {},   // { districtId: [...rows] }
  byIPSub:    {},   // { subId: [...rows] }
  aggregated: {},   // { districtId: AggResult, 'ip_starwars': AggResult, ... }
};

// Piece-count histogram bins
const HIST_BINS = [
  { label: '1-50',    min: 1,    max: 50    },
  { label: '51-100',  min: 51,   max: 100   },
  { label: '101-200', min: 101,  max: 200   },
  { label: '201-500', min: 201,  max: 500   },
  { label: '501-1k',  min: 501,  max: 1000  },
  { label: '1k-2k',   min: 1001, max: 2000  },
  { label: '2k+',     min: 2001, max: Infinity },
];

async function initData() {
  const rows = await loadCSV('LEGO+Sets/lego_sets.csv');

  // Filter to Normal sets only
  store.allSets = rows.filter(r => r.category === 'Normal');

  // Partition by district
  for (const [id, district] of Object.entries(DISTRICTS)) {
    store.byDistrict[id] = store.allSets.filter(district.matcher);
  }

  // Partition IP sub-districts
  for (const [id, sub] of Object.entries(IP_SUB_DISTRICTS)) {
    store.byIPSub[id] = store.allSets.filter(sub.matcher);
  }

  // Pre-aggregate everything
  for (const id of Object.keys(DISTRICTS)) {
    store.aggregated[id] = aggregate(store.byDistrict[id]);
  }
  for (const id of Object.keys(IP_SUB_DISTRICTS)) {
    store.aggregated['ip_' + id] = aggregate(store.byIPSub[id]);
  }
}

function loadCSV(path) {
  return new Promise((resolve, reject) => {
    Papa.parse(path, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: results => resolve(results.data),
      error: err => reject(err),
    });
  });
}

function aggregate(rows) {
  // 1. Timeline — sets per year
  const yearMap = new Map();
  for (const row of rows) {
    const y = row.year;
    if (y && !isNaN(y)) {
      yearMap.set(y, (yearMap.get(y) || 0) + 1);
    }
  }
  const timeline = Array.from(yearMap, ([year, count]) => ({ year: +year, count }))
    .sort((a, b) => a.year - b.year);

  // 2. Piece count histogram
  const histogram = HIST_BINS.map(bin => ({ label: bin.label, count: 0 }));
  for (const row of rows) {
    const p = +row.pieces;
    if (isNaN(p) || p < 1) continue;
    for (let i = 0; i < HIST_BINS.length; i++) {
      if (p >= HIST_BINS[i].min && p <= HIST_BINS[i].max) {
        histogram[i].count++;
        break;
      }
    }
  }

  // 3. Price trend — average retail price per year
  const priceByYear = new Map();
  for (const row of rows) {
    const y = +row.year;
    const p = +row.US_retailPrice;
    if (!isNaN(y) && !isNaN(p) && p > 0) {
      if (!priceByYear.has(y)) priceByYear.set(y, []);
      priceByYear.get(y).push(p);
    }
  }
  const priceTrend = Array.from(priceByYear, ([year, prices]) => ({
    year: +year,
    avg: prices.reduce((a, b) => a + b, 0) / prices.length,
    count: prices.length,
  })).sort((a, b) => a.year - b.year);

  // 4. Subthemes — top 8 named subthemes by set count
  const subMap = new Map();
  for (const row of rows) {
    const s = row.subtheme;
    if (s && s.trim()) {
      subMap.set(s, (subMap.get(s) || 0) + 1);
    }
  }
  const subthemes = Array.from(subMap, ([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // 5. Key stats
  const pieces  = rows.map(r => +r.pieces).filter(p => !isNaN(p) && p > 0);
  const prices  = rows.map(r => +r.US_retailPrice).filter(p => !isNaN(p) && p > 0);
  const years   = rows.map(r => +r.year).filter(y => !isNaN(y));

  const sortedPieces = [...pieces].sort((a, b) => a - b);

  const stats = {
    totalSets:    rows.length,
    avgPieces:    pieces.length  ? Math.round(pieces.reduce((a, b) => a + b, 0) / pieces.length) : null,
    medianPieces: sortedPieces.length ? sortedPieces[Math.floor(sortedPieces.length / 2)] : null,
    priceMin:     prices.length ? Math.min(...prices) : null,
    priceMax:     prices.length ? Math.max(...prices) : null,
    priceAvg:     prices.length ? +(prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2) : null,
    yearMin:      years.length  ? Math.min(...years) : null,
    yearMax:      years.length  ? Math.max(...years) : null,
    hasSparsePrice: priceTrend.length > 0 && priceTrend[0].year > 1998,
  };

  return { timeline, histogram, priceTrend, subthemes, stats };
}

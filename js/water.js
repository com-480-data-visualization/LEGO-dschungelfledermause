/**
 * water.js
 * Animates expanding ripple rings on the ocean canvas.
 * Ripples spawn at randomized ocean-edge positions.
 */

const RIPPLE_INTERVAL   = 2200;   // ms between new ripples
const RIPPLE_SPEED      = 0.55;   // px radius growth per frame
const RIPPLE_MAX_RADIUS = 85;     // max radius before a ripple is retired
const MAX_RIPPLES       = 6;

// Spawn zones: [x%, y%] points scattered around island edges (ocean area)
const SPAWN_ZONES = [
  [0.08, 0.45],
  [0.92, 0.30],
  [0.50, 0.04],
  [0.14, 0.82],
  [0.85, 0.78],
  [0.30, 0.08],
  [0.72, 0.06],
  [0.06, 0.62],
  [0.93, 0.58],
  [0.42, 0.92],
];

let canvas, ctx;
let ripples = [];
let lastSpawnTime = 0;
let animFrameId = null;

function initWater(canvasEl) {
  canvas = canvasEl;
  ctx    = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  animFrameId = requestAnimationFrame(tick);
}

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

function spawnRipple() {
  if (ripples.length >= MAX_RIPPLES) return;
  const zone = SPAWN_ZONES[Math.floor(Math.random() * SPAWN_ZONES.length)];
  const jitterX = (Math.random() - 0.5) * 0.12;
  const jitterY = (Math.random() - 0.5) * 0.12;
  ripples.push({
    x:    (zone[0] + jitterX) * canvas.width,
    y:    (zone[1] + jitterY) * canvas.height,
    r:    2,
    maxR: RIPPLE_MAX_RADIUS + Math.random() * 25,
  });
}

function tick(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Spawn new ripple on interval
  if (timestamp - lastSpawnTime > RIPPLE_INTERVAL) {
    spawnRipple();
    lastSpawnTime = timestamp;
  }

  // Update and draw ripples
  const alive = [];
  for (const rp of ripples) {
    rp.r += RIPPLE_SPEED;
    if (rp.r >= rp.maxR) continue;   // retire
    alive.push(rp);

    const progress = rp.r / rp.maxR;
    const alpha    = 0.38 * (1 - progress);

    ctx.beginPath();
    ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth   = 1.2;
    ctx.stroke();

    // Inner fainter ring for subtle layering
    if (rp.r > 12) {
      const r2 = rp.r * 0.65;
      const a2 = 0.18 * (1 - progress);
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, r2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${a2})`;
      ctx.lineWidth   = 0.8;
      ctx.stroke();
    }
  }
  ripples = alive;

  animFrameId = requestAnimationFrame(tick);
}

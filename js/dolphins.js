/**
 * dolphins.js
 * Animates dolphins leaping from the ocean around the island.
 * Each dolphin follows a parabolic arc, rotates along its tangent,
 * and is accompanied by a small splash on launch and landing.
 *
 * Depends on nothing — call initDolphins(canvasEl) to start.
 */

const DOLPHIN_INTERVAL_MIN = 3800;  // ms minimum between spawns
const DOLPHIN_INTERVAL_MAX = 8500;  // ms maximum between spawns

// Ocean spawn zones [x%, y%] — positioned around the island edges in open water
const DOLPHIN_ZONES = [
  [0.07, 0.40], [0.09, 0.60], [0.13, 0.78],
  [0.88, 0.26], [0.91, 0.52], [0.87, 0.74],
  [0.32, 0.05], [0.55, 0.04], [0.72, 0.06],
  [0.38, 0.91], [0.60, 0.92],
];

let dCanvas, dCtx;
let dolphins    = [];
let nextSpawnAt = 0;

// ── Public API 

function initDolphins(canvasEl) {
  dCanvas = canvasEl;
  dCtx    = dCanvas.getContext('2d');
  resizeDolphinCanvas();
  window.addEventListener('resize', resizeDolphinCanvas);
  requestAnimationFrame(tickDolphins);
}

// ── Internal

function resizeDolphinCanvas() {
  dCanvas.width  = window.innerWidth;
  dCanvas.height = window.innerHeight;
}

function spawnDolphin() {
  const zone = DOLPHIN_ZONES[Math.floor(Math.random() * DOLPHIN_ZONES.length)];
  const jx   = (Math.random() - 0.5) * 0.07;
  const jy   = (Math.random() - 0.5) * 0.05;

  // Randomly swim left or right
  const dir     = Math.random() < 0.5 ? 1 : -1;
  const travelX = dir * (50 + Math.random() * 50);

  dolphins.push({
    x0:       (zone[0] + jx) * dCanvas.width,
    y0:       (zone[1] + jy) * dCanvas.height,
    travelX,
    height:   60 + Math.random() * 55,
    duration: 820 + Math.random() * 380,
    t0:       null,
  });
}

/**
 * Draw a dolphin silhouette centred on (0,0), pointing right.
 * Caller is responsible for translate/rotate/globalAlpha.
 */
function drawDolphinShape(ctx, scale) {
  const s = scale;

  // Main body
  ctx.beginPath();
  ctx.ellipse(0, 0, 27 * s, 9 * s, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#5aaedf';
  ctx.fill();

  // Pale belly
  ctx.beginPath();
  ctx.ellipse(5 * s, 2 * s, 17 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#d4eef8';
  ctx.fill();

  // Snout / beak
  ctx.beginPath();
  ctx.moveTo(21 * s, -2 * s);
  ctx.lineTo(35 * s,  1 * s);
  ctx.lineTo(22 * s,  5 * s);
  ctx.closePath();
  ctx.fillStyle = '#5aaedf';
  ctx.fill();

  // Dorsal fin
  ctx.beginPath();
  ctx.moveTo(4  * s, -9 * s);
  ctx.quadraticCurveTo(10 * s, -22 * s, 17 * s, -9 * s);
  ctx.closePath();
  ctx.fillStyle = '#3a8dbf';
  ctx.fill();

  // Tail flukes
  ctx.beginPath();
  ctx.moveTo(-24 * s,  0);
  ctx.lineTo(-37 * s, -11 * s);
  ctx.lineTo(-29 * s,  0);
  ctx.lineTo(-37 * s,  11 * s);
  ctx.closePath();
  ctx.fillStyle = '#3a8dbf';
  ctx.fill();

  // Eye
  ctx.beginPath();
  ctx.arc(21 * s, -3 * s, 2 * s, 0, Math.PI * 2);
  ctx.fillStyle = '#1a1a2e';
  ctx.fill();

  // Eye highlight
  ctx.beginPath();
  ctx.arc(22 * s, -4 * s, 0.8 * s, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fill();
}

/**
 * Draw a water splash at (x, y).
 * progress 0→1 drives how far the streams have travelled.
 * alpha  0→1 overall opacity.
 */
function drawSplash(ctx, x, y, progress, alpha) {
  if (alpha <= 0 || progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;

  // Radiating water streams — fixed angles so the render is stable each frame
  const streams = [-105, -75, -48, -18, 12, 42, 72, 102].map(d => d * Math.PI / 180);
  for (const angle of streams) {
    const len  = 24 * progress;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.strokeStyle = 'rgba(200, 235, 255, 0.85)';
    ctx.lineWidth   = 1.6;
    ctx.lineCap     = 'round';
    ctx.stroke();
  }

  // Expanding ring at water surface
  const ringR = 16 * progress;
  ctx.beginPath();
  ctx.arc(x, y, ringR, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 * (1 - progress)})`;
  ctx.lineWidth   = 1;
  ctx.stroke();

  ctx.restore();
}

function tickDolphins(timestamp) {
  dCtx.clearRect(0, 0, dCanvas.width, dCanvas.height);

  // Spawn a dolphin when the interval has elapsed
  if (timestamp >= nextSpawnAt) {
    spawnDolphin();
    nextSpawnAt = timestamp
      + DOLPHIN_INTERVAL_MIN
      + Math.random() * (DOLPHIN_INTERVAL_MAX - DOLPHIN_INTERVAL_MIN);
  }

  const alive = [];

  for (const d of dolphins) {
    if (d.t0 === null) d.t0 = timestamp;

    const t = Math.min((timestamp - d.t0) / d.duration, 1.0);

    // ── Position along parabolic arc
    const x = d.x0 + d.travelX * t;
    const y = d.y0 - d.height * 4 * t * (1 - t);

    // ── Tangent angle — rotate dolphin to follow the arc
    const eps = 0.01;
    const t2  = Math.min(t + eps, 1.0);
    const x2  = d.x0 + d.travelX * t2;
    const y2  = d.y0 - d.height * 4 * t2 * (1 - t2);
    const angle = Math.atan2(y2 - y, x2 - x);

    // ── Alpha: fade in as it leaves water, fade out as it re-enters
    let alpha;
    if      (t < 0.12) alpha = t / 0.12;
    else if (t > 0.84) alpha = (1 - t) / 0.16;
    else               alpha = 1.0;

    // Slight size swell at the apex of the jump
    const scale = 0.82 + 0.18 * Math.sin(t * Math.PI);

    // ── Launch splash (fades out after departure) 
    if (t < 0.22) {
      const sp = t / 0.22;
      drawSplash(dCtx, d.x0, d.y0, sp, (1 - sp) * 0.65);
    }

    // ── Draw dolphin
    // atan2 gives the correct heading angle for both left and right travel,
    // so no horizontal flip is needed — rotation handles direction naturally.
    if (alpha > 0) {
      dCtx.save();
      dCtx.globalAlpha = alpha;
      dCtx.translate(x, y);
      dCtx.rotate(angle);
      drawDolphinShape(dCtx, scale);
      dCtx.restore();
    }

    // ── Landing splash (grows as dolphin re-enters water)
    if (t > 0.80) {
      const sp     = (t - 0.80) / 0.20;
      const landX  = d.x0 + d.travelX;
      drawSplash(dCtx, landX, d.y0, sp, (1 - sp) * 0.75);
    }

    if (t < 1.0) alive.push(d);
  }

  dolphins = alive;
  requestAnimationFrame(tickDolphins);
}

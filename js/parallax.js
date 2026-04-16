/**
 * parallax.js
 * Mouse-move parallax controller.
 * Uses RAF lerp so each layer lags smoothly behind cursor movement.
 */

// Layer config: { el, factor } — factor is max travel in px at screen edge
let layerConfigs = [];
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;
let rafId    = null;
let paused   = false;

const LERP_FACTOR = 0.07;   // lower = more lag/smoothness
const EPSILON     = 0.005;  // stop RAF when this close to target

function initParallax(sceneEl) {
  layerConfigs = [
    { el: document.getElementById('layer-island'),    factor: 3  },
    { el: document.getElementById('layer-districts'), factor: 10 },
  ];

  // Ensure GPU compositing
  layerConfigs.forEach(({ el }) => {
    el.style.willChange = 'transform';
  });

  sceneEl.addEventListener('mousemove', onMouseMove);
  sceneEl.addEventListener('mouseleave', onMouseLeave);
}

function onMouseMove(e) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  // Normalize to [-1, 1] with (0,0) at center
  targetX = (e.clientX / w - 0.5) * 2;
  targetY = (e.clientY / h - 0.5) * 2;

  if (!rafId && !paused) {
    rafId = requestAnimationFrame(updateLayers);
  }
}

function onMouseLeave() {
  // Drift back to center
  targetX = 0;
  targetY = 0;
  if (!rafId && !paused) {
    rafId = requestAnimationFrame(updateLayers);
  }
}

function updateLayers() {
  currentX += (targetX - currentX) * LERP_FACTOR;
  currentY += (targetY - currentY) * LERP_FACTOR;

  for (const { el, factor } of layerConfigs) {
    // Opposite direction to mouse (layers shift away from cursor)
    const tx = -currentX * factor;
    const ty = -currentY * factor;
    el.style.transform = `translate(${tx.toFixed(3)}px, ${ty.toFixed(3)}px)`;
  }

  const distX = Math.abs(targetX - currentX);
  const distY = Math.abs(targetY - currentY);
  if (distX > EPSILON || distY > EPSILON) {
    rafId = requestAnimationFrame(updateLayers);
  } else {
    rafId = null;
  }
}

function pauseParallax() {
  paused = true;
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function resumeParallax() {
  paused = false;
  // Snap back to neutral position first
  targetX = 0;
  targetY = 0;
  rafId = requestAnimationFrame(updateLayers);
}

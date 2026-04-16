/**
 * main.js
 * Application bootstrap. Runs in order:
 * 1. Start water animation (no data dependency)
 * 2. Load and process CSV
 * 3. Init parallax
 * 4. Create district markers
 * 5. Hide loading screen
 */

(async function () {
  const loadingEl = document.getElementById('loading-screen');

  // Water starts immediately — visible during data load
  initWater(document.getElementById('water-canvas'));

  try {
    await initData();
  } catch (err) {
    console.error('Failed to load LEGO data:', err);
    const msgEl = loadingEl.querySelector('p');
    if (msgEl) {
      msgEl.textContent = 'Failed to load data. Please serve via a local HTTP server.';
    }
    return;
  }

  // Set up parallax
  initParallax(document.getElementById('scene'));

  // Build district markers on the island
  initIsland();

  // Fade out loading screen
  loadingEl.classList.add('hidden');
  setTimeout(() => loadingEl.remove(), 400);
})();

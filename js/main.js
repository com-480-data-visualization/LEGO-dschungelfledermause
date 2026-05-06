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

  // Setup interval slider
  initYearSlider();

  // Fade out loading screen
  loadingEl.classList.add('hidden');
  setTimeout(() => loadingEl.remove(), 400);
})();

function initYearSlider() {
  const sliderStart = document.getElementById('slider-year-start');
  const sliderEnd = document.getElementById('slider-year-end');
  const rangeLabel = document.getElementById('slider-range-label');
  const trackFill = document.getElementById('slider-track-fill');

  function refreshSlider(e) {
    let start = parseInt(sliderStart.value, 10);
    let end = parseInt(sliderEnd.value, 10);

    // Prevent crossing
    if (start > end) {
      if (e && e.target === sliderStart) {
        sliderStart.value = end;
        start = end;
      } else if (e && e.target === sliderEnd) {
        sliderEnd.value = start;
        end = start;
      } else {
        start = end;
        sliderStart.value = start;
      }
    }

    // Update labels
    if (start === end) {
      rangeLabel.textContent = start;
    } else {
      rangeLabel.innerHTML = `${start} &ndash; ${end}`;
    }

    // Update track fill visualization
    const min = parseInt(sliderStart.min, 10);
    const max = parseInt(sliderStart.max, 10);
    const percentStart = ((start - min) / (max - min)) * 100;
    const percentEnd = ((end - min) / (max - min)) * 100;
    trackFill.style.left = `${percentStart}%`;
    trackFill.style.width = `${percentEnd - percentStart}%`;

    // Update marker sizes and get total count
    if (typeof updateMarkerSizes === 'function') {
      const totalSets = updateMarkerSizes(start, end);
      const countLabel = document.getElementById('slider-count-label');
      if (countLabel) {
        countLabel.textContent = `${totalSets} new set${totalSets === 1 ? '' : 's'}`;
      }
    }
  }

  sliderStart.addEventListener('input', refreshSlider);
  sliderEnd.addEventListener('input', refreshSlider);

  // Initial call to set sizes and UI state based on default values
  refreshSlider();
}

/**
 * island.js
 * Creates district marker elements over the island SVG and handles
 * the zoom-to-district interaction.
 *
 * Depends on: DISTRICTS (districts.js), pauseParallax, resumeParallax (parallax.js),
 *             openPanel (panel.js)
 */

const SVG_W = 1100;   // island SVG viewBox width
const SVG_H = 720;    // island SVG viewBox height

let activeDistrictId = null;

function initIsland() {
  const container = document.getElementById('layer-districts');
  if (!container) return;

  for (const [id, district] of Object.entries(DISTRICTS)) {
    const marker = createMarker(id, district);
    container.appendChild(marker);
  }
}

function createMarker(id, district) {
  const marker = document.createElement('div');
  marker.className     = 'district-marker';
  marker.dataset.id    = id;
  marker.setAttribute('role', 'button');
  marker.setAttribute('tabindex', '0');
  marker.setAttribute('aria-label', `${district.label} district — click to explore`);

  // Position using % of SVG viewBox
  marker.style.left = `${(district.cx / SVG_W) * 100}%`;
  marker.style.top  = `${(district.cy / SVG_H) * 100}%`;

  // Badge (colored circle)
  const badge = document.createElement('div');
  badge.className = 'district-badge';
  badge.style.color = district.accentColor;  // used by ::after pulse ring

  if (district.image) {
    // Photo fills the circle; district color shows as fallback while loading
    badge.classList.add('has-image');
    badge.style.background = `url('location_images/${district.image}') center/cover, ${district.color}`;
  } else {
    // Solid color + CSS motif fallback
    badge.style.background = district.color;
    const motif = document.createElement('div');
    motif.className = `district-motif motif-${district.motif}`;
    appendMotifChildren(motif, district.motif);
    badge.appendChild(motif);
  }

  // Hover hint
  const hint = document.createElement('div');
  hint.className   = 'district-hint';
  hint.textContent = district.isFolder ? 'Click to explore' : 'Click to view data';
  badge.appendChild(hint);

  marker.appendChild(badge);

  // Logo image or text label below badge
  if (district.logo) {
    const logoImg = document.createElement('img');
    logoImg.className = 'district-logo';
    logoImg.src = `location_images/${district.logo}`;
    logoImg.alt = district.label;
    marker.appendChild(logoImg);
  } else {
    const label = document.createElement('div');
    label.className   = 'district-label';
    label.textContent = district.label;
    marker.appendChild(label);
  }

  const activate = () => handleDistrictClick(id);
  marker.addEventListener('click', activate);
  marker.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activate();
    }
  });

  return marker;
}

// Append extra child elements needed by specific CSS motifs
function appendMotifChildren(motifEl, type) {
  if (type === 'duplo') {
    // Third stud (::before and ::after cover two, this covers the third)
    const s = document.createElement('span');
    s.style.cssText = `
      position:absolute; width:10px; height:10px; border-radius:50%;
      background:rgba(255,255,255,0.85); bottom:0; left:50%;
      transform:translateX(-50%);
    `;
    motifEl.appendChild(s);
  }
  if (type === 'basic') {
    // 2x2 stud grid
    for (let i = 0; i < 4; i++) {
      const s = document.createElement('div');
      s.style.cssText = `
        width:11px; height:11px; border-radius:50%;
        background:rgba(255,255,255,0.85);
      `;
      motifEl.appendChild(s);
    }
  }
}

function handleDistrictClick(id) {
  if (activeDistrictId === id) {
    // Clicking the same district again closes it
    closeDistrict();
    return;
  }
  activeDistrictId = id;
  const district = DISTRICTS[id];
  zoomToDistrict(district);
  openPanel(id);
}

function zoomToDistrict(district) {
  pauseParallax();

  const wrapper = document.querySelector('.island-svg-wrapper');
  const scene   = document.querySelector('.scene');

  // Reset any existing transform first (in case switching districts)
  wrapper.style.transition = 'none';
  wrapper.style.transform  = 'translate(-50%, -50%) scale(1)';

  // Force reflow so the reset takes effect before we animate
  void wrapper.offsetHeight;

  // Compute where the district center sits in viewport coordinates
  const wrapperRect = wrapper.getBoundingClientRect();
  const scaleX = wrapperRect.width  / SVG_W;
  const scaleY = wrapperRect.height / SVG_H;

  const districtVpX = wrapperRect.left + district.cx * scaleX;
  const districtVpY = wrapperRect.top  + district.cy * scaleY;

  // We want to:
  // 1. Scale up 2x around the district center
  // 2. Shift the district center to the left side of the viewport (right panel takes 440px)
  const panelWidth   = parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--panel-width'), 10) || 440;
  const targetCenterX = (window.innerWidth - panelWidth) / 2;
  const targetCenterY = window.innerHeight / 2;

  const SCALE = 2.0;

  // After scaling around (districtVpX, districtVpY), the point moves to itself.
  // We then translate so it lands at (targetCenterX, targetCenterY).
  // Using transform-origin at the district point simplifies the math:
  wrapper.style.transformOrigin = `${districtVpX - wrapperRect.left}px ${districtVpY - wrapperRect.top}px`;
  const shiftX = targetCenterX - districtVpX;
  const shiftY = targetCenterY - districtVpY;

  wrapper.style.transition = 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)';
  wrapper.style.transform  = `translate(calc(-50% + ${shiftX}px), calc(-50% + ${shiftY}px)) scale(${SCALE})`;

  scene.classList.add('zoomed');
}

function resetZoom() {
  activeDistrictId = null;

  const wrapper = document.querySelector('.island-svg-wrapper');
  const scene   = document.querySelector('.scene');

  wrapper.style.transition    = 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)';
  wrapper.style.transform     = 'translate(-50%, -50%) scale(1)';
  wrapper.style.transformOrigin = 'center center';

  scene.classList.remove('zoomed');

  // Re-enable parallax after animation settles
  setTimeout(resumeParallax, 520);
}

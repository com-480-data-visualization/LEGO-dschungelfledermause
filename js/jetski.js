(function () {
  // Routes in SVG coordinate space (viewBox 0 0 1100 720).
  // The island occupies roughly x:80-1020, y:50-568.
  // Every route passes through a CORNER water pocket only — entering from one
  // viewport edge and exiting through an adjacent edge — so the path never
  // crosses the island landmass.
  // [x0, y0, x1, y1, image]
  const ROUTES = [
    // ── Top-left corner  (left-edge ↔ top-edge) ───────────────────────────
    // right-facing: enters left, climbs toward top edge
    [-160, 180,  230, -90, 'legoJetski.png'],
    // left-facing: enters top, descends toward left edge
    [ 230, -90, -160, 180, 'legoJetskiMirror.png'],

    // ── Top-right corner (top-edge ↔ right-edge) ──────────────────────────
    // right-facing: enters top, descends toward right edge
    [ 870, -90, 1260, 180, 'legoJetski.png'],
    // left-facing: enters right, climbs toward top edge
    [1260, 180,  870, -90, 'legoJetskiMirror.png'],

    // ── Bottom-left corner (left-edge ↔ bottom-edge) ──────────────────────
    // right-facing: enters left, angles down toward bottom edge
    [-160, 520,  210, 810, 'legoJetski.png'],
    // left-facing: enters bottom, angles up toward left edge
    [ 210, 810, -160, 520, 'legoJetskiMirror.png'],
  ];

  function rand(min, max) { return min + Math.random() * (max - min); }

  function svgToVP(svgX, svgY) {
    const el = document.querySelector('.island-svg-wrapper');
    if (!el) return { x: svgX, y: svgY };
    const r = el.getBoundingClientRect();
    return {
      x: r.left + (svgX / 1100) * r.width,
      y: r.top  + (svgY / 720)  * r.height,
    };
  }

  // Spawn a three-element wake cluster (centre + two V-arms) at (cx, cy).
  // The wake elements expand and fade, creating a classic boat-wake V.
  function spawnWake(cx, cy, angleRad) {
    const deg  = angleRad * 180 / Math.PI;
    const px   = -Math.sin(angleRad); // perpendicular X
    const py   =  Math.cos(angleRad); // perpendicular Y

    [
      // centre foam streak
      { ox: 0,      oy: 0,      w: 34, h: 11, endS: 2.6, dur: 1050, a: 0.52 },
      // left V-arm
      { ox: px * 22, oy: py * 22, w: 26, h:  8, endS: 3.0, dur: 1300, a: 0.36 },
      // right V-arm
      { ox:-px * 22, oy:-py * 22, w: 26, h:  8, endS: 3.0, dur: 1300, a: 0.36 },
    ].forEach(({ ox, oy, w, h, endS, dur, a }) => {
      const el = document.createElement('div');
      el.style.cssText = `
        position:fixed;
        left:${cx + ox}px;top:${cy + oy}px;
        width:${w}px;height:${h}px;
        border-radius:50%;
        background:rgba(215,238,255,${a});
        transform:translate(-50%,-50%) rotate(${deg}deg) scale(0.35);
        pointer-events:none;z-index:3;
      `;
      document.body.appendChild(el);
      el.animate(
        [
          { transform: `translate(-50%,-50%) rotate(${deg}deg) scale(0.35)`, opacity: a  },
          { transform: `translate(-50%,-50%) rotate(${deg}deg) scale(${endS})`, opacity: 0 },
        ],
        { duration: dur, easing: 'ease-out', fill: 'forwards' }
      );
      setTimeout(() => el.remove(), dur + 60);
    });
  }

  function spawnJetski() {
    const route   = ROUTES[Math.floor(Math.random() * ROUTES.length)];
    const s       = svgToVP(route[0], route[1]);
    const e       = svgToVP(route[2], route[3]);
    const dx      = e.x - s.x;
    const dy      = e.y - s.y;
    const angle   = Math.atan2(dy, dx);
    const dur     = rand(3800, 5400);
    const t0      = performance.now();
    let   lastW   = 0;

    const img = document.createElement('img');
    img.src = `location_images/${route[4]}`;
    img.style.cssText = `
      position:fixed;
      width:115px;height:auto;
      transform:translate(-50%,-50%);
      pointer-events:none;z-index:3;
      image-rendering:auto;
    `;
    document.body.appendChild(img);

    function tick(now) {
      const t   = Math.min((now - t0) / dur, 1);
      const cx  = s.x + dx * t;
      const cy  = s.y + dy * t;

      img.style.left = cx + 'px';
      img.style.top  = cy + 'px';

      // Wake cluster every 155 ms, placed just behind the trailing edge
      if (now - lastW > 155) {
        lastW = now;
        spawnWake(
          cx - Math.cos(angle) * 55,
          cy - Math.sin(angle) * 30,
          angle
        );
      }

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        img.remove();
      }
    }

    requestAnimationFrame(tick);
  }

  function schedule() {
    setTimeout(() => { spawnJetski(); schedule(); }, rand(14000, 32000));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(schedule, 4000));
  } else {
    setTimeout(schedule, 4000);
  }
})();

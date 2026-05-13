(function () {
  const KONAMI = [
    'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
    'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
    'KeyB','KeyA',
  ];
  let progress = 0;
  let active = false;

  document.addEventListener('keydown', e => {
    if (e.code === KONAMI[progress]) {
      progress++;
      if (progress === KONAMI.length) {
        progress = 0;
        if (!active) triggerEasterEgg();
      }
    } else {
      progress = e.code === KONAMI[0] ? 1 : 0;
    }
  });

  function triggerEasterEgg() {
    active = true;

    const overlay = document.createElement('div');
    overlay.id = 'easter-egg-overlay';

    const img = document.createElement('img');
    img.src = 'location_images/favicon.png';
    img.id = 'easter-egg-face';
    img.alt = '';

    const text = document.createElement('div');
    text.id = 'easter-egg-text';
    text.textContent = 'Sir I am built different';

    const hint = document.createElement('div');
    hint.id = 'easter-egg-hint';
    hint.textContent = 'click anywhere to dismiss';

    overlay.appendChild(img);
    overlay.appendChild(text);
    overlay.appendChild(hint);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('active');
      });
    });

    setTimeout(() => text.classList.add('visible'), 700);
    setTimeout(() => hint.classList.add('visible'), 1400);

    overlay.addEventListener('click', dismiss);
    setTimeout(dismiss, 5000);

    function dismiss() {
      if (!overlay.isConnected) return;
      overlay.removeEventListener('click', dismiss);
      overlay.classList.add('exit');
      setTimeout(() => {
        overlay.remove();
        active = false;
      }, 500);
    }
  }
})();

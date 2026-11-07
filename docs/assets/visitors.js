/* Load the owner's real visitor widget only on the published hostname. */
(() => {
  const section = document.querySelector('[data-visitor-key]');
  if (!section) return;
  const hosts = section.dataset.visitorHosts.split(',');
  if (location.protocol !== 'https:' || !hosts.includes(location.hostname)) {
    section.dataset.visitorState = 'preview';
    return;
  }

  const root = document.getElementById('visitor-globe');
  const fallback = document.getElementById('local-globe');
  const localControls = document.querySelector('.globe-controls');
  const controls = document.querySelector('.visitor-controls');
  const pauseButton = document.getElementById('visitor-pause');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let ready = false;
  let userPaused = reducedMotion.matches;
  let inView = false;
  let motionFrame = 0;

  function syncMotion() {
    motionFrame = 0;
    const jq = window.globe_jq;
    if (!ready || !jq?.fn?.velocity) return;
    const pause = userPaused || !inView || document.hidden;
    jq('#visitor-globe .mmvst_map_f, #visitor-globe .mmvst_map_b, #visitor-globe .mmvst_dots')
      .velocity(pause ? 'pause' : 'resume', true);
    pauseButton.textContent = userPaused ? 'Rotate' : 'Pause';
    pauseButton.setAttribute('aria-label', userPaused ? 'Start visitor globe rotation' : 'Pause visitor globe rotation');
  }

  function scheduleMotion() {
    if (!motionFrame) motionFrame = requestAnimationFrame(syncMotion);
  }

  function revealIfReady() {
    const link = root.querySelector('#mmvst_a');
    const inner = root.querySelector('.mmvst_inner');
    if (!link || !inner || ready) return;
    // The provider sets this link only after its server responds for this site.
    if (link.href !== section.dataset.visitorStats) return;
    clearTimeout(timeout);
    section.dataset.visitorState = 'connected';
    // The provider reveals its globe when the visitor reaches the footer.
    if (getComputedStyle(inner).display === 'none') return;
    ready = true;
    section.dataset.visitorState = 'ready';
    root.setAttribute('aria-hidden', 'false');
    fallback.hidden = true;
    localControls.hidden = true;
    controls.hidden = false;
    section.querySelector('.eyebrow').textContent = 'Visitors';
    section.setAttribute('aria-label', 'Visitor map and statistics');
    // Show the full globe immediately; pausing must not freeze its entrance at scale 0.
    const jq = window.globe_jq;
    if (jq?.fn?.velocity) {
      jq('#visitor-globe .mmvst_globe').velocity('stop', true)
        .css({ visibility: 'visible', opacity: 1, transform: 'scale(1)' });
    }
    link.setAttribute('aria-label', 'View visitor statistics');
    link.target = '_blank';
    link.rel = 'noopener';
    document.dispatchEvent(new Event('visitor-globe-ready'));
    observer.disconnect();
    clearTimeout(timeout);
    scheduleMotion();
  }

  const observer = new MutationObserver(revealIfReady);
  observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['href', 'style'] });
  const timeout = setTimeout(() => {
    if (!ready) section.dataset.visitorState = 'unavailable';
  }, 20000);

  pauseButton.addEventListener('click', () => {
    userPaused = !userPaused;
    syncMotion();
  });
  reducedMotion.addEventListener('change', event => {
    userPaused = event.matches;
    scheduleMotion();
  });
  // Keep the provider's hover/scroll animation compatible with our pause control.
  root.addEventListener('pointerleave', scheduleMotion);
  window.addEventListener('scroll', scheduleMotion, { passive: true });
  window.addEventListener('load', scheduleMotion, { once: true });
  document.addEventListener('visibilitychange', scheduleMotion);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      scheduleMotion();
    }).observe(root);
  } else {
    inView = true;
  }

  const source = new URL('https://mapmyvisitors.com/globe.js');
  source.searchParams.set('d', section.dataset.visitorKey);
  source.searchParams.set('w', '200');
  const script = document.createElement('script');
  script.id = 'mmvst_globe';
  script.src = source.href;
  script.async = true;
  script.onerror = () => { section.dataset.visitorState = 'unavailable'; };
  section.dataset.visitorState = 'loading';
  // Load immediately, even when the footer is offscreen. Never retry/count twice.
  root.appendChild(script);
})();

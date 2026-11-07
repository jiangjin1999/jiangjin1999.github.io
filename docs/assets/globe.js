/* Offline, decorative globe. No analytics, visitor data, or network requests. */
(() => {
  const canvas = document.getElementById("world-globe");
  const points = window.HOMEPAGE_GLOBE_POINTS;
  if (!canvas || !points?.length) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const controls = document.querySelector(".globe-controls");
  const pauseButton = document.getElementById("globe-pause");
  const fallback = document.querySelector(".globe-fallback");
  let angle = -100 * Math.PI / 180;
  let tilt = 15 * Math.PI / 180;
  let paused = reducedMotion.matches;
  let replaced = false;
  let inView = false;
  let dragging = false;
  let previousX = 0;
  let previousY = 0;
  let previousTime = 0;
  let frame = 0;
  const size = 200;
  const radius = 83;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = size * pixelRatio;
  canvas.height = size * pixelRatio;
  ctx.scale(pixelRatio, pixelRatio);

  function project(x, y, z) {
    const rx = x * Math.cos(angle) + z * Math.sin(angle);
    const rz = -x * Math.sin(angle) + z * Math.cos(angle);
    return [
      size / 2 + rx * radius,
      size / 2 - (y * Math.cos(tilt) - rz * Math.sin(tilt)) * radius,
      y * Math.sin(tilt) + rz * Math.cos(tilt),
    ];
  }

  const graticules = [];
  for (let latitude = -60; latitude <= 60; latitude += 30) {
    const lat = latitude * Math.PI / 180;
    graticules.push(Array.from({length: 121}, (_, i) => {
      const lon = i * Math.PI / 60;
      return [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
    }));
  }
  for (let longitude = 0; longitude < 360; longitude += 30) {
    const lon = longitude * Math.PI / 180;
    graticules.push(Array.from({length: 61}, (_, i) => {
      const lat = (i - 30) * Math.PI / 60;
      return [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, size, size);
    const sea = ctx.createRadialGradient(74, 62, 5, 100, 100, radius);
    sea.addColorStop(0, "#fafcfd");
    sea.addColorStop(0.7, "#eef3f6");
    sea.addColorStop(1, "#dee8ee");
    ctx.beginPath();
    ctx.arc(100, 100, radius, 0, Math.PI * 2);
    ctx.fillStyle = sea;
    ctx.fill();
    ctx.strokeStyle = "#d5e0e7";
    ctx.lineWidth = 0.65;
    ctx.stroke();

    ctx.strokeStyle = "rgba(104, 137, 159, 0.13)";
    ctx.lineWidth = 0.45;
    for (const line of graticules) {
      ctx.beginPath();
      let connected = false;
      for (const point of line) {
        const [x, y, depth] = project(...point);
        if (depth <= 0.01) { connected = false; continue; }
        if (connected) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
        connected = true;
      }
      ctx.stroke();
    }
    for (const point of points) {
      const [x, y, depth] = project(...point);
      if (depth <= 0) continue;
      ctx.beginPath();
      ctx.arc(x, y, 0.48 + depth * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(70, 109, 139, ${0.3 + depth * 0.65})`;
      ctx.fill();
    }
  }

  function animate(time) {
    frame = 0;
    if (replaced || !inView || document.hidden || paused || dragging) return;
    if (!previousTime) previousTime = time;
    const delta = time - previousTime;
    if (delta >= 32) {
      angle += Math.min(delta, 80) * 0.0001;
      previousTime = time;
      draw();
    }
    frame = requestAnimationFrame(animate);
  }

  function schedule() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    if (inView && !document.hidden && !paused && !dragging) {
      frame = requestAnimationFrame(animate);
    }
  }

  function updateControl() {
    pauseButton.textContent = paused ? "Rotate" : "Pause";
    pauseButton.setAttribute("aria-label", paused ? "Start globe rotation" : "Pause globe rotation");
    schedule();
  }

  pauseButton.addEventListener("click", () => {
    paused = !paused;
    updateControl();
  });
  canvas.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    dragging = true;
    previousX = event.clientX;
    previousY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("dragging");
    schedule();
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!dragging || !event.isPrimary) return;
    angle += (event.clientX - previousX) * 0.012;
    if (event.pointerType !== "touch") {
      tilt = Math.max(-0.85, Math.min(0.85, tilt + (event.clientY - previousY) * 0.008));
    }
    previousX = event.clientX;
    previousY = event.clientY;
    draw();
  });
  function endDrag() {
    dragging = false;
    canvas.classList.remove("dragging");
    schedule();
  }
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener("lostpointercapture", endDrag);
  canvas.addEventListener("keydown", (event) => {
    const arrows = {ArrowLeft: -0.18, ArrowRight: 0.18, ArrowUp: -0.12, ArrowDown: 0.12};
    if (!(event.key in arrows)) return;
    event.preventDefault();
    paused = true;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") angle += arrows[event.key];
    else tilt = Math.max(-0.85, Math.min(0.85, tilt + arrows[event.key]));
    draw();
    updateControl();
  });
  reducedMotion.addEventListener("change", (event) => {
    paused = event.matches;
    updateControl();
  });
  document.addEventListener("visibilitychange", schedule);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      schedule();
    }).observe(canvas);
  } else {
    inView = true;
  }

  document.addEventListener("visitor-globe-ready", () => {
    replaced = true;
    paused = true;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }, { once: true });

  draw();
  canvas.hidden = false;
  fallback.hidden = true;
  controls.hidden = false;
  updateControl();
})();

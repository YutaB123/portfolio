// hero3d.js — Hybrid Three.js hero scene: a drifting particle field plus one
// slow-rotating low-poly focal crystal, both reactive to the mouse and to scroll.
//
// Guardrails baked in:
//   - Skips entirely on reduced-motion or when WebGL is unavailable (CSS blobs show instead).
//   - Pixel ratio capped; particle count scaled down on mobile.
//   - Render loop pauses when the hero is offscreen and when the tab is hidden — never
//     burns GPU or blocks the rest of the page.
//   - Shares GSAP's ticker when present (one rAF for the whole page); falls back to its own.
//   - Fully disposes geometry / materials / textures / renderer on teardown.
//   - Renderer sized to the canvas's CSS box (no layout shift).
import * as THREE from "three";

(function () {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.querySelector(".hero-canvas");
  // The scene lives in the sticky black photo panel now (falls back to .hero).
  const hero = document.querySelector(".split-photo") || document.querySelector(".hero");

  // ---- Bail-out paths that fall back to the static CSS hero ----
  function hasWebGL() {
    try {
      const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) {
      return false;
    }
  }

  if (reduceMotion || !canvas || !hero) return;
  if (!hasWebGL()) {
    root.classList.add("no-webgl");
    return;
  }

  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  // The panel is sticky (visible through the whole scroll), so keep the count modest.
  const PARTICLE_COUNT = isMobile ? 900 : 2600;
  const PALETTE = [0xd4af37, 0xe7c65b, 0xb8902f, 0xf0d878, 0xfff3cf]; // gold tones

  let renderer, scene, camera;
  let particles, particleGeo, particleMat, particleTex;
  let crystal, crystalGeo, crystalMat;
  let lights = [];
  const clock = new THREE.Clock();

  // pointer + scroll state (eased toward targets each frame)
  const pointer = { tx: 0, ty: 0, x: 0, y: 0 };
  let scrollDrift = 0;

  let running = false;
  let usingGsapTicker = false;

  // ---- Soft round sprite for the particles (so they aren't hard squares) ----
  function makeParticleTexture() {
    const size = 64;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.9)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function buildParticles() {
    particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const col = new THREE.Color();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 18;
      positions[i3 + 1] = (Math.random() - 0.5) * 11;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;
      col.setHex(PALETTE[(Math.random() * PALETTE.length) | 0]);
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    particleTex = makeParticleTexture();
    particleMat = new THREE.PointsMaterial({
      size: isMobile ? 0.08 : 0.07,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending, // gold particles glow on the black panel
    });
    particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
  }

  function buildCrystal() {
    // Low-poly icosahedron, flat-shaded, lit from two coloured sides for a cinematic sheen.
    crystalGeo = new THREE.IcosahedronGeometry(1.25, 0);
    crystalMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,        // gold gem
      metalness: 0.95,
      roughness: 0.28,
      flatShading: true,
      emissive: 0x3a2a06,
      emissiveIntensity: 0.5,
    });
    crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.set(isMobile ? 0 : 2.6, isMobile ? 1.8 : 0.9, -0.5);
    scene.add(crystal);

    const ambient = new THREE.AmbientLight(0xfff4d6, 0.5);
    const keyLight = new THREE.PointLight(0xffe6a0, 75, 40);  // warm gold key
    keyLight.position.set(5, 4, 6);
    const rimLight = new THREE.PointLight(0xfff7e0, 35, 40);  // soft warm rim
    rimLight.position.set(-4, -2, 4);
    lights = [ambient, keyLight, rimLight];
    lights.forEach((l) => scene.add(l));
  }

  function sizeToCanvas() {
    const w = canvas.clientWidth || hero.clientWidth;
    const h = canvas.clientHeight || hero.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false); // false: don't touch canvas CSS size → no layout shift
  }

  function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: !isMobile,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0); // transparent — page background shows through
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));

    buildParticles();
    sizeToCanvas();

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    // Pause rendering whenever the hero scrolls out of view.
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => (e.isIntersecting ? start() : stop()));
        },
        { threshold: 0.01 }
      );
      io.observe(hero);
    } else {
      start();
    }

    onScroll();
    start();

    // The canvas now covers the hero — drop the redundant CSS blob layer to save GPU.
    root.classList.add("webgl-on");

    window.Hero3D = { start, stop, dispose, get running() { return running; } };
    window.dispatchEvent(new CustomEvent("hero3d:ready"));
  }

  // ---- Event handlers ----
  let resizeQueued = false;
  function onResize() {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => {
      resizeQueued = false;
      sizeToCanvas();
    });
  }
  function onPointerMove(e) {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }
  function onScroll() {
    const h = hero.offsetHeight || 1;
    scrollDrift = Math.min(window.scrollY / h, 1.2);
  }
  function onVisibility() {
    if (document.hidden) stop();
    else if (isHeroVisible()) start();
  }
  function isHeroVisible() {
    const r = hero.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }

  // ---- Render loop (shares GSAP ticker when available) ----
  function tick() {
    const t = clock.getElapsedTime();

    // ease pointer
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    if (particles) {
      particles.rotation.y = t * 0.03 + pointer.x * 0.35;
      particles.rotation.x = pointer.y * 0.2;
      particles.position.y = scrollDrift * 2.2;          // drift up as you scroll
      particleMat.opacity = 0.9 * Math.max(0, 1 - scrollDrift * 0.9);
    }
    if (crystal) {
      crystal.rotation.y = t * 0.25 + pointer.x * 0.4;
      crystal.rotation.x = t * 0.15 + pointer.y * 0.3;
      const s = 1 + Math.sin(t * 0.8) * 0.04;            // gentle breathing
      crystal.scale.setScalar(s);
      crystal.position.y = (isMobile ? 1.8 : 0.8) + scrollDrift * 1.5;
    }

    // subtle camera parallax
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.05;
    camera.position.y += (-pointer.y * 0.4 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  function start() {
    if (running) return;
    running = true;
    clock.getDelta();
    if (window.gsap && window.gsap.ticker) {
      usingGsapTicker = true;
      window.gsap.ticker.add(tick);
    } else {
      usingGsapTicker = false;
      rafLoop();
    }
  }
  let rafId = 0;
  function rafLoop() {
    if (!running || usingGsapTicker) return;
    tick();
    rafId = requestAnimationFrame(rafLoop);
  }
  function stop() {
    if (!running) return;
    running = false;
    if (usingGsapTicker && window.gsap && window.gsap.ticker) window.gsap.ticker.remove(tick);
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function dispose() {
    stop();
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onVisibility);
    if (particleGeo) particleGeo.dispose();
    if (particleMat) particleMat.dispose();
    if (particleTex) particleTex.dispose();
    if (crystalGeo) crystalGeo.dispose();
    if (crystalMat) crystalMat.dispose();
    lights.forEach((l) => l.dispose && l.dispose());
    if (renderer) renderer.dispose();
    scene = camera = renderer = null;
  }

  window.addEventListener("pagehide", dispose, { once: true });

  // Defer init until after first paint so it never blocks initial load.
  if (document.readyState === "complete") {
    init();
  } else {
    window.addEventListener("load", init, { once: true });
  }
})();

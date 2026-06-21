// animations.js — unified motion controller (GSAP + ScrollTrigger).
//
// Native scrolling (no smooth-scroll library). One rAF (GSAP's ticker, shared with the
// Three.js hero). Everything is feature-detected and degrades cleanly:
//   - reduced motion -> no JS motion; content is fully visible (CSS handles it).
//   - GSAP missing   -> IntersectionObserver reveals + a light CSS-tilt fallback.
//   - touch / coarse pointer  -> no custom cursor, magnetic, or hover-tilt; reveals + intro stay.
(function () {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // ---- ONE motion language: shared easing + timing tokens ----
  const EASE = { enter: "power3.out", soft: "power2.out", spring: "back.out(1.5)" };
  const DUR = { enter: 0.7, fast: 0.45 };
  const STAGGER = 0.07;

  // ---- Per-letter split for the hero name (visible by default; GSAP animates them in) ----
  function splitLetters() {
    const el = document.querySelector("[data-letters]");
    if (!el || el.dataset.split === "1") return [];
    const text = el.textContent;
    el.textContent = "";
    el.dataset.split = "1";
    const chars = [];
    for (const ch of text) {
      const span = document.createElement("span");
      span.className = "char" + (ch === " " ? " space" : "");
      span.textContent = ch === " " ? " " : ch;
      el.appendChild(span);
      chars.push(span);
    }
    return chars;
  }

  // ======================================================================
  //  Fallback path (no GSAP): IntersectionObserver reveal + light CSS tilt
  // ======================================================================
  function revealFallback() {
    const items = Array.from(document.querySelectorAll(".reveal"));
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries, obs) => {
        let shown = 0;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.style.setProperty("--reveal-delay", Math.min(shown, 6) * 70 + "ms");
          el.classList.add("in");
          obs.unobserve(el);
          shown++;
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el) => io.observe(el));
  }

  function tiltFallback() {
    if (!finePointer) return;
    const MAX = 6;
    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          `perspective(900px) rotateX(${(-py * MAX).toFixed(2)}deg) rotateY(${(px * MAX).toFixed(2)}deg) translateY(-6px)`;
        card.classList.add("tilt");
      });
      card.addEventListener("pointerleave", () => {
        card.classList.remove("tilt");
        card.style.transform = "";
      });
    });
  }

  function navScrollFallback() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    let ticking = false;
    function update() {
      header.classList.toggle("scrolled", window.scrollY > 20);
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  // ======================================================================
  //  GSAP path
  // ======================================================================
  function runIntro(gsap, chars) {
    const blocks = [".eyebrow", ".hero-role", ".lede", ".hero-actions", ".socials"];
    // Set initial hidden state with inline styles (wins over the .is-loading CSS), then reveal.
    gsap.set(".hero-canvas", { opacity: 0 });
    gsap.set(".hero h1", { opacity: 1 });
    gsap.set(blocks, { opacity: 0, y: 18 });
    gsap.set(".photo-wrap", { opacity: 0, y: 26, scale: 0.94 });
    if (chars.length) gsap.set(chars, { opacity: 0, yPercent: 60, rotate: 6 });
    root.classList.remove("is-loading");

    const tl = gsap.timeline({ defaults: { ease: EASE.enter } });
    tl.to(".hero-canvas", { opacity: 1, duration: 0.9 }, 0)
      .to(".eyebrow", { opacity: 1, y: 0, duration: 0.6 }, 0.15)
      .to(chars, { opacity: 1, yPercent: 0, rotate: 0, duration: 0.6, stagger: 0.035 }, 0.25)
      .to([".hero-role", ".lede"], { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, "-=0.1")
      .to(".hero-actions", { opacity: 1, y: 0, duration: 0.6 }, "-=0.2")
      .to(".socials", { opacity: 1, y: 0, duration: 0.5 }, "-=0.3")
      .to(".photo-wrap", { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: EASE.spring }, 0.35);

    // Gentle perpetual headshot float once it has settled (GSAP owns the transform now).
    tl.add(() => {
      gsap.to(".photo-wrap", {
        y: "-=12", duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1,
      });
    });
  }

  function setupReveal(gsap) {
    const ST = window.ScrollTrigger;
    if (!ST) { revealFallback(); return; }

    // Per-element `once` triggers — the most reliable reveal pattern. A small per-row
    // stagger (by column index) keeps the cascade without batch's missed-element edge case.
    gsap.utils.toArray(".reveal").forEach((el) => {
      const col = el.classList.contains("card") ? colIndex(el) : 0;
      gsap.to(el, {
        opacity: 1, y: 0, duration: DUR.enter, ease: EASE.enter,
        delay: col * STAGGER,
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
      const chips = el.querySelectorAll(".tags li");
      if (chips.length) {
        gsap.from(chips, {
          opacity: 0, y: 8, scale: 0.9, duration: 0.4, ease: EASE.soft, stagger: 0.04,
          delay: col * STAGGER + 0.1,
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      }
    });

    // Recompute trigger positions once everything (fonts/images) has settled.
    window.addEventListener("load", () => ST.refresh());
    setTimeout(() => ST.refresh(), 400);
  }

  // Column of a card within its CSS grid row (for a gentle left-to-right cascade).
  function colIndex(card) {
    const grid = card.parentElement;
    if (!grid) return 0;
    const cards = Array.from(grid.children);
    const perRow = Math.max(1, Math.round(grid.clientWidth / card.offsetWidth) || 1);
    return cards.indexOf(card) % perRow;
  }

  function setupCards(gsap) {
    if (!finePointer) return;
    const MAX = 7;
    document.querySelectorAll(".card").forEach((card) => {
      const img = card.querySelector(".card-banner img");
      const title = card.querySelector(".card-body h3");
      const tags = card.querySelector(".tags");

      // Spring-eased setters (quickTo) — buttery, GPU-friendly.
      const rX = gsap.quickTo(card, "rotationX", { duration: 0.4, ease: EASE.soft });
      const rY = gsap.quickTo(card, "rotationY", { duration: 0.4, ease: EASE.soft });
      const imgX = img && gsap.quickTo(img, "x", { duration: 0.5, ease: EASE.soft });
      const titleX = title && gsap.quickTo(title, "x", { duration: 0.5, ease: EASE.soft });
      const titleY = title && gsap.quickTo(title, "y", { duration: 0.5, ease: EASE.soft });
      const tagsX = tags && gsap.quickTo(tags, "x", { duration: 0.5, ease: EASE.soft });
      const tagsY = tags && gsap.quickTo(tags, "y", { duration: 0.5, ease: EASE.soft });

      gsap.set(card, { transformPerspective: 900 });
      if (img) gsap.set(img, { scale: 1.08 }); // headroom so parallax never reveals edges

      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rX(-py * MAX);
        rY(px * MAX);
        // depth parallax: image moves most, title medium, tags least
        if (imgX) imgX(px * 16);
        if (titleX) titleX(px * 10);
        if (titleY) titleY(py * 6);
        if (tagsX) tagsX(px * 6);
        if (tagsY) tagsY(py * 4);
        card.classList.add("tilt");
      });
      card.addEventListener("pointerleave", () => {
        rX(0); rY(0);
        if (imgX) imgX(0);
        if (titleX) { titleX(0); titleY(0); }
        if (tagsX) { tagsX(0); tagsY(0); }
        card.classList.remove("tilt");
      });
    });
  }

  function setupHeadshotTilt(gsap) {
    if (!finePointer) return;
    const wrap = document.querySelector(".photo-wrap");
    if (!wrap) return;
    // Photo and cursor live in different columns now — drive the tilt off the viewport.
    const rX = gsap.quickTo(wrap, "rotationX", { duration: 0.6, ease: EASE.soft });
    const rY = gsap.quickTo(wrap, "rotationY", { duration: 0.6, ease: EASE.soft });
    gsap.set(wrap, { transformPerspective: 900 });
    window.addEventListener("pointermove", (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      rX(-ny * 8);
      rY(nx * 10);
    }, { passive: true });
  }


  function setupMagnetic(gsap) {
    if (!finePointer) return;
    document.querySelectorAll(".hero-actions .btn").forEach((btn) => {
      const x = gsap.quickTo(btn, "x", { duration: 0.4, ease: EASE.soft });
      const y = gsap.quickTo(btn, "y", { duration: 0.4, ease: EASE.soft });
      const PULL = 0.4;
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        x((e.clientX - (r.left + r.width / 2)) * PULL);
        y((e.clientY - (r.top + r.height / 2)) * PULL);
      });
      btn.addEventListener("pointerleave", () => { x(0); y(0); });
    });
  }

  // Hovering any button makes the headshot crossfade into the smiling photo.
  function setupSmile() {
    const targets = document.querySelectorAll(".btn, .nav-cta, .card-link.try, .card-link.demo");
    if (!targets.length) return;
    const on = () => document.body.classList.add("show-smile");
    const off = () => document.body.classList.remove("show-smile");
    targets.forEach((el) => {
      el.addEventListener("pointerenter", on);
      el.addEventListener("pointerleave", off);
      el.addEventListener("focus", on);
      el.addEventListener("blur", off);
    });

    // Clicking the headshot toggles the smiling photo (persists, independent of hover).
    const photo = document.querySelector(".photo-wrap");
    if (photo) {
      photo.addEventListener("click", () => document.body.classList.toggle("smile-locked"));
    }
  }

  function setupNav(gsap) {
    const header = document.querySelector(".site-header");
    if (!header) return;
    if (!window.ScrollTrigger) { navScrollFallback(); return; }
    window.ScrollTrigger.create({
      start: "top -20",
      onUpdate: (self) => header.classList.toggle("scrolled", self.scroll() > 20),
      onToggle: (self) => header.classList.toggle("scrolled", self.isActive),
    });
    header.classList.toggle("scrolled", window.scrollY > 20);
  }

  // ======================================================================
  //  Boot
  // ======================================================================
  function init() {
    const gsap = window.gsap;

    // Reduced motion: do nothing — CSS already shows all content statically.
    if (reduceMotion) { root.classList.remove("is-loading"); return; }

    if (gsap) {
      root.classList.add("gsap");
      if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
      const chars = splitLetters();
      // Native scrolling only — no Lenis. Smooth-scroll inertia made the page feel
      // heavy/laggy to scroll; native wheel + trackpad is instant and responsive.
      runIntro(gsap, chars);
      setupReveal(gsap);
      setupCards(gsap);
      setupHeadshotTilt(gsap);
      setupMagnetic(gsap);
      setupNav(gsap);
    } else {
      // No GSAP — graceful, still-animated fallback.
      root.classList.remove("is-loading");
      revealFallback();
      tiltFallback();
      navScrollFallback();
    }
    // Button-hover → headshot smiles (works on both paths).
    setupSmile();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

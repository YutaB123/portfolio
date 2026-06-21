// gallery.js — Projects shown as a CSS-3D "scatter / coverflow" gallery on a
// black stage. Pure DOM + CSS transforms (no WebGL). Driven from the existing
// .card markup so titles/images/tags/links stay the single source of truth.
//
// Guardrails:
//   - Falls back to the original card grid on reduced motion or load error.
//   - The grid stays listed below the gallery (accessible fallback + full detail).
//   - Drag / arrow keys / dots to browse; click (or Enter) opens the focused
//     project's primary action (live link or demo lightbox).
//   - The stage backdrop is the React Bits "Lightfall" shader (WebGL); if WebGL
//     is unavailable it just falls back to the stage's dark CSS background.
import { createLightfall } from './lightfall.js';

const SPACING = 250; // horizontal gap between cards (px)

// ---- Build the item list from the existing project cards (single source of truth) ----
function readProjectsFromCards(grid) {
  return Array.from(grid.querySelectorAll('.card'))
    .map(card => {
      const img = card.querySelector('.card-banner img');
      const title = card.querySelector('.card-body h3');
      if (!img || !title) return null;

      const tagEl = card.querySelector('.tags li');
      const descEl = card.querySelector('.card-body > p');

      // Prefer a "Try it live" link, then the first live link, then a demo, then code.
      const demoEl = card.querySelector('[data-demo]');
      const tryLink = card.querySelector('.card-link.try');
      const liveLink = card.querySelector('.card-link:not(.code):not(.demo)');
      const codeLink = card.querySelector('.card-link.code');

      let action = null;
      if (tryLink && tryLink.href) action = { type: 'href', value: tryLink.href };
      else if (liveLink && liveLink.href) action = { type: 'href', value: liveLink.href };
      else if (demoEl) action = { type: 'demo', value: demoEl.getAttribute('data-demo') };
      else if (codeLink && codeLink.href) action = { type: 'href', value: codeLink.href };

      return {
        image: img.currentSrc || img.src,
        title: title.textContent.trim(),
        tag: tagEl ? tagEl.textContent.trim() : '',
        desc: descEl ? descEl.textContent.trim() : '',
        action
      };
    })
    .filter(Boolean);
}

function runItemAction(item) {
  if (!item || !item.action) return;
  if (item.action.type === 'demo') {
    if (typeof window.openProjectDemo === 'function') {
      window.openProjectDemo(item.action.value);
      return;
    }
    const trigger = document.querySelector(`[data-demo="${item.action.value}"]`);
    if (trigger) trigger.click();
  } else if (item.action.type === 'href') {
    window.open(item.action.value, '_blank', 'noopener');
  }
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

class ScatterGallery {
  constructor(stage, dotsWrap, items, { reduce, onOpen }) {
    this.stage = stage;
    this.items = items;
    this.onOpen = onOpen;
    this.reduce = reduce;

    this.scrollX = 0;
    this.vel = 0;
    this.dragging = false;
    this.snapping = true;
    this.lastX = 0;
    this.moved = 0;
    this.downIndex = 0;
    this.maxScroll = (items.length - 1) * SPACING;

    // Build the layer + cards
    this.layer = document.createElement('div');
    this.layer.className = 'scatter-layer';
    this.cards = items.map(p => {
      const el = document.createElement('article');
      el.className = 'scatter-card';
      el.innerHTML = `
        <div class="scatter-chrome"><span></span><span></span><span></span></div>
        <img class="scatter-shot" src="${escapeHtml(p.image)}" alt="" draggable="false" />
        <div class="scatter-meta"><span class="scatter-title">${escapeHtml(p.title)}</span></div>`;
      this.layer.appendChild(el);
      return el;
    });
    this.stage.appendChild(this.layer);

    // Prev / next arrow buttons (overlaid on the stage).
    const makeArrow = (dir, label) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `scatter-nav ${dir}`;
      btn.setAttribute('aria-label', label);
      btn.innerHTML = dir === 'prev' ? '&#8249;' : '&#8250;';
      // Stop the stage from treating an arrow press as a drag/tap.
      btn.addEventListener('pointerdown', e => e.stopPropagation());
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const idx = Math.round(this.scrollX / SPACING);
        this.snapTo(this.clampI(idx + (dir === 'prev' ? -1 : 1)));
      });
      this.stage.appendChild(btn);
      return btn;
    };
    this.prevBtn = makeArrow('prev', 'Previous project');
    this.nextBtn = makeArrow('next', 'Next project');

    // Dots
    this.pips = items.map((_, i) => {
      const b = document.createElement('button');
      b.className = 'scatter-pip';
      b.type = 'button';
      b.setAttribute('aria-label', `Go to project ${i + 1}`);
      b.addEventListener('click', () => this.snapTo(i));
      dotsWrap.appendChild(b);
      return b;
    });

    this.bindEvents();
    this.render();
    this.raf = requestAnimationFrame(this.loop);
  }

  clampS = v => Math.max(0, Math.min(this.maxScroll, v));
  clampI = i => Math.max(0, Math.min(this.items.length - 1, i));

  render = () => {
    const cards = this.cards;
    for (let i = 0; i < cards.length; i++) {
      const offset = i * SPACING - this.scrollX; // px from center
      const d = offset / SPACING;                // normalized distance
      const ad = Math.abs(d);
      const rotateY = this.reduce ? 0 : Math.max(-1, Math.min(1, d)) * -22;
      const rotateZ = this.reduce ? 0 : Math.max(-1.5, Math.min(1.5, d)) * 2.2;
      const z = this.reduce ? 0 : -ad * 160;
      const scale = 1 - Math.min(ad, 2) * 0.1;
      const opacity = 1; // keep side cards fully opaque (no fade)
      const card = cards[i];
      card.style.transform =
        `translate3d(${offset}px,0,${z}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.zIndex = String(100 - Math.round(ad * 10));
      const focused = ad < 0.5;
      card.classList.toggle('is-focus', focused);
      card.style.pointerEvents = focused ? 'auto' : 'none';
    }
    const idx = Math.round(this.scrollX / SPACING);
    this.pips.forEach((p, i) => p.classList.toggle('on', i === idx));
    if (this.prevBtn) this.prevBtn.disabled = idx <= 0;
    if (this.nextBtn) this.nextBtn.disabled = idx >= this.items.length - 1;
  };

  loop = () => {
    if (!this.dragging) {
      if (this.snapping) {
        const target = this.clampS(Math.round(this.scrollX / SPACING) * SPACING);
        this.scrollX += (target - this.scrollX) * 0.12;
        if (Math.abs(target - this.scrollX) < 0.4) this.scrollX = target;
      } else {
        this.scrollX = this.clampS(this.scrollX - this.vel);
        this.vel *= 0.92;
        if (Math.abs(this.vel) < 0.6) { this.vel = 0; this.snapping = true; }
      }
    }
    this.render();
    this.raf = requestAnimationFrame(this.loop);
  };

  snapTo(i) {
    this.snapping = true;
    this.vel = 0;
    this.scrollX = this.clampS(i * SPACING);
  }

  open(i) {
    if (this.onOpen) this.onOpen(this.items[this.clampI(i)]);
  }

  bindEvents() {
    const stage = this.stage;
    stage.addEventListener('pointerdown', e => {
      this.dragging = true;
      this.snapping = false;
      this.vel = 0;
      this.lastX = e.clientX;
      this.moved = 0;
      this.downIndex = Math.round(this.scrollX / SPACING);
      try { stage.setPointerCapture(e.pointerId); } catch {}
      stage.classList.add('is-grabbing');
    });
    stage.addEventListener('pointermove', e => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastX;
      this.lastX = e.clientX;
      this.moved += Math.abs(dx);
      this.scrollX = this.clampS(this.scrollX - dx);
      this.vel = dx;
    });
    const endDrag = () => {
      if (!this.dragging) return;
      this.dragging = false;
      stage.classList.remove('is-grabbing');
      if (this.moved < 6) {
        this.open(this.downIndex); // treated as a click on the focused card
      } else {
        this.snapping = Math.abs(this.vel) < 4; // small flick → snap, big flick → momentum
      }
    };
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    stage.addEventListener('keydown', e => {
      const idx = Math.round(this.scrollX / SPACING);
      if (e.key === 'ArrowRight') { this.snapTo(this.clampI(idx + 1)); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { this.snapTo(this.clampI(idx - 1)); e.preventDefault(); }
      else if (e.key === 'Enter') { this.open(idx); }
    });
  }
}

function initGallery() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const section = document.querySelector('.projects');
  const stage = document.getElementById('projectGallery');
  const grid = section && section.querySelector('.grid');
  if (reduce || !section || !stage || !grid) return; // keep the card grid

  const items = readProjectsFromCards(grid);
  if (!items.length) return;

  const start = () => {
    // Reveal the stage first so it has real layout dimensions.
    section.classList.add('gallery-active');
    try {
      // Lightfall animated shader backdrop behind the cards.
      const bg = document.createElement('div');
      bg.className = 'lightfall-bg';
      stage.insertBefore(bg, stage.firstChild);
      try {
        createLightfall(bg, {
          colors: ['#A6C8FF', '#5227FF', '#FF9FFC'],
          backgroundColor: '#0A29FF',
          speed: 0.5,
          streakCount: 2,
          streakWidth: 1,
          streakLength: 1,
          glow: 1,
          density: 0.6,
          twinkle: 1,
          zoom: 3,
          backgroundGlow: 0.5,
          opacity: 1,
          mouseInteraction: true,
          mouseStrength: 0.5,
          mouseRadius: 1,
          pointerTarget: stage
        });
      } catch (bgErr) {
        // No WebGL — leave the dark CSS background in place.
        bg.remove();
        console.warn('Lightfall background unavailable; using solid backdrop.', bgErr);
      }

      // Dots row lives right after the caption (the .gallery-hint paragraph).
      const dotsWrap = document.createElement('div');
      dotsWrap.className = 'scatter-dots';
      const hint = section.querySelector('.gallery-hint');
      if (hint && hint.parentNode) hint.parentNode.insertBefore(dotsWrap, hint.nextSibling);
      else stage.parentNode.insertBefore(dotsWrap, stage.nextSibling);

      new ScatterGallery(stage, dotsWrap, items, { reduce, onOpen: runItemAction });

      // The gallery changed the section height; refresh GSAP ScrollTrigger so the
      // project cards' scroll-reveal positions stay correct.
      const refresh = () => {
        if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
          window.ScrollTrigger.refresh();
        }
      };
      requestAnimationFrame(refresh);
      setTimeout(refresh, 500);
    } catch (e) {
      section.classList.remove('gallery-active');
      console.error('ScatterGallery: init failed', e);
    }
  };

  // Wait for screenshots/fonts to settle before measuring, but don't block forever.
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]).then(start);
  } else {
    start();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGallery);
} else {
  initGallery();
}

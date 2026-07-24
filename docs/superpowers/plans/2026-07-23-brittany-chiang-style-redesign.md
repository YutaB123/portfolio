# Brittany Chiang v4-Style Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild yutabanishky.com as a static HTML/CSS/vanilla-JS site matching the design system and structure of v4.brittanychiang.com exactly, populated with Yuta Banishky's real content (resume + existing project copy), then deploy.

**Architecture:** Single-page static site (`index.html`, `styles.css`, `animations.js`, `script.js`). No build step, no framework — her React/Gatsby component behaviors (scroll-reveal, nav shrink, tabs, show-more, hamburger menu) are reimplemented as small vanilla JS functions in `animations.js`. Deployed via Render static site (`render.yaml`, auto-deploys from `origin/main` on GitHub).

**Tech Stack:** HTML5, CSS3 (custom properties, Grid/Flexbox), vanilla JS (`IntersectionObserver`, no dependencies), Google Fonts (Inter, Roboto Mono).

**Source of truth:** `docs/superpowers/specs/2026-07-23-brittany-chiang-style-redesign-design.md`. Design tokens verified against github.com/bchiang7/v4 source. Content verified against `~/Downloads/Yuta Banishky Resume.pdf`.

## Global Constraints

- Colors, fonts, spacing tokens must match the spec's `:root` block exactly (see spec "Design tokens" section) — no invented colors.
- No React/Gatsby, no build step — plain HTML/CSS/JS only, served as static files.
- `prefers-reduced-motion: reduce` must disable the hero stagger-in animation and scroll-reveal (content shows immediately, matching the existing `.is-loading` gate pattern already in `index.html`).
- All existing external project links, GitHub links, and screenshot asset paths must be preserved exactly (they are live URLs — do not alter).
- Keep `script.js` (demo lightbox) unmodified; wire new markup to it via the existing `data-demo="<key>"` attribute convention.
- Delete: `gallery.js`, the GSAP/ScrollTrigger `<script>` tags in `index.html`, the black/gold theme rules in `styles.css`, the sticky split-photo hero markup.
- Final step must `git push` to `origin/main` (Render auto-deploys static sites on push to the connected branch).

---

### Task 1: Base document shell, design tokens, and global styles

**Files:**
- Modify: `index.html:1-50` (head — fonts, meta tags stay, drop nothing here yet)
- Modify: `styles.css` (full replace of the `:root` / reset / body / global-element section — the old black/gold tokens at the top of the current file)

**Interfaces:**
- Produces: CSS custom properties (`--navy`, `--green`, `--slate`, `--lightest-slate`, `--font-sans`, `--font-mono`, `--fz-*`, `--border-radius`, `--nav-height`, `--nav-scroll-height`, `--tab-height`, `--tab-width`, `--transition`, `--easing`) consumed by every later task.
- Produces: reusable utility classes `.btn`, `.btn-sm`, `.link-underline`, `.numbered-heading`, `.reveal` (initial `opacity:0; transform:translateY(20px)` state, removed by JS in Task 9).

- [ ] **Step 1: Update the Google Fonts link in `index.html`**

Replace the existing fonts `<link>` (currently loads Inter + Space Grotesk) with Inter + Roboto Mono:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

- [ ] **Step 2: Replace the top of `styles.css`**

Replace everything from the start of the file through the end of the current base/reset rules (before the first component-specific selector) with:

```css
:root {
  --dark-navy: #020c1b;
  --navy: #0a192f;
  --light-navy: #112240;
  --lightest-navy: #233554;
  --navy-shadow: rgba(2, 12, 27, 0.7);
  --dark-slate: #495670;
  --slate: #8892b0;
  --light-slate: #a8b2d1;
  --lightest-slate: #ccd6f6;
  --white: #e6f1ff;
  --green: #64ffda;
  --green-tint: rgba(100, 255, 218, 0.1);

  --font-sans: 'Inter', -apple-system, system-ui, sans-serif;
  --font-mono: 'Roboto Mono', 'Fira Code', monospace;

  --fz-xxs: 12px;
  --fz-xs: 13px;
  --fz-sm: 14px;
  --fz-md: 16px;
  --fz-lg: 18px;
  --fz-xl: 20px;
  --fz-xxl: 22px;
  --fz-heading: 32px;

  --border-radius: 4px;
  --nav-height: 100px;
  --nav-scroll-height: 70px;
  --tab-height: 42px;
  --tab-width: 120px;
  --easing: cubic-bezier(0.645, 0.045, 0.355, 1);
  --transition: all 0.25s cubic-bezier(0.645, 0.045, 0.355, 1);
}

* { box-sizing: border-box; }

html {
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: var(--dark-slate) var(--navy);
}

::-webkit-scrollbar { width: 12px; }
::-webkit-scrollbar-track { background: var(--navy); }
::-webkit-scrollbar-thumb {
  background-color: var(--dark-slate);
  border: 3px solid var(--navy);
  border-radius: 10px;
}

::selection { background-color: var(--lightest-navy); color: var(--lightest-slate); }

:focus { outline: 2px dashed var(--green); outline-offset: 3px; }
:focus:not(:focus-visible) { outline: none; outline-offset: 0; }
:focus-visible { outline: 2px dashed var(--green); outline-offset: 3px; }

body {
  margin: 0;
  width: 100%;
  min-height: 100%;
  overflow-x: hidden;
  background-color: var(--navy);
  color: var(--slate);
  font-family: var(--font-sans);
  font-size: var(--fz-xl);
  line-height: 1.3;
  -webkit-font-smoothing: antialiased;
}
@media (max-width: 480px) { body { font-size: var(--fz-lg); } }

h1, h2, h3, h4 { margin: 0; color: var(--lightest-slate); font-weight: 600; }
p { margin: 0; }
a { color: inherit; text-decoration: none; }

.numbered-heading {
  display: flex;
  align-items: center;
  position: relative;
  margin: 10px 0 40px;
  width: 100%;
  font-size: clamp(26px, 5vw, var(--fz-heading));
  white-space: nowrap;
}
.numbered-heading:before {
  counter-increment: section;
  content: '0' counter(section) '.';
  margin-right: 10px;
  color: var(--green);
  font-family: var(--font-mono);
  font-weight: 400;
  font-size: clamp(var(--fz-md), 3vw, var(--fz-xl));
}
.numbered-heading:after {
  content: '';
  display: block;
  position: relative;
  top: -5px;
  width: 300px;
  max-width: 300px;
  height: 1px;
  margin-left: 20px;
  background-color: var(--lightest-navy);
}
body { counter-reset: section; }

.link-underline {
  position: relative;
  color: var(--green);
  transition: var(--transition);
}
.link-underline:after {
  content: '';
  display: block;
  width: 0;
  height: 1px;
  position: relative;
  bottom: 0.37em;
  background-color: var(--green);
  opacity: 0.5;
  transition: var(--transition);
}
.link-underline:hover:after { width: 100%; }

.btn, .btn-sm {
  display: inline-block;
  color: var(--green);
  background-color: transparent;
  border: 1px solid var(--green);
  border-radius: var(--border-radius);
  font-family: var(--font-mono);
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition);
}
.btn { padding: 1.25rem 1.75rem; font-size: var(--fz-sm); }
.btn-sm { padding: 0.75rem 1rem; font-size: var(--fz-xs); }
.btn:hover, .btn:focus-visible { box-shadow: 4px 4px 0 0 var(--green); transform: translate(-5px, -5px); outline: none; }
.btn-sm:hover, .btn-sm:focus-visible { box-shadow: 3px 3px 0 0 var(--green); transform: translate(-4px, -4px); outline: none; }

.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s var(--easing), transform 0.6s var(--easing);
}
.reveal.is-visible { opacity: 1; transform: translateY(0); }
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}
```

- [ ] **Step 3: Verify no CSS parse errors**

Run: `node -e "require('fs').readFileSync('styles.css','utf8')"` (sanity read, not a linter — real check is opening in-browser in Task 9)
This just confirms the file isn't corrupted; visual verification happens once markup exists.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "Replace design tokens with Brittany Chiang v4 color/type system"
```

---

### Task 2: Fixed nav, mobile hamburger menu, and side rails

**Files:**
- Modify: `index.html` — replace the entire `<header class="site-header">` block with the new nav + add fixed side-rail markup right after `<body>`
- Modify: `styles.css` — append nav/menu/side-rail rules
- Modify: `animations.js` — replace file contents with the interaction engine (nav shrink/hide + hamburger toggle; more functions added in later tasks)

**Interfaces:**
- Consumes: `--nav-height`, `--nav-scroll-height`, `--green`, `--light-navy`, `--navy-shadow`, `.btn-sm` (from Task 1)
- Produces: `initNav()`, `initHamburger()` functions called from a single `DOMContentLoaded` listener at the bottom of `animations.js`. Later tasks (`initTabs()`, `initShowMore()`, `initReveal()`, `initHeroStagger()`) hook into the same listener.

- [ ] **Step 1: Replace the header block in `index.html`**

Replace the current `<header class="site-header">...</header>` with:

```html
  <header class="nav" id="siteNav">
    <div class="nav-inner">
      <a href="#top" class="nav-logo" aria-label="Home">YB</a>
      <nav class="nav-links">
        <ol>
          <li><a href="#about">About</a></li>
          <li><a href="#experience">Experience</a></li>
          <li><a href="#work">Work</a></li>
          <li><a href="#contact">Contact</a></li>
        </ol>
        <a class="btn-sm nav-resume" href="assets/resume.pdf" target="_blank" rel="noopener">Resume</a>
      </nav>
      <button class="hamburger" id="hamburgerBtn" aria-label="Menu" aria-expanded="false">
        <span class="ham-box"><span class="ham-line"></span></span>
      </button>
    </div>
  </header>

  <aside class="mobile-menu" id="mobileMenu" aria-hidden="true">
    <nav>
      <ol>
        <li><a href="#about">About</a></li>
        <li><a href="#experience">Experience</a></li>
        <li><a href="#work">Work</a></li>
        <li><a href="#contact">Contact</a></li>
      </ol>
      <a class="btn mobile-resume" href="assets/resume.pdf" target="_blank" rel="noopener">Resume</a>
    </nav>
  </aside>

  <aside class="side-rail side-rail-left" aria-label="Social links">
    <ul>
      <li><a href="https://github.com/YutaB123" target="_blank" rel="noopener" aria-label="GitHub">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg>
      </a></li>
      <li><a href="https://linkedin.com/in/yuta-banishky" target="_blank" rel="noopener" aria-label="LinkedIn">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V8h4v1.5A6 6 0 0 1 16 8z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
      </a></li>
    </ul>
  </aside>

  <aside class="side-rail side-rail-right" aria-label="Email">
    <a href="mailto:yutabanishky@gmail.com">yutabanishky@gmail.com</a>
  </aside>
```

Also delete the old `<script defer src="https://cdn.jsdelivr.net/npm/gsap...">` and `ScrollTrigger` tags and the `gallery.js` script tag near the end of `index.html` — GSAP and the coverflow gallery are being removed. Keep `script.js` and `animations.js` script tags.

- [ ] **Step 2: Append nav/menu/side-rail CSS to `styles.css`**

```css
.nav {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 50;
  width: 100%;
  height: var(--nav-height);
  background-color: rgba(10, 25, 47, 0.85);
  backdrop-filter: blur(10px);
  transition: var(--transition);
}
.nav.nav-hide { transform: translateY(calc(var(--nav-scroll-height) * -1)); }
.nav.nav-shrink { height: var(--nav-scroll-height); box-shadow: 0 10px 30px -10px var(--navy-shadow); }

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 50px;
}
@media (max-width: 768px) { .nav-inner { padding: 0 25px; } }

.nav-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: 1px solid var(--green);
  border-radius: var(--border-radius);
  color: var(--green);
  font-family: var(--font-mono);
  font-weight: 600;
  transition: var(--transition);
}
.nav-logo:hover, .nav-logo:focus-visible { transform: translate(-3px, -3px); box-shadow: 3px 3px 0 0 var(--green); outline: none; }

.nav-links { display: flex; align-items: center; }
@media (max-width: 768px) { .nav-links { display: none; } }
.nav-links ol {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--lightest-slate);
  counter-reset: navitem;
}
.nav-links ol li { margin: 0 5px; counter-increment: navitem; }
.nav-links ol li a { padding: 10px; transition: var(--transition); }
.nav-links ol li a:before { content: '0' counter(navitem) '.'; margin-right: 5px; color: var(--green); font-size: var(--fz-xxs); }
.nav-links ol li a:hover, .nav-links ol li a:focus-visible { color: var(--green); }
.nav-resume { margin-left: 15px; }

.hamburger { display: none; background: none; border: 0; padding: 15px; cursor: pointer; }
@media (max-width: 768px) { .hamburger { display: flex; align-items: center; justify-content: center; } }
.ham-box { position: relative; width: 30px; height: 24px; display: inline-block; }
.ham-line, .ham-line:before, .ham-line:after {
  position: absolute; left: 0; width: 30px; height: 2px; border-radius: 4px;
  background-color: var(--green); transition: transform 0.22s var(--easing), background-color 0.15s;
}
.ham-line { top: 50%; }
.ham-line:before { content: ''; top: -10px; }
.ham-line:after { content: ''; top: 10px; }
.hamburger[aria-expanded="true"] .ham-line { background: transparent; }
.hamburger[aria-expanded="true"] .ham-line:before { top: 0; transform: rotate(45deg); }
.hamburger[aria-expanded="true"] .ham-line:after { top: 0; transform: rotate(-45deg); }

.mobile-menu {
  display: none;
  position: fixed;
  top: 0; right: 0; bottom: 0;
  z-index: 49;
  width: min(75vw, 400px);
  background-color: var(--light-navy);
  box-shadow: -10px 0 30px -15px var(--navy-shadow);
  transform: translateX(100%);
  transition: var(--transition);
}
@media (max-width: 768px) { .mobile-menu { display: flex; align-items: center; } }
.mobile-menu.is-open { transform: translateX(0); }
.mobile-menu nav { width: 100%; text-align: center; font-family: var(--font-mono); }
.mobile-menu ol { list-style: none; padding: 0; margin: 0 0 40px; counter-reset: mobilenav; }
.mobile-menu ol li { margin-bottom: 20px; counter-increment: mobilenav; font-size: var(--fz-lg); }
.mobile-menu ol li a { color: var(--lightest-slate); }
.mobile-menu ol li:before { content: '0' counter(mobilenav) '.'; display: block; color: var(--green); font-size: var(--fz-sm); margin-bottom: 5px; }
.mobile-resume { display: block; width: max-content; margin: 0 auto; }

.side-rail {
  position: fixed;
  bottom: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.side-rail-left { left: 40px; }
.side-rail-right { right: 40px; }
@media (max-width: 1080px) { .side-rail { display: none; } }
.side-rail ul { list-style: none; margin: 0 0 20px; padding: 0; }
.side-rail-left ul:after,
.side-rail-right a:after {
  content: ''; display: block; width: 1px; height: 90px; margin: 20px auto 0; background-color: var(--light-slate);
}
.side-rail-left ul { display: flex; flex-direction: column; align-items: center; }
.side-rail-left li a { display: block; padding: 10px; color: var(--light-slate); transition: var(--transition); }
.side-rail-left li a:hover, .side-rail-left li a:focus-visible { color: var(--green); transform: translateY(-3px); }
.side-rail-right { flex-direction: column-reverse; }
.side-rail-right a {
  margin: 20px auto 0; padding: 10px; color: var(--light-slate); font-family: var(--font-mono);
  font-size: var(--fz-xxs); letter-spacing: 0.1em; writing-mode: vertical-rl; transition: var(--transition);
}
.side-rail-right a:hover, .side-rail-right a:focus-visible { color: var(--green); transform: translateY(-3px); }
```

- [ ] **Step 3: Replace `animations.js` with the interaction engine (nav + hamburger so far)**

```js
(function () {
  "use strict";

  function initNav() {
    var nav = document.getElementById("siteNav");
    if (!nav) return;
    var lastY = window.pageYOffset;

    window.addEventListener("scroll", function () {
      var y = window.pageYOffset;
      nav.classList.toggle("nav-shrink", y > 50);
      if (y > lastY && y > 150) {
        nav.classList.add("nav-hide");
      } else {
        nav.classList.remove("nav-hide");
      }
      lastY = y;
    }, { passive: true });
  }

  function initHamburger() {
    var btn = document.getElementById("hamburgerBtn");
    var menu = document.getElementById("mobileMenu");
    if (!btn || !menu) return;

    function close() {
      btn.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
    }
    function open() {
      btn.setAttribute("aria-expanded", "true");
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
    }

    btn.addEventListener("click", function () {
      var isOpen = btn.getAttribute("aria-expanded") === "true";
      isOpen ? close() : open();
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
    document.addEventListener("click", function (e) {
      if (menu.classList.contains("is-open") && !menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        close();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) close();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initHamburger();
  });
})();
```

- [ ] **Step 4: Manual verification**

Run the local server: `python nocache_server.py` (check `nocache_server.py` for the port it prints, e.g. `http://localhost:8000`)
Open in a browser and confirm:
- Nav bar is fixed, translucent, top of page
- Scrolling down past 150px shrinks and hides the nav; scrolling up reveals it
- Below 768px width (resize devtools), hamburger button appears, opens the slide-in mobile menu, closes on link click / Escape / outside click
- Left rail shows GitHub + LinkedIn icons above 1080px width; right rail shows the email link

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css animations.js
git commit -m "Add fixed nav, mobile hamburger menu, and social/email side rails"
```

---

### Task 3: Hero section

**Files:**
- Modify: `index.html` — replace the `<div class="split">...</div>` block (sticky photo + hero text) with a plain hero section
- Modify: `styles.css` — append hero rules, remove old `.split`/`.split-photo`/`.split-main`/`.hero`/`.photo-*` rules
- Modify: `animations.js` — add `initHeroStagger()`

**Interfaces:**
- Consumes: `.btn`, design tokens (Task 1)
- Produces: none consumed by later tasks (self-contained)

- [ ] **Step 1: Replace hero markup in `index.html`**

```html
  <main id="top">
    <section class="hero">
      <p class="hero-greeting reveal-line">Hi, my name is</p>
      <h1 class="hero-name reveal-line">Yuta Banishky.</h1>
      <h2 class="hero-tagline reveal-line">I build things that ship.</h2>
      <p class="hero-desc reveal-line">
        I'm an Informatics student at the University of Washington (Data Science track) who likes
        turning ideas into something real — a working, deployed product, not just a prototype. I
        build AI applications, computer-vision games, and full-stack web apps, most of which are
        live and linked below.
      </p>
      <a class="btn hero-cta reveal-line" href="#work">Check out my work</a>
    </section>
```

(Keep the existing `<main id="top">` opening tag if already present; just replace its inner content up through where the projects section begins. The projects section markup is replaced in Task 6/7.)

- [ ] **Step 2: Append hero CSS**

```css
.hero {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-height: 100vh;
  padding: 0 150px;
  max-width: 1000px;
}
@media (max-width: 1080px) { .hero { padding: 0 100px; } }
@media (max-width: 768px) { .hero { padding: 0 50px; } }
@media (max-width: 480px) { .hero { padding: 0 25px; } }

.hero-greeting { color: var(--green); font-family: var(--font-mono); font-size: clamp(var(--fz-sm), 5vw, var(--fz-md)); margin-bottom: 20px; }
.hero-name { font-size: clamp(40px, 8vw, 80px); color: var(--lightest-slate); line-height: 1.1; }
.hero-tagline { font-size: clamp(40px, 8vw, 80px); color: var(--slate); line-height: 1.1; margin-top: 5px; }
.hero-desc { max-width: 540px; margin-top: 20px; color: var(--slate); }
.hero-cta { margin-top: 50px; }

.reveal-line { opacity: 0; transform: translateY(20px); transition: opacity 0.5s var(--easing), transform 0.5s var(--easing); }
.reveal-line.is-visible { opacity: 1; transform: translateY(0); }
@media (prefers-reduced-motion: reduce) { .reveal-line { opacity: 1; transform: none; } }
```

- [ ] **Step 3: Add `initHeroStagger()` to `animations.js`**

Add this function and call it from the `DOMContentLoaded` listener:

```js
  function initHeroStagger() {
    var lines = document.querySelectorAll(".reveal-line");
    if (!lines.length) return;
    var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      lines.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    lines.forEach(function (el, i) {
      setTimeout(function () { el.classList.add("is-visible"); }, 300 + i * 150);
    });
  }
```

Update the bottom listener:

```js
  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initHamburger();
    initHeroStagger();
  });
```

- [ ] **Step 4: Manual verification**

Reload the page. Confirm the 5 hero lines (greeting, name, tagline, description, button) fade up in sequence on load, and that with devtools "prefers-reduced-motion: reduce" emulation enabled they appear immediately instead.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css animations.js
git commit -m "Replace sticky split-photo hero with text-only staggered hero"
```

---

### Task 4: About section (bio, skills list, photo hover effect)

**Files:**
- Modify: `index.html` — insert `<section id="about">` after the hero, before the work section
- Modify: `styles.css` — append About rules

**Interfaces:**
- Consumes: `.numbered-heading`, `.reveal`, design tokens

- [ ] **Step 1: Add About markup**

```html
    <section id="about" class="about reveal">
      <h2 class="numbered-heading">About Me</h2>
      <div class="about-inner">
        <div class="about-text">
          <p>
            Hello! I'm Yuta, a B.S. Informatics student at the University of Washington on the
            Data Science track, expected to graduate in June 2029.
          </p>
          <p>
            My interest in building things started before college — I founded
            <span class="about-highlight">Bellevue Coding</span>, a free weekly Python program for
            kids ages 8–14 at the Bellevue Library, and
            <span class="about-highlight">Wilburton Soccer</span>, a youth training program I built
            and ran from scratch. Since then I've kept building: AI applications, computer-vision
            games, real-time multiplayer apps, and full-stack web products — most of them live and
            linked below.
          </p>
          <p>
            Currently, I'm exploring LLM application development and coursework in data programming
            and statistics at UW.
          </p>
          <p>Here are a few technologies I've been working with recently:</p>
          <ul class="skills-list">
            <li>Python</li>
            <li>Next.js / React</li>
            <li>JavaScript / SQL</li>
            <li>Node.js / Express</li>
            <li>Claude &amp; OpenAI APIs</li>
            <li>pandas / Matplotlib</li>
          </ul>
        </div>
        <div class="about-pic">
          <div class="about-pic-wrap">
            <img src="assets/headshot.jpg" alt="Headshot of Yuta Banishky" width="300" height="456" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Append About CSS**

```css
.about { max-width: 900px; margin: 0 auto; padding: 100px 50px; }
@media (max-width: 768px) { .about { padding: 80px 25px; } }

.about-inner { display: grid; grid-template-columns: 3fr 2fr; gap: 50px; }
@media (max-width: 768px) { .about-inner { display: block; } }

.about-text p { margin-bottom: 15px; color: var(--slate); }
.about-highlight { color: var(--lightest-slate); }

.skills-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(140px, 200px));
  gap: 0 10px;
  list-style: none;
  margin: 20px 0 0;
  padding: 0;
}
.skills-list li { position: relative; margin-bottom: 10px; padding-left: 20px; font-family: var(--font-mono); font-size: var(--fz-xs); color: var(--slate); }
.skills-list li:before { content: '▹'; position: absolute; left: 0; color: var(--green); }

.about-pic { position: relative; max-width: 300px; }
@media (max-width: 768px) { .about-pic { margin: 50px auto 0; width: 70%; } }
.about-pic-wrap {
  display: block;
  position: relative;
  width: 100%;
  border-radius: var(--border-radius);
  background-color: var(--green);
  transition: var(--transition);
}
.about-pic-wrap img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--border-radius);
  mix-blend-mode: multiply;
  filter: grayscale(100%) contrast(1);
  transition: var(--transition);
  position: relative;
}
.about-pic-wrap:before,
.about-pic-wrap:after {
  content: '';
  display: block;
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  border-radius: var(--border-radius);
  transition: var(--transition);
}
.about-pic-wrap:before { background-color: var(--navy); mix-blend-mode: screen; }
.about-pic-wrap:after { border: 2px solid var(--green); transform: translate(16px, 16px); z-index: -1; }
.about-pic-wrap:hover,
.about-pic-wrap:focus-within { transform: translate(-4px, -4px); }
.about-pic-wrap:hover img,
.about-pic-wrap:focus-within img { filter: none; mix-blend-mode: normal; }
.about-pic-wrap:hover:after,
.about-pic-wrap:focus-within:after { transform: translate(24px, 24px); }
```

- [ ] **Step 3: Manual verification**

Reload, scroll to About. Confirm the two-column layout (stacks on mobile width), skills grid with green ▹ bullets, and that hovering the photo shifts it from grayscale/green-tinted to full color with the green square border offsetting further.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "Add About section with bio, skills list, and hover-reveal photo"
```

---

### Task 5: Experience section (tabbed job history)

**Files:**
- Modify: `index.html` — insert `<section id="experience">` after About
- Modify: `styles.css` — append tab rules
- Modify: `animations.js` — add `initTabs()`

**Interfaces:**
- Produces: nothing consumed later (self-contained). Consumes `.numbered-heading`, tokens.

- [ ] **Step 1: Add Experience markup**

```html
    <section id="experience" class="experience reveal">
      <h2 class="numbered-heading">Where I've Worked</h2>
      <div class="tabs-inner">
        <div class="tab-list" role="tablist" aria-label="Job tabs">
          <button class="tab-btn is-active" role="tab" aria-selected="true" aria-controls="panel-0" id="tab-0" data-tab="0">Bellevue Coding</button>
          <button class="tab-btn" role="tab" aria-selected="false" aria-controls="panel-1" id="tab-1" data-tab="1" tabindex="-1">Wilburton Soccer</button>
          <button class="tab-btn" role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2" data-tab="2" tabindex="-1">Mochinut</button>
          <div class="tab-highlight" style="transform: translateY(0)"></div>
        </div>
        <div class="tab-panels">
          <div class="tab-panel is-active" id="panel-0" role="tabpanel" aria-labelledby="tab-0">
            <h3><span>Founder &amp; Instructor</span> <span class="company">@ Bellevue Coding</span></h3>
            <p class="tab-range">Jan 2025 – Jun 2025</p>
            <ul>
              <li>Founded and taught a free weekly Python program for children ages 8–14 at the Bellevue Library, designing all curriculum, lesson plans, and practice exercises from scratch in Python, VS Code, and Scratch.</li>
              <li>Grew enrollment from 3 to 7 students per session through consistent, hands-on weekly instruction and informal office hours tailored to each student's pace.</li>
            </ul>
          </div>
          <div class="tab-panel" id="panel-1" role="tabpanel" aria-labelledby="tab-1" hidden>
            <h3><span>Founder &amp; Organizer</span> <span class="company">@ Wilburton Soccer</span></h3>
            <p class="tab-range">Mar 2024 – Aug 2024</p>
            <ul>
              <li>Founded and operated a youth soccer training program running practices three times weekly, with a paid membership and per-session pricing model and self-run marketing.</li>
              <li>Grew participation from 2 to 8+ players per session through self-directed community outreach.</li>
            </ul>
          </div>
          <div class="tab-panel" id="panel-2" role="tabpanel" aria-labelledby="tab-2" hidden>
            <h3><span>Shift Manager</span> <span class="company">@ Mochinut, Bellevue, WA</span></h3>
            <p class="tab-range">Mar 2024 – May 2025</p>
            <ul>
              <li>Managed shift operations for a 5-person team at a high-traffic mall location serving roughly 300 customers daily, owning all closing duties and register reconciliation.</li>
              <li>Drove a 5–10% increase in shift sales through upselling and operational efficiency.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Append tab CSS**

```css
.experience { max-width: 700px; margin: 0 auto; padding: 50px 50px 100px; }
@media (max-width: 768px) { .experience { padding: 50px 25px 80px; } }

.tabs-inner { display: flex; }
@media (max-width: 600px) { .tabs-inner { display: block; } }

.tab-list { position: relative; display: flex; flex-direction: column; list-style: none; margin: 0; padding: 0; width: max-content; }
@media (max-width: 600px) { .tab-list { flex-direction: row; overflow-x: auto; width: 100%; margin-bottom: 30px; } }

.tab-btn {
  display: flex; align-items: center; height: var(--tab-height); padding: 0 20px;
  background: transparent; border: none; border-left: 2px solid var(--lightest-navy);
  color: var(--slate); font-family: var(--font-mono); font-size: var(--fz-xs);
  text-align: left; white-space: nowrap; cursor: pointer; transition: var(--transition);
}
.tab-btn.is-active { color: var(--green); }
.tab-btn:hover, .tab-btn:focus-visible { background-color: var(--light-navy); }
@media (max-width: 600px) {
  .tab-btn { border-left: 0; border-bottom: 2px solid var(--lightest-navy); min-width: 120px; justify-content: center; }
}

.tab-highlight {
  position: absolute; top: 0; left: 0; width: 2px; height: var(--tab-height);
  background: var(--green); transition: transform 0.25s var(--easing);
}
@media (max-width: 600px) {
  .tab-highlight { top: auto; bottom: 0; left: 0; width: var(--tab-width); max-width: var(--tab-width); height: 2px; }
}

.tab-panels { position: relative; width: 100%; margin-left: 20px; }
@media (max-width: 600px) { .tab-panels { margin-left: 0; } }

.tab-panel { display: none; padding: 10px 5px; }
.tab-panel.is-active { display: block; }
.tab-panel h3 { font-size: var(--fz-xxl); font-weight: 500; }
.tab-panel h3 .company { color: var(--green); }
.tab-range { margin: 2px 0 25px; color: var(--light-slate); font-family: var(--font-mono); font-size: var(--fz-xs); }
.tab-panel ul { padding: 0; margin: 0; list-style: none; font-size: var(--fz-lg); }
.tab-panel li { position: relative; padding-left: 30px; margin-bottom: 10px; color: var(--slate); }
.tab-panel li:before { content: '▹'; position: absolute; left: 0; color: var(--green); }
```

- [ ] **Step 3: Add `initTabs()` to `animations.js`**

```js
  function initTabs() {
    var list = document.querySelector(".tab-list");
    if (!list) return;
    var buttons = Array.prototype.slice.call(list.querySelectorAll(".tab-btn"));
    var panels = Array.prototype.slice.call(document.querySelectorAll(".tab-panel"));
    var highlight = list.querySelector(".tab-highlight");
    var tabHeightPx = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--tab-height"), 10) || 42;
    var tabWidthPx = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--tab-width"), 10) || 120;

    function activate(index) {
      buttons.forEach(function (b, i) {
        var active = i === index;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", active ? "true" : "false");
        b.tabIndex = active ? 0 : -1;
      });
      panels.forEach(function (p, i) {
        var active = i === index;
        p.classList.toggle("is-active", active);
        p.hidden = !active;
      });
      var vertical = window.innerWidth > 600;
      highlight.style.transform = vertical
        ? "translateY(" + index * tabHeightPx + "px)"
        : "translateX(" + index * tabWidthPx + "px)";
    }

    buttons.forEach(function (btn, i) {
      btn.addEventListener("click", function () { activate(i); });
    });
    list.addEventListener("keydown", function (e) {
      var current = buttons.findIndex(function (b) { return b.classList.contains("is-active"); });
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        var next = (current + 1) % buttons.length;
        activate(next);
        buttons[next].focus();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        var prev = (current - 1 + buttons.length) % buttons.length;
        activate(prev);
        buttons[prev].focus();
      }
    });
    window.addEventListener("resize", function () {
      var current = buttons.findIndex(function (b) { return b.classList.contains("is-active"); });
      activate(current);
    });
  }
```

Add `initTabs();` to the `DOMContentLoaded` listener.

- [ ] **Step 4: Manual verification**

Reload, scroll to Experience. Click each tab — confirm content swaps, the green highlight bar slides to track the active tab, and arrow keys move focus + selection between tabs. Resize below 600px and confirm tabs go horizontal with the highlight bar moving horizontally underneath.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css animations.js
git commit -m "Add tabbed Experience section (Bellevue Coding, Wilburton Soccer, Mochinut)"
```

---

### Task 6: Featured Projects (Work section, part 1 — alternating layout)

**Files:**
- Modify: `index.html` — insert `<section id="work">` after Experience, containing the "Some Things I've Built" heading + 3 featured project entries
- Modify: `styles.css` — append featured-project rules

- [ ] **Step 1: Add Featured Projects markup**

```html
    <section id="work" class="work">
      <h2 class="numbered-heading work-heading reveal">Some Things I've Built</h2>

      <ul class="featured-list">
        <li class="featured-project reveal">
          <div class="featured-image">
            <a href="https://canvas-study-assistant.onrender.com/chat" target="_blank" rel="noopener">
              <img src="assets/screenshots/dubly.jpg" alt="Dubly — a husky-themed study buddy wired to UW Canvas" loading="lazy" width="1200" height="528" />
            </a>
          </div>
          <div class="featured-content">
            <p class="featured-overline">Featured Project</p>
            <h3 class="featured-title"><a href="https://canvas-study-assistant.onrender.com/chat" target="_blank" rel="noopener">Dubly</a></h3>
            <div class="featured-desc">
              A husky-themed study buddy wired to your UW Canvas. Chat to see what's due and your
              grades, ask about any syllabus, and spin up quizzes, flashcards, study plans, and
              Word docs for your assignments — plus a bring-your-own-API-key architecture that
              keeps it free to run at scale.
            </div>
            <ul class="featured-tech">
              <li>Next.js</li><li>Twilio</li><li>Canvas LMS API</li><li>Anthropic Claude API</li>
            </ul>
            <div class="featured-links">
              <a href="https://github.com/YutaB123/dubly" target="_blank" rel="noopener" aria-label="GitHub"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg></a>
              <button type="button" class="icon-btn" data-demo="dubly" aria-label="Watch demo"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>
            </div>
          </div>
        </li>

        <li class="featured-project reveal">
          <div class="featured-image">
            <a href="https://csv-reader-iyw5.onrender.com/" target="_blank" rel="noopener">
              <img src="assets/screenshots/csv.jpg" alt="AI CSV Data Analyzer" loading="lazy" width="1280" height="800" />
            </a>
          </div>
          <div class="featured-content">
            <p class="featured-overline">Featured Project</p>
            <h3 class="featured-title"><a href="https://csv-reader-iyw5.onrender.com/" target="_blank" rel="noopener">AI CSV Data Analyzer</a></h3>
            <div class="featured-desc">
              Upload a CSV, ask questions about it in plain English, and get answers with
              auto-generated bar, pie, line, and scatter charts. A three-stage agent pipeline (LLM
              planning → local Python execution → LLM explanation) keeps raw data on-device,
              sending only schema and aggregates to the API for privacy.
            </div>
            <ul class="featured-tech">
              <li>Python</li><li>Gradio</li><li>pandas</li><li>OpenAI GPT-4o-mini</li><li>Matplotlib</li>
            </ul>
            <div class="featured-links">
              <a href="https://github.com/YutaB123/CSV-Reader" target="_blank" rel="noopener" aria-label="GitHub"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg></a>
              <a href="https://csv-reader-iyw5.onrender.com/" target="_blank" rel="noopener" class="external" aria-label="External Link"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
            </div>
          </div>
        </li>

        <li class="featured-project reveal">
          <div class="featured-image">
            <a href="https://yutachess-production.up.railway.app/" target="_blank" rel="noopener">
              <img src="assets/screenshots/chess.jpg" alt="Yutachess — real-time multiplayer chess" loading="lazy" width="1280" height="800" />
            </a>
          </div>
          <div class="featured-content">
            <p class="featured-overline">Featured Project</p>
            <h3 class="featured-title"><a href="https://yutachess-production.up.railway.app/" target="_blank" rel="noopener">Yutachess</a></h3>
            <div class="featured-desc">
              Real-time multiplayer chess — share a 6-character room code, pick a time control
              (Bullet/Blitz/Rapid), and play with live rematch support synchronized over
              WebSockets. Server-authoritative move validation blocks illegal moves and guarantees
              fair play across concurrent clients.
            </div>
            <ul class="featured-tech">
              <li>Node.js</li><li>Express</li><li>Socket.IO</li><li>chess.js</li>
            </ul>
            <div class="featured-links">
              <a href="https://github.com/YutaB123/yutachess" target="_blank" rel="noopener" aria-label="GitHub"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg></a>
              <a href="https://yutachess-production.up.railway.app/" target="_blank" rel="noopener" class="external" aria-label="External Link"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
            </div>
          </div>
        </li>
      </ul>
```

(Leave the section open — Task 7 adds the "Other Noteworthy Projects" grid and closes `</section>`.)

- [ ] **Step 2: Append featured-project CSS**

```css
.work { max-width: 1000px; margin: 0 auto; padding: 50px 50px 0; }
@media (max-width: 768px) { .work { padding: 50px 25px 0; } }
.work-heading { max-width: 100%; }

.featured-list { list-style: none; margin: 0 0 100px; padding: 0; }
.featured-project {
  position: relative;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 10px;
  align-items: center;
  margin-bottom: 100px;
}
@media (max-width: 768px) { .featured-project { margin-bottom: 70px; } }
@media (max-width: 480px) { .featured-project { margin-bottom: 30px; } }

.featured-project:nth-of-type(odd) .featured-content { grid-column: 7 / -1; text-align: right; }
.featured-project:nth-of-type(odd) .featured-tech { justify-content: flex-end; }
.featured-project:nth-of-type(odd) .featured-links { justify-content: flex-end; }
.featured-project:nth-of-type(odd) .featured-image { grid-column: 1 / 8; }
.featured-project:nth-of-type(even) .featured-content { grid-column: 1 / 7; text-align: left; }
.featured-project:nth-of-type(even) .featured-image { grid-column: 6 / -1; }
@media (max-width: 1080px) {
  .featured-project:nth-of-type(odd) .featured-content { grid-column: 5 / -1; }
}
@media (max-width: 768px) {
  .featured-project { display: block; }
  .featured-project .featured-content,
  .featured-project:nth-of-type(odd) .featured-content { text-align: left; grid-column: auto; }
  .featured-project:nth-of-type(odd) .featured-tech,
  .featured-project:nth-of-type(odd) .featured-links { justify-content: flex-start; }
}

.featured-content { grid-row: 1 / -1; position: relative; z-index: 2; }
.featured-overline { color: var(--green); font-family: var(--font-mono); font-size: var(--fz-xs); margin-bottom: 10px; }
.featured-title { font-size: clamp(24px, 5vw, 28px); margin-bottom: 20px; }
.featured-title a { color: var(--lightest-slate); }
.featured-title a:hover, .featured-title a:focus-visible { color: var(--green); }
.featured-desc {
  background-color: var(--light-navy);
  padding: 25px;
  border-radius: var(--border-radius);
  color: var(--light-slate);
  font-size: var(--fz-lg);
  box-shadow: 0 10px 30px -15px var(--navy-shadow);
}
@media (max-width: 768px) { .featured-desc { background: transparent; padding: 20px 0; box-shadow: none; } }

.featured-tech { display: flex; flex-wrap: wrap; list-style: none; margin: 20px 0 10px; padding: 0; }
.featured-tech li { margin: 0 20px 5px 0; color: var(--light-slate); font-family: var(--font-mono); font-size: var(--fz-xs); white-space: nowrap; }

.featured-links { display: flex; align-items: center; gap: 6px; margin-top: 10px; }
.featured-links a, .featured-links .icon-btn {
  display: flex; align-items: center; justify-content: center; padding: 10px;
  color: var(--lightest-slate); background: none; border: none; cursor: pointer; transition: var(--transition);
}
.featured-links a:hover, .featured-links a:focus-visible,
.featured-links .icon-btn:hover, .featured-links .icon-btn:focus-visible { color: var(--green); outline: none; }

.featured-image { position: relative; grid-row: 1 / -1; box-shadow: 0 10px 30px -15px var(--navy-shadow); }
.featured-image a { display: block; position: relative; border-radius: var(--border-radius); background-color: var(--green); }
.featured-image img { display: block; width: 100%; height: auto; border-radius: var(--border-radius); mix-blend-mode: multiply; filter: grayscale(100%) contrast(1) brightness(90%); transition: var(--transition); }
.featured-image a:before {
  content: ''; position: absolute; inset: 0; z-index: 1; background-color: var(--navy);
  mix-blend-mode: screen; border-radius: var(--border-radius); transition: var(--transition);
}
.featured-image a:hover:before, .featured-image a:focus-visible:before { background: transparent; }
.featured-image a:hover img, .featured-image a:focus-visible img { filter: none; }
@media (max-width: 768px) { .featured-image { grid-column: 1 / -1 !important; opacity: 0.25; } }
```

- [ ] **Step 3: Manual verification**

Reload, scroll to Work. Confirm 3 alternating-side entries, green duotone screenshots that go full-color on hover, and that the GitHub/demo/external icons work (Dubly's demo icon should open the existing lightbox from `script.js`).

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "Add alternating Featured Projects layout (Dubly, CSV Analyzer, Yutachess)"
```

---

### Task 7: Other Noteworthy Projects grid + Show More

**Files:**
- Modify: `index.html` — append the grid inside `<section id="work">`, then close the section; delete the old `<div class="grid">...</div>` card markup (all 12 old `.card` articles) and the old `#projectGallery` div + gallery hint paragraph
- Modify: `styles.css` — append grid rules, delete old `.card`/`.grid`/`.project-gallery`/`.gallery-hint`/`.banner-*` rules
- Modify: `animations.js` — add `initShowMore()`

- [ ] **Step 1: Add the grid markup (inside `#work`, after `</ul>` from Task 6)**

```html
      <div class="other-projects reveal">
        <h3 class="other-projects-heading">Other Noteworthy Projects</h3>
        <ul class="projects-grid" id="projectsGrid">
          <li class="project-card">
            <div class="project-card-top">
              <span class="folder-icon"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>
              <span class="project-card-links">
                <a href="https://github.com/YutaB123/ai-debate-colosseum" target="_blank" rel="noopener" aria-label="GitHub"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg></a>
                <a href="https://ai-debate-colosseum.onrender.com/" target="_blank" rel="noopener" class="external" aria-label="External Link"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
              </span>
            </div>
            <h4 class="project-card-title"><a href="https://ai-debate-colosseum.onrender.com/" target="_blank" rel="noopener">AI Debate Colosseum</a></h4>
            <p class="project-card-desc">Pit AI models against each other in structured, multi-round debates, then review the full transcripts.</p>
            <ul class="project-card-tech"><li>LLMs</li><li>Python</li><li>Web</li></ul>
          </li>

          <li class="project-card">
            <div class="project-card-top">
              <span class="folder-icon"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>
              <span class="project-card-links">
                <a href="https://github.com/YutaB123/Resume_anaylzer" target="_blank" rel="noopener" aria-label="GitHub"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg></a>
                <a href="https://resume-analyzer-vrph.onrender.com/" target="_blank" rel="noopener" class="external" aria-label="External Link"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
              </span>
            </div>
            <h4 class="project-card-title"><a href="https://resume-analyzer-vrph.onrender.com/" target="_blank" rel="noopener">AI Resume Analyzer</a></h4>
            <p class="project-card-desc">Upload a PDF resume and get instant AI feedback — multi-criteria scores, keyword matching, and rewritten bullet points to boost interview chances.</p>
            <ul class="project-card-tech"><li>Python</li><li>Gradio</li><li>OpenAI API</li></ul>
          </li>

          <li class="project-card">
            <div class="project-card-top">
              <span class="folder-icon"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>
              <span class="project-card-links">
                <a href="https://github.com/YutaB123/ai-poker" target="_blank" rel="noopener" aria-label="GitHub"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg></a>
                <a href="https://ai-poker-qhbt.onrender.com/" target="_blank" rel="noopener" class="external" aria-label="External Link"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
              </span>
            </div>
            <h4 class="project-card-title"><a href="https://ai-poker-qhbt.onrender.com/" target="_blank" rel="noopener">AI Poker Room</a></h4>
            <p class="project-card-desc">Watch OpenAI, Anthropic, Gemini, and Grok models play five-card draw against each other — live betting, bluffs, and showdowns, with each model's reasoning streamed in.</p>
            <ul class="project-card-tech"><li>Next.js</li><li>TypeScript</li><li>Multi-LLM</li></ul>
          </li>

          <li class="project-card">
            <div class="project-card-top">
              <span class="folder-icon"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>
              <span class="project-card-links">
                <a href="https://github.com/YutaB123/adsnap" target="_blank" rel="noopener" aria-label="GitHub"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg></a>
                <button type="button" class="icon-btn" data-demo="adsnap" aria-label="Watch demo"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>
              </span>
            </div>
            <h4 class="project-card-title">AdSnap</h4>
            <p class="project-card-desc">Point your phone at any item and ~2 minutes later get a full video commercial — cinematic shots, a slogan, an AI voiceover, and music.</p>
            <ul class="project-card-tech"><li>Mobile app</li><li>React Native</li><li>Azure AI</li></ul>
          </li>

          <li class="project-card">
            <div class="project-card-top">
              <span class="folder-icon"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>
              <span class="project-card-links">
                <a href="https://github.com/YutaB123/fridge-ai" target="_blank" rel="noopener" aria-label="GitHub"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg></a>
                <button type="button" class="icon-btn" data-demo="recipe" aria-label="Watch demo"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>
              </span>
            </div>
            <h4 class="project-card-title">recipe.AI</h4>
            <p class="project-card-desc">Snap a photo of your fridge — Claude vision detects the ingredients and suggests dishes to cook now, each with full recipes and nutrition facts.</p>
            <ul class="project-card-tech"><li>Mobile app</li><li>React Native</li><li>Claude Vision</li></ul>
          </li>

          <li class="project-card">
            <div class="project-card-top">
              <span class="folder-icon"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>
              <span class="project-card-links">
                <a href="https://charades-yutab-udbt5.azurewebsites.net/" target="_blank" rel="noopener" class="external" aria-label="External Link"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
              </span>
            </div>
            <h4 class="project-card-title"><a href="https://charades-yutab-udbt5.azurewebsites.net/" target="_blank" rel="noopener">Charades vs. AI</a></h4>
            <p class="project-card-desc">Act out words on your webcam while Claude watches and shouts guesses — land 10 words under 30 seconds each to win.</p>
            <ul class="project-card-tech"><li>Claude API</li><li>Computer Vision</li><li>Webcam</li></ul>
          </li>

          <li class="project-card hidden-project">
            <div class="project-card-top">
              <span class="folder-icon"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>
              <span class="project-card-links">
                <a href="https://github.com/YutaB123/Hand-controlled-pong-game" target="_blank" rel="noopener" aria-label="GitHub"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg></a>
                <a href="https://zealous-dune-03e552f1e.7.azurestaticapps.net/" target="_blank" rel="noopener" class="external" aria-label="External Link"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
              </span>
            </div>
            <h4 class="project-card-title"><a href="https://zealous-dune-03e552f1e.7.azurestaticapps.net/" target="_blank" rel="noopener">Hand Tennis</a></h4>
            <p class="project-card-desc">Webcam hand-tracking tennis — each hand controls a paddle through real-time pose detection. No controller needed.</p>
            <ul class="project-card-tech"><li>Computer Vision</li><li>Hand Tracking</li><li>JavaScript</li></ul>
          </li>

          <li class="project-card hidden-project">
            <div class="project-card-top">
              <span class="folder-icon"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>
              <span class="project-card-links">
                <a href="https://github.com/YutaB123/zyde.org" target="_blank" rel="noopener" aria-label="GitHub"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg></a>
                <a href="https://zyde.org/" target="_blank" rel="noopener" class="external" aria-label="External Link"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
              </span>
            </div>
            <h4 class="project-card-title"><a href="https://zyde.org/" target="_blank" rel="noopener">Zyde</a></h4>
            <p class="project-card-desc">A web-design studio building conversion-focused websites for local businesses — I handle design, build, and SEO end to end.</p>
            <ul class="project-card-tech"><li>Web Design</li><li>Full-stack</li><li>SEO</li></ul>
          </li>

          <li class="project-card hidden-project">
            <div class="project-card-top">
              <span class="folder-icon"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>
              <span class="project-card-links">
                <a href="https://github.com/YutaB123/kitnations-website" target="_blank" rel="noopener" aria-label="GitHub"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg></a>
                <a href="https://kitnations.org/" target="_blank" rel="noopener" class="external" aria-label="External Link"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
              </span>
            </div>
            <h4 class="project-card-title"><a href="https://kitnations.org/" target="_blank" rel="noopener">KitNations</a></h4>
            <p class="project-card-desc">A Next.js e-commerce store for World Cup 2026 national-team kits from all 48 nations, with worldwide shipping.</p>
            <ul class="project-card-tech"><li>Next.js</li><li>React</li><li>E-commerce</li></ul>
          </li>
        </ul>
        <button type="button" class="btn more-button" id="showMoreBtn">Show More</button>
      </div>
    </section>
  </main>
```

Delete the old `<div class="project-gallery" id="projectGallery">...</div>`, the `<p class="gallery-hint">`, and the entire old `<div class="grid">...12 .card articles...</div>` block that this replaces. Delete the `<script defer src="gallery.js"></script>` tag.

- [ ] **Step 2: Append grid CSS, delete old card/gallery/banner rules**

Search `styles.css` for `.card`, `.grid`, `.project-gallery`, `.gallery-hint`, `.banner-` selectors (from the old coverflow-gallery design) and delete those rule blocks. Then append:

```css
.other-projects { margin-top: 50px; }
.other-projects-heading { font-size: clamp(24px, 5vw, var(--fz-heading)); text-align: center; margin-bottom: 10px; }

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
  list-style: none;
  margin: 50px 0 0;
  padding: 0;
}
.hidden-project { display: none; }
.projects-grid.show-all .hidden-project { display: flex; }

.project-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 100%;
  padding: 2rem 1.75rem;
  background-color: var(--light-navy);
  border-radius: var(--border-radius);
  box-shadow: 0 10px 30px -15px var(--navy-shadow);
  transition: var(--transition);
}
.project-card:hover, .project-card:focus-within { transform: translateY(-7px); }

.project-card-top { display: flex; align-items: center; justify-content: space-between; width: 100%; margin-bottom: 35px; }
.folder-icon { color: var(--green); }
.project-card-links { display: flex; align-items: center; gap: 4px; color: var(--light-slate); }
.project-card-links a, .project-card-links .icon-btn {
  display: flex; align-items: center; justify-content: center; padding: 5px 7px;
  background: none; border: none; cursor: pointer; color: inherit; transition: var(--transition);
}
.project-card-links a:hover, .project-card-links a:focus-visible,
.project-card-links .icon-btn:hover, .project-card-links .icon-btn:focus-visible { color: var(--green); outline: none; }

.project-card-title { color: var(--lightest-slate); font-size: var(--fz-xxl); margin-bottom: 10px; }
.project-card-title a:hover, .project-card-title a:focus-visible { color: var(--green); }
.project-card-desc { color: var(--light-slate); font-size: var(--fz-md); flex-grow: 1; }

.project-card-tech { display: flex; flex-wrap: wrap; list-style: none; margin: 20px 0 0; padding: 0; }
.project-card-tech li { font-family: var(--font-mono); font-size: var(--fz-xxs); color: var(--slate); margin-right: 15px; line-height: 1.75; }

.more-button { display: block; margin: 60px auto 0; }
```

- [ ] **Step 3: Add `initShowMore()` to `animations.js`**

```js
  function initShowMore() {
    var grid = document.getElementById("projectsGrid");
    var btn = document.getElementById("showMoreBtn");
    if (!grid || !btn) return;
    btn.addEventListener("click", function () {
      var showing = grid.classList.toggle("show-all");
      btn.textContent = showing ? "Show Less" : "Show More";
    });
  }
```

Add `initShowMore();` to the `DOMContentLoaded` listener.

- [ ] **Step 4: Manual verification**

Reload, scroll to Other Noteworthy Projects. Confirm 6 cards show initially, "Show More" reveals the remaining 3 and the button flips to "Show Less", cards lift on hover, folder icon + link icons render, and AdSnap/recipe.AI's demo icon opens the existing lightbox.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css animations.js
git commit -m "Add Other Noteworthy Projects grid with Show More toggle"
```

---

### Task 8: Contact section, footer, and old-file cleanup

**Files:**
- Modify: `index.html` — replace `<footer class="site-footer">...</footer>` with Contact section + new footer
- Modify: `styles.css` — append contact/footer rules, delete remaining old footer/hero/split rules if any remain
- Delete: `gallery.js`
- Copy: `~/Downloads/Yuta Banishky Resume.pdf` → `assets/resume.pdf`

- [ ] **Step 1: Replace footer block in `index.html`**

```html
  <section id="contact" class="contact reveal">
    <p class="contact-overline numbered-heading">What's Next?</p>
    <h2 class="contact-title">Get In Touch</h2>
    <p class="contact-desc">
      I'm currently open to internships and new opportunities. Whether you have a question, a
      project idea, or just want to say hi, my inbox is open — I'll get back to you.
    </p>
    <a class="btn contact-cta" href="mailto:yutabanishky@gmail.com">Say Hello</a>
  </section>

  <footer class="site-footer">
    <ul class="footer-socials">
      <li><a href="https://github.com/YutaB123" target="_blank" rel="noopener" aria-label="GitHub"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg></a></li>
      <li><a href="https://linkedin.com/in/yuta-banishky" target="_blank" rel="noopener" aria-label="LinkedIn"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V8h4v1.5A6 6 0 0 1 16 8z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a></li>
    </ul>
    <p class="footer-credit">Designed &amp; Built by Yuta Banishky</p>
  </footer>
```

- [ ] **Step 2: Append contact/footer CSS**

```css
.contact { max-width: 600px; margin: 0 auto 100px; padding: 0 25px; text-align: center; }
.contact-overline { justify-content: center; }
.contact-overline:after { display: none; }
.contact-title { font-size: clamp(40px, 5vw, 60px); }
.contact-desc { margin: 20px auto 0; color: var(--slate); }
.contact-cta { margin-top: 50px; }

.site-footer { display: flex; flex-direction: column; align-items: center; padding: 15px; text-align: center; }
.footer-socials { display: none; list-style: none; margin: 0 0 10px; padding: 0; gap: 10px; }
@media (max-width: 768px) { .footer-socials { display: flex; } }
.footer-socials a { display: flex; padding: 10px; color: var(--light-slate); }
.footer-credit { color: var(--light-slate); font-family: var(--font-mono); font-size: var(--fz-xxs); }
```

- [ ] **Step 3: Delete `gallery.js` and its script tag**

```bash
git rm gallery.js
```

Remove the `<script defer src="gallery.js"></script>` line from `index.html` if not already removed in Task 7.

- [ ] **Step 4: Copy the resume PDF into `assets/`**

```bash
cp "$HOME/Downloads/Yuta Banishky Resume.pdf" "assets/resume.pdf"
```

(On this Windows/Git-Bash environment, `$HOME` resolves to `/c/Users/yutab`; verify with `ls assets/resume.pdf` afterward.)

- [ ] **Step 5: Manual verification**

Reload, scroll to Contact — confirm centered layout, "Say Hello" button opens the mail client. Confirm footer shows the credit line, and social icons appear only below 768px width. Click the nav "Resume" button and confirm it opens `assets/resume.pdf`.

- [ ] **Step 6: Commit**

```bash
git add index.html styles.css assets/resume.pdf
git commit -m "Add Contact section, rebuild footer, remove gallery.js, add resume PDF"
```

---

### Task 9: Scroll-reveal wiring, GSAP removal, and full-page integration check

**Files:**
- Modify: `animations.js` — add `initReveal()` (IntersectionObserver applied to every `.reveal` element)
- Modify: `index.html` — remove the GSAP/ScrollTrigger `<script>` tags (if not already removed in Task 2)
- Modify: `styles.css` — remove any now-dead rules left over from the old theme (search for leftover `--gold`/black-theme custom properties or unused selectors and delete)

- [ ] **Step 1: Add `initReveal()` to `animations.js`**

```js
  function initReveal() {
    var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var items = document.querySelectorAll(".reveal");
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) { observer.observe(el); });
  }
```

Update the bottom listener to call every init function:

```js
  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initHamburger();
    initHeroStagger();
    initTabs();
    initShowMore();
    initReveal();
  });
```

- [ ] **Step 2: Remove GSAP/ScrollTrigger script tags from `index.html`**

Confirm these lines are gone (delete if still present):

```html
  <script defer src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
```

The remaining script tags at the bottom of `index.html` should be exactly:

```html
  <script defer src="script.js"></script>
  <script defer src="animations.js"></script>
```

- [ ] **Step 3: Sweep `styles.css` for dead rules**

Search for any remaining selectors referencing removed classes: `.split`, `.split-photo`, `.split-main`, `.photo-stage`, `.photo-wrap`, `.card`, `.grid`, `.project-gallery`, `.gallery-hint`, `.banner-`, `.site-header`, `.brand`, `.nav-cta`, `.eyebrow`, `.socials`, `.hero-actions`, `.hero-role`, `.footer-inner`, `.footer-name`, `.footer-links`, `.footer-meta`, or any `--gold`/black-theme custom property. Delete every matched rule block — none of this markup exists anymore after Tasks 2–8.

- [ ] **Step 4: Full-page manual walkthrough**

Start the server and open the site fresh (hard-refresh to bypass cache):

```bash
python nocache_server.py
```

Walk through, top to bottom:
1. Hero lines stagger in on load
2. Nav shrinks/hides on scroll, hamburger works on mobile width
3. Side rails show GitHub/LinkedIn (left) and email (right) above 1080px, hidden below
4. About section reveals on scroll, photo hover effect works, skills grid renders
5. Experience tabs switch correctly with keyboard and mouse
6. All 3 Featured Projects render with working links and the Dubly demo lightbox
7. Other Noteworthy Projects grid shows 6, Show More reveals the rest, AdSnap/recipe.AI demo lightboxes work
8. Contact button opens mail client; footer credit shows
9. Open browser devtools console — confirm zero JS errors on load and on every interaction above
10. Check that no request 404s in the Network tab (in particular: fonts, `assets/resume.pdf`, all screenshot images)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Wire scroll-reveal engine, remove GSAP, sweep dead CSS from old theme"
```

---

### Task 10: Deploy to Render

**Files:** none (git operations only)

- [ ] **Step 1: Confirm working tree is clean**

```bash
git status --short
```

Expected: no output (everything from Tasks 1–9 is committed).

- [ ] **Step 2: Push to `origin/main`**

```bash
git push origin main
```

Render's static site (`render.yaml`, connected to `YutaB123/portfolio`) auto-deploys on push to the connected branch — no manual dashboard step needed for a code-only static site change.

- [ ] **Step 3: Verify the live deploy**

Wait ~1-2 minutes for Render's build to finish, then fetch the live URL to confirm the new markup is live:

```bash
curl -s https://yutabanishky.com/ | grep -o "Yuta Banishky" | head -1
curl -s -o /dev/null -w "%{http_code}\n" https://yutabanishky.com/assets/resume.pdf
```

Expected: first command prints `Yuta Banishky`; second prints `200`.

If the deploy doesn't reflect the change after a few minutes, check the Render dashboard build logs (this requires the user, since there's no Render CLI available in this environment — flag it rather than guessing).


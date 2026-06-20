# Portfolio Redesign — Bold & Vibrant, Max Motion

**Date:** 2026-06-19
**Goal:** Redesign the whole landing page (`index.html`) so it feels alive, modern, and engaging — heavy animation, "full send" intensity — while staying a credible résumé site for recruiters (no emojis, fast load, accessible).

## Decisions

- **Stack:** Keep hand-written `styles.css` + vanilla JS. No Tailwind, no build step. Reuse existing `script.js` lightbox untouched; add a new `animations.js` module.
- **Scope:** Entire page — header, hero, projects grid, footer — cohesive.
- **Vibe:** Bold & vibrant. Animated gradient mesh, glowing accents, big motion.
- **Intensity:** Max motion ("full send").
- **Headshot:** Keep `assets/headshot.jpg` as-is; add glow/float treatment only.
- **Accessibility:** All motion gated behind `prefers-reduced-motion`; text stays high-contrast.

## Color system

Evolve navy into a vibrant gradient palette: deep indigo → violet → cyan/magenta accents.
Used in: moving hero background, button glows, gradient text, tag chips, animated borders.
Light, readable base; high-contrast body text.

## Features

### Header
- Sticky, blur backdrop. Gradient brand mark. Nav links with underline-grow + color shift. Gradient-glow GitHub CTA.

### Hero (centerpiece)
- **Animated gradient mesh** background — drifting/morphing colored blobs (transform/opacity only, GPU-friendly).
- **Name reveals letter-by-letter** on load.
- **Role line** with animated gradient-text sweep.
- **Glowing gradient CTA buttons** — shine-sweep + lift on hover.
- Headshot floats in with gradient ring/glow + gentle perpetual float.

### Projects
- Cards **stagger fade + slide-up on scroll** (IntersectionObserver adds `.in`).
- **3D tilt toward cursor** on hover (pointer-driven), soft glow, **image zoom**.
- **Gradient tag chips**. Section heading reveals on scroll.

### Footer
- Calm, thin animated gradient top border.

### Micro-interactions
- Magnetic/hover lifts, animated link underlines, button shine sweeps.

## JS modules
- `script.js` — existing lightbox (unchanged).
- `animations.js` (new, `defer`) — scroll-reveal observer, pointer-tilt, letter-split for the name. Respects reduced-motion (no-op when set).

## Out of scope
- No new content/copy changes, no new images, no routing/sections beyond what exists.

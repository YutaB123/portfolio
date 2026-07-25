# Mouse-Following Spotlight Glow — Design

## Goal
Add a soft radial "spotlight" glow that follows the cursor across the whole page, inspired by Brittany Chiang's portfolio, using the site's existing green accent color.

## Behavior
- Full-page fixed overlay; the glow follows the cursor everywhere on the page (not scoped to one section).
- Color: site's `--green` accent (`rgba(100, 255, 218, 0.15)`), radial-gradient, transparent past 40% of a 600px circle.
- Disabled entirely on touch/coarse-pointer devices (no static fallback glow).
- Disabled under `prefers-reduced-motion: reduce`, consistent with the rest of the site's motion handling.

## Implementation

**Markup** (`index.html`) — one element added immediately after `<body>` opens:
```html
<div class="cursor-glow" aria-hidden="true"></div>
```

**CSS** (`styles.css`) — new rule block:
```css
.cursor-glow {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(100, 255, 218, 0.15), transparent 40%);
}
@media (hover: none), (pointer: coarse), (prefers-reduced-motion: reduce) {
  .cursor-glow { display: none; }
}
```
`z-index: 1` sits above the `--navy` body background but below `.side-rail` (`z-index: 10`) and `.nav` (`z-index: 50`), so it never covers interactive chrome.

**JS** (`animations.js`) — new function, called once from the existing `DOMContentLoaded` init alongside the other init calls already there (reveal, nav, tabs, etc.):
```js
function initCursorGlow() {
  const glow = document.querySelector('.cursor-glow');
  if (!glow || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let raf = null;
  document.addEventListener('mousemove', (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      glow.style.setProperty('--x', `${e.clientX}px`);
      glow.style.setProperty('--y', `${e.clientY}px`);
      raf = null;
    });
  });
}
```

## Rationale
- Matches existing site conventions: CSS custom properties for dynamic state, small vanilla-JS functions wired into `animations.js`'s existing init flow, `prefers-reduced-motion` already respected elsewhere in `styles.css` (see `.reveal`, `.reveal-line`).
- No new dependencies, no build step — consistent with the rest of this static site.
- `requestAnimationFrame` throttling keeps the `mousemove` listener cheap (at most one style write per frame).

## Out of scope
- Any per-element/card glow effects (separate ask, not part of this spec).
- The larger homepage visual-redesign and "view all projects" archive-page work discussed in the same conversation — tracked separately, not part of this change.

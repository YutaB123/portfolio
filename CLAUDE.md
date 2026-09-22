# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Yuta Banishky's portfolio site. Single page (`index.html`) covering about,
experience, all projects, résumé summary, and contact. Plain HTML + CSS +
vanilla JS — no build step, no npm, no dependencies. Live at
https://yutabanishky.com, deployed via Render.

## Commands

```bash
python nocache_server.py   # serve locally at http://127.0.0.1:8732, no-cache (preferred while iterating)
python -m http.server 8000 # plain alternative

python check_links.py      # verify every local src/href in index.html resolves to a real file
python build_resume.py     # copy the résumé PDF from OneDrive into assets/resume.pdf
python make_assets.py      # regenerate assets/og-image.png, favicon-32.png, apple-touch-icon.png
```

There is no test suite, linter, or build/bundle step. `check_links.py` is the
only automated check — run it after touching project cards or asset paths.

## Deploy

Render static site (`render.yaml`), publish directory `.`, no build command.
Pushing to `main` auto-redeploys the live site — treat pushes to `main`
accordingly.

## Architecture

Everything lives in four files at the repo root:

- `index.html` — the entire site (all sections, all 14 project cards, résumé
  section). There's no templating; every project card is hand-duplicated HTML.
- `styles.css` — the only stylesheet. Design tokens (colors, fonts, spacing,
  radii) are CSS custom properties in `:root` at the top — change the palette
  there, not in individual rules.
- `animations.js` — page-chrome behavior: topbar scrollspy (`IntersectionObserver`
  tracking which `#section` is in view), the cursor-glow effect, and staggered
  scroll-reveal (`.reveal` → `.is-visible`, batched and sorted by position so
  a grid cascades instead of popping in as one block).
- `script.js` — the project demo lightbox: a `DEMOS` object mapping a key to
  an ordered list of `{img|video, cap}` steps, plus the overlay UI that steps
  through them. Triggered by `data-demo="<key>"` buttons on project cards and
  exposed as `window.openProjectDemo`.

Two independent JS files, both self-invoking closures, both wiring up on
`DOMContentLoaded`. No shared state or module system between them.

### Project cards

Each project is an `<article class="proj-card">` in the `#work` section.
Conventions to preserve when adding or editing one:

- The whole card is clickable via a stretched pseudo-element on the title
  link — never wrap a card in an `<a>`.
- `is-featured` spans the card across two grid columns with a wider image.
  Don't add it inside `.proj-grid--pair` (the Data & Analysis row already
  gives every card in that row a dedicated 2-up layout — `is-featured` there
  would make a card fill the whole row instead).
- Thumbnails default to a 16:10 box (16:9 when featured), `object-fit: cover`.
  A screenshot wider than that gets cropped at the sides — add
  `proj-thumb--wide` (1200×528) or `proj-thumb--chart` (1200×600) to match, or
  define a new modifier next to those in `styles.css`.
- To add a demo walkthrough: add a `DEMOS` entry in `script.js`, then add
  `<button class="proj-demo" type="button" data-demo="yourkey">` in the card.
  (Dubly, AdSnap, recipe.AI use this today.)

### Résumé

The résumé's source of truth is **outside this repo**, at
`~/OneDrive/Documents/Resume/Yuta Banishky Resume.pdf`. `build_resume.py`
copies it into `assets/resume.pdf` (served by the "Download Résumé" buttons)
and warns if it isn't exactly one page. Commit the copied PDF and push to
deploy it — there is no other pipeline (an older `resume/resume.html` →
headless-Chrome pipeline was removed because it drifted out of sync with the
real résumé).

The `#resume` section in `index.html` duplicates only Education, Achievements,
and Technical Skills from the PDF (Experience and Projects are already fully
present elsewhere on the page). This duplication is hand-maintained and
**nothing checks it against the PDF** — update it manually whenever the
résumé changes.

### Brand assets

`make_assets.py` regenerates the OG image and favicons from palette constants
defined at the top of that script. Keep those constants in sync with the
tokens in `styles.css`'s `:root`. `favicon.svg` is hand-authored and must be
recolored by hand — it isn't touched by the script.

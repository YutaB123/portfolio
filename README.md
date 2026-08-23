# Yuta Banishky — Portfolio

A single-page portfolio: everything (about, experience, all 14 projects, résumé
summary, contact) lives on `index.html`. Plain HTML + CSS + vanilla JS, no build
step, no dependencies.

## Files

- `index.html` — the entire site
- `styles.css` — the only stylesheet; design tokens live in `:root` at the top
- `animations.js` — topbar scrollspy, cursor glow, staggered scroll reveal
- `script.js` — the project demo lightbox (`DEMOS` map + overlay)
- `render.yaml` — Render Static Site config
- `assets/screenshots/` — one image per project card
- `assets/demos/` — step images for the lightbox walkthroughs

## Run locally

```bash
python nocache_server.py   # http://127.0.0.1:8732 — no-cache, good for iterating
# or
python -m http.server 8000
```

## Deploy

Render static site, publish directory `.`, no build command. Push to `main` and
Render auto-redeploys. Live at https://yutabanishky.com.

## Editing content

**Design tokens.** Colors, fonts, spacing and radii are CSS custom properties at
the top of `styles.css`. Change the palette there, not in individual rules.

**A project card.** Each is an `<article class="proj-card">` in the `#work`
section. Copy an existing one and swap the image, title link, description, and
tech pills. Notes:

- Add `is-featured` to make the card span two grid columns with a wider image.
  Don't add it inside `.proj-grid--pair` (the Data & Analysis row) — there it
  would fill the whole row.
- The whole card is clickable via a stretched pseudo-element on the title link,
  so don't wrap the card in an `<a>`.
- Thumbnails default to a 16:10 box (16:9 when featured) and `object-fit: cover`.
  If your screenshot is wider than that it will get cropped at the sides — add
  `proj-thumb--wide` (1200×528) or `proj-thumb--chart` (1200×600) to match, or
  define a new modifier next to those.

**A demo walkthrough.** Add a `DEMOS` entry in `script.js` with `{ img, cap }`
steps, then put `<button class="proj-demo" type="button" data-demo="yourkey">`
in the card body. Dubly, AdSnap, and recipe.AI use this.

**Experience.** `.exp-entry` blocks inside `#experience`; the timeline rail and
dots are drawn by CSS, so you only supply the date, role, bullets, and pills.

**Stat tiles.** The four `.stat` items under the hero. Only put numbers there
that the experience section or the résumé already backs up.

## Résumé

The résumé is authored **outside this repo**, in
`~/OneDrive/Documents/Resume/Yuta Banishky Resume.pdf`. That file is the single
source of truth. To pull the current version into the site:

```bash
python build_resume.py
```

That copies it to `assets/resume.pdf` (what the "Download Résumé" buttons
serve) and warns if it isn't one page. Commit `assets/resume.pdf` and push to
deploy it.

There used to be a `resume/resume.html` source that generated the PDF via
headless Chrome. It drifted out of date and the generated PDF stopped matching
the real résumé, so it was removed.

The `#resume` section in `index.html` duplicates only Education, Achievements,
and Technical Skills from the PDF — Experience and Projects are already on the
page in full. **When the résumé changes, update that section too**; it is hand-
maintained and nothing checks it against the PDF.

## Brand assets

```bash
python make_assets.py
```

Regenerates `assets/og-image.png`, `favicon-32.png`, and `apple-touch-icon.png`
from the palette constants at the top of the script. Keep those constants in
sync with the tokens in `styles.css`; `favicon.svg` is hand-authored and has to
be recolored by hand.

## Checking links

```bash
python check_links.py
```

Verifies every local `src`/`href` in `index.html` resolves to a file that
exists. Run it after adding a project or moving assets around — it's the guard
against a card shipping with a broken screenshot.

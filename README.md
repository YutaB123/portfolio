# Yuta Banishky — Portfolio

A single-page portfolio site showcasing 7 live, deployed projects. Plain HTML + CSS, no build step.

## Files
- `index.html` — the entire page (hero/about + projects grid + footer)
- `styles.css` — light, clean, responsive theme
- `render.yaml` — Render Static Site config
- `assets/screenshots/` — optional project screenshots (cards use gradient banners by default)

## Run locally
Just open `index.html` in a browser, or serve it:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to Render (free)
1. Create a GitHub repo and push this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/YutaB123/<repo-name>.git
   git push -u origin main
   ```
2. In the [Render dashboard](https://dashboard.render.com): **New → Static Site** → connect the repo.
   - **Publish directory:** `.`
   - No build command needed.
   - (Or use **New → Blueprint** to pick up `render.yaml` automatically.)
3. Render gives you a URL like `https://yuta-portfolio.onrender.com` — put that on your resume.

## Update later
Edit `index.html`, commit, and push — Render auto-redeploys.

## Résumé

`resume/resume.html` is the editable source — the PDF is generated from it, so
edit the HTML, never the PDF. To regenerate:

```bash
python build_resume.py
```

That writes `assets/resume.pdf` (what the site's "View Full Résumé" link serves)
and copies it over `~/OneDrive/Documents/Resume/Yuta Resume.pdf`. Requires Chrome
or Edge; no other dependency.

The résumé must stay one page. `build_resume.py` prints the page count and warns
if it spills to two — if it does, tighten `line-height` and the `h2` / `.entry`
margins in `resume/resume.html` before reaching for a smaller font size.

## Checking links

`python check_links.py` verifies every local `src`/`href` in `index.html` and
`archive.html` resolves to a file that exists. Run it after moving assets around.

## Editing content
- **Bio / headline:** the `.hero` section in `index.html`.
- **Projects:** each `<article class="card">` block. To change a card's color, swap its `banner-*` class (styles in `styles.css`).
- **Add a screenshot:** drop an image in `assets/screenshots/` and replace the card's `<span class="banner-emoji">…</span>` with an `<img>` (see comments in `index.html`).

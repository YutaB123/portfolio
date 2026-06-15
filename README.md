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

## Editing content
- **Bio / headline:** the `.hero` section in `index.html`.
- **Projects:** each `<article class="card">` block. To change a card's color, swap its `banner-*` class (styles in `styles.css`).
- **Add a screenshot:** drop an image in `assets/screenshots/` and replace the card's `<span class="banner-emoji">…</span>` with an `<img>` (see comments in `index.html`).

# Sidebar Layout Rebuild (Phase 1) — Design

## Goal
Rebuild the homepage from the current top-nav/centered-hero layout to a fixed-left-sidebar + scrolling-right-content layout, matching brittanychiang.com's actual current design (reference screenshots: `homepage screenshot.png`, `homepage experinece part.png`, `homepage project section.png`). Content is rewritten from Yuta's resume, tailored for tech/software roles.

Phase 2 (separate spec) covers the new "All Projects" archive page; this phase only wires up the link to it.

## Layout architecture

**Desktop (≥ 980px):**
- A wrapper `<div class="layout">` with two children: `<header class="sidebar">` and `<main class="content">`.
- `.sidebar`: `position: fixed; top: 0; left: 0; width: min(40vw, 380px); height: 100vh; padding: 100px 50px;` — flex column, `justify-content: space-between` so name/nav sit at top-middle and social icons pin to the bottom.
- `.content`: `margin-left: min(40vw, 380px); max-width: 640px; padding: 100px 50px 150px;` — normal document flow, scrolls with the page (no independent scroll container).
- `.content` section order: About → Experience → Projects, each with generous vertical spacing (`margin-bottom: 100px` between sections, matching existing `.about`/`.experience` padding scale).

**Mobile (< 980px):**
- `.layout` becomes a single column (`display: block`); `.sidebar` loses `position: fixed` (becomes static, full-width, `height: auto`), `.content` loses `margin-left`.
- Sidebar nav becomes a plain horizontal row of 3 links (flex, centered, wrapping if needed) — no hamburger/drawer needed since there are only 3 items.
- **Delete** `.hamburger`, `.mobile-menu`, and their JS (`initHamburger`) — dead code once the drawer nav is gone.

**Removed entirely:** `.nav` (fixed top bar), `.side-rail-left`/`.side-rail-right` (folded into `.sidebar`), `.hero` section (name/tagline move into the sidebar, no separate hero), `initNav` scroll-hide/shrink JS (a static fixed sidebar doesn't hide on scroll).

## Sidebar content (matches screenshot proportions)

Top block:
- `.sidebar-name`: "Yuta Banishky", ~48–56px, bold, `--lightest-slate`, tight line-height (1.1).
- `.sidebar-title`: "Software Developer", ~24px bold, `--lightest-slate`.
- `.sidebar-desc`: one-line description, ~18px, `--slate`, max-width ~320px.
- ~120px gap, then nav.

Nav (`.sidebar-nav`):
- 3 items: About / Experience / Projects, uppercase, letter-spaced, `--font-mono`, `--fz-xs`.
- Each item: a horizontal tick-mark line + label, `align-items: center; gap: 15px`.
- Inactive: line width 20px, `--lightest-navy` colored, text `--slate`, regular weight.
- Active (`.is-active`, set via scroll-spy): line width 40px, `--lightest-slate` colored, text `--lightest-slate`, bold. Width/color transition `var(--transition)`.

Bottom block:
- `.sidebar-socials`: GitHub + LinkedIn icons, horizontal row, `gap: 24px`, `--light-slate` color, hover → `--green` (reuse existing icon-hover pattern).

## Content panels

**About** (`#about`): rewritten paragraphs — UW Informatics/Data Science track bio, Bellevue Coding + Wilburton Soccer founding story, current focus (LLM app dev, data programming coursework). Keep the existing `.skills-list` (Python, Next.js/React, JavaScript/SQL, Node.js/Express, Claude & OpenAI APIs, pandas/Matplotlib) directly below the bio text — useful signal for tech reviewers even though the reference doesn't show one at this scroll depth. No headshot photo (matches reference; simplifies the rebuild).

**Experience** (`#experience`): continuous list, no tabs, two labeled groups (`<h3>` sub-headings):

*Relevant Experience*
1. Volunteer Data Analyst · University Food Bank — Jan 2026–Present
2. Project Officer · UW Data Science Club — Nov 2025–May 2026
3. Founder & Instructor · Bellevue Coding — Jan 2025–Jun 2025
4. Peer Tutor, Coding & CS · Bellevue High School — Sep 2023–Jun 2025

*Other Experience*
5. Team Captain & Head Student Coach · Special Olympics Unified Champion Schools — Nov 2023–May 2025
6. Shift Manager · Mochinut, Bellevue WA — Mar 2024–May 2025
7. Founder & Organizer · Wilburton Soccer — Mar 2024–Aug 2024

Each entry (`.exp-entry`): `display: grid; grid-template-columns: 140px 1fr; gap: 20px` — year range in the left column (`--font-mono`, `--fz-xs`, `--slate`), right column has title (bold, `--lightest-slate`) + `· Company` (`--green`), bullet list (existing `.tab-panel li` style — `▹` marker), and a tech-pill row where the role has concrete tools (e.g. Bellevue Coding → Python, VS Code, Scratch; Data Science Club → Python, pandas, SQL). Roles without clear tools (Special Olympics, Mochinut, Wilburton Soccer) get no pill row.

Pills (`.tech-pill`): `display: inline-flex; padding: 4px 12px; border-radius: 20px; background: var(--green-tint); color: var(--green); font-family: var(--font-mono); font-size: var(--fz-xxs);` matching the rounded-chip look in `homepage experinece part.png`.

**Projects** (`#work`): "View Full Résumé →" link (`assets/resume.pdf`) at the top of the panel, right-aligned. Below it, "Selected Projects" — the same 3 currently-featured projects (Dubly, AI CSV Data Analyzer, Yutachess), restyled as compact rows (`.selected-project`): `display: grid; grid-template-columns: 200px 1fr; gap: 30px` — thumbnail image (rounded corners, existing `border-radius` var) on the left, title (bold, `--lightest-slate`, hover → `--green`, small external-link arrow icon) + description paragraph (`--slate`) + tech-pill row (reusing `.tech-pill` from Experience) on the right. No star/download metadata row — not meaningful for these projects.

At the bottom: "View Full Project Archive →" link to `archive.html` (built in Phase 2).

## What's removed from the current homepage
- `.hero` section and its staggered reveal-line animation.
- Tabbed experience UI (`.tab-list`/`.tab-panels`/`initTabs`).
- Alternating big-image "Featured Projects" layout (`.featured-project` grid).
- "Other Noteworthy Projects" card grid + Show More toggle (`.projects-grid`/`initShowMore`) — those 6 non-featured projects move into the Phase 2 archive table instead of living on the homepage.
- Contact section and footer CTA (dropped per your call — email lives in the sidebar).
- Watch-demo lightbox trigger buttons on project cards — dropped along with the cards themselves; the lightbox/slideshow JS (`script.js`) and video assets are no longer referenced from the homepage. (Not deleted from the repo in this phase — just unused until Phase 2 decides whether the archive table links to demos.)

## Interaction: scroll-spy nav
Replace `initNav`/`initTabs` in `animations.js` with `initSidebarNav()`:
```js
function initSidebarNav() {
  var links = document.querySelectorAll(".sidebar-nav a");
  var sections = Array.prototype.map.call(links, function (a) {
    return document.querySelector(a.getAttribute("href"));
  });
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var i = sections.indexOf(entry.target);
      if (entry.isIntersecting && i !== -1) {
        links.forEach(function (l) { l.classList.remove("is-active"); });
        links[i].classList.add("is-active");
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  sections.forEach(function (s) { if (s) observer.observe(s); });
}
```
The `rootMargin` biases the trigger point toward the vertical center of the viewport, so a section is marked active once it's roughly the one being read, not merely peeking into view.

## Rationale
- Matches the reference's actual proportions and spacing rather than approximating.
- Reuses existing design tokens (`--green`, `--slate`, `--font-mono`, `--transition`, `--border-radius`) so the rebuild stays visually consistent with the cursor-glow effect and any surviving styles (scrollbar, focus rings, `::selection`).
- Dropping the hamburger/drawer and tab JS is a net simplification, not just a rewrite — fewer moving parts for a 3-item nav.

## Out of scope
- The Archive page (Phase 2 — separate spec).
- Any changes to `assets/resume.pdf` itself (only how it's linked).
- Re-verifying the cursor-glow effect's z-index against the new `.sidebar`'s fixed stacking context — the glow is `z-index: 1`, `.sidebar` will need a higher z-index (it replaces `.nav`'s role); this phase's implementation should set `.sidebar { z-index: 50 }` to preserve the existing stacking relationship.

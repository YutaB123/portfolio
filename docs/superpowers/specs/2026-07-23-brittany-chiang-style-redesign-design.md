# Portfolio redesign: Brittany Chiang v4 style, Yuta's content

## Goal

Rebuild yutabanishky.com to exactly match the design system and structure of
https://v4.brittanychiang.com/ (verified against her open-source repo,
github.com/bchiang7/v4 — colors from `variables.js`, buttons/links from
`mixins.js`, section layout from each `sections/*.js` file, nav/sidebar
behavior from `nav.js`/`social.js`/`email.js`), populated entirely with
Yuta's own content. No AI-slop copy — content is drawn from his resume
(`~/Downloads/Yuta Banishky Resume.pdf`) and the existing site's project
descriptions.

This is a from-scratch visual rebuild. The current black/gold theme, sticky
split-photo hero, 3D coverflow gallery, and GSAP/ScrollTrigger rig are
removed. The existing demo lightbox (`script.js`) is kept and reused.

## Design tokens (copied exactly from her `:root`)

```css
--dark-navy: #020c1b;
--navy: #0a192f;
--light-navy: #112240;
--lightest-navy: #233554;
--navy-shadow: rgba(2,12,27,0.7);
--dark-slate: #495670;
--slate: #8892b0;
--light-slate: #a8b2d1;
--lightest-slate: #ccd6f6;
--white: #e6f1ff;
--green: #64ffda;
--green-tint: rgba(100,255,218,0.1);
--pink: #f57dff;
--blue: #57cbff;

--font-sans: 'Calibre','Inter','San Francisco','SF Pro Text',-apple-system,system-ui,sans-serif;
--font-mono: 'SF Mono','Fira Code','Fira Mono','Roboto Mono',monospace;

--fz-xxs:12px; --fz-xs:13px; --fz-sm:14px; --fz-md:16px; --fz-lg:18px;
--fz-xl:20px; --fz-xxl:22px; --fz-heading:32px;

--border-radius: 4px;
--nav-height: 100px;
--nav-scroll-height: 70px;
--tab-height: 42px;
--tab-width: 120px;
--easing: cubic-bezier(0.645,0.045,0.355,1);
--transition: all 0.25s cubic-bezier(0.645,0.045,0.355,1);
```

Since Calibre is a licensed/self-hosted font not available to us, fall back
to Inter (already loaded via Google Fonts) as the sans, which is first in
her own fallback stack. SF Mono isn't web-loadable either; fall back to
`'Roboto Mono', 'Fira Code', monospace` (already in her stack) — pull
Roboto Mono from Google Fonts alongside Inter.

Body: `background: var(--navy); color: var(--slate); font-size: var(--fz-xl)`
(18px on mobile). `scroll-behavior: smooth`. Custom thin scrollbar
(`dark-slate` thumb on `navy` track). `::selection` → lightest-navy bg.
Focus state: `outline: 2px dashed var(--green); outline-offset: 3px`
(replaces default focus ring everywhere, including `:focus-visible`).

### Reusable interaction patterns

- **Bordered button** (`.btn`): transparent bg, 1px solid green border,
  green text, mono font, `padding: 1.25rem 1.75rem` (small variant:
  `0.75rem 1rem`). Hover/focus: `box-shadow: 4px 4px 0 0 var(--green)` +
  `transform: translate(-5px,-5px)` (small: `3px 3px 0 0`, `-4px,-4px`).
- **Inline link**: green text, underline (`::after`, height 1px, green,
  opacity 0.5) grows from `width:0` to `100%` on hover.
- **Nav link**: plain text link, turns green on hover/focus, no underline.
- **Box shadow** (cards/photo): `0 10px 30px -15px var(--navy-shadow)`,
  deepens on hover.

## Page structure

### 1. Fixed left rail (social icons)
Vertical column, centered at the bottom-left edge of the viewport, hidden
below 1080px width. Icons: GitHub, LinkedIn (Yuta's real accounts — her
list of 5 doesn't apply). 1px vertical line below the icon list. Icons
lift `translateY(-3px)` on hover.

### 2. Fixed right rail (email)
Same treatment, right edge. Vertical (`writing-mode: vertical-rl`) mono
text reading `yutabanishky@gmail.com`, mailto link, vertical line above it.

### 3. Nav
Fixed top, `height: var(--nav-height)`, translucent navy
(`rgba(10,25,47,0.85)`) with `backdrop-filter: blur(10px)`. Shrinks to
`--nav-scroll-height` and hides on scroll-down / reveals on scroll-up
(past 50px scroll). Links, numbered with a mono green `0N.` prefix via
CSS counter:

```
01. About    → #about
02. Experience → #experience
03. Work     → #work
04. Contact  → #contact
```

Bordered small "Resume" button after the links, opens
`assets/resume.pdf` in a new tab (the actual resume PDF gets added to
`assets/`). Below 768px: nav links collapse into a hamburger that opens a
slide-in right-side panel (light-navy bg) with the same numbered links,
plus a big bordered Resume button.

### 4. Hero
`min-height: 100vh`, left-aligned, fades up on load (one line at a time,
100ms stagger) unless `prefers-reduced-motion`.

```
Hi, my name is                                  (green, mono, small)
Yuta Banishky.                                  (big heading, lightest-slate)
I build things that ship.                       (big heading, slate)

I'm an Informatics student at the University of Washington (Data
Science track) who likes turning ideas into something real — a working,
deployed product, not just a prototype. I build AI applications,
computer-vision games, and full-stack web apps, most of which are live
and linked below.

[ Check out my work ]   (bordered button → scrolls to #work)
```

### 5. About
`display:grid; grid-template-columns: 3fr 2fr` (stacks on mobile).

**Left (text):**
```
01. About Me                                    (numbered-heading)

Hello! I'm Yuta, a B.S. Informatics student at the University of
Washington on the Data Science track, expected to graduate in June
2029.

My interest in building things started before college — I founded
Bellevue Coding, a free weekly Python program for kids ages 8–14 at
the Bellevue Library, and Wilburton Soccer, a youth training program
I built and ran from scratch. Since then I've kept building: AI
applications, computer-vision games, real-time multiplayer apps, and
full-stack web products — most of them live and linked below.

Currently, I'm exploring LLM application development and coursework
in data programming and statistics at UW.

Here are a few technologies I've been working with recently:

▹ Python              ▹ Next.js / React
▹ JavaScript / SQL     ▹ Node.js / Express
▹ Claude & OpenAI APIs ▹ pandas / Matplotlib
```

**Right (photo):** `assets/headshot.jpg` in a `max-width: 300px` box.
Green square sits behind/offset from the image (`::after`, offset
+8px on hover); image is `grayscale(100%) + mix-blend-mode: multiply`
tinted green by default, snaps to full color and the square offsets
further on hover/focus.

### 6. Experience (tabbed, from resume EXPERIENCE section)

```
02. Where I've Worked                          (numbered-heading)

[Bellevue Coding] [Wilburton Soccer] [Mochinut]   ← tabs, vertical list
                                                      desktop / horizontal
                                                      scroll mobile

Founder & Instructor @ Bellevue Coding
Jan 2025 – Jun 2025

▹ Founded and taught a free weekly Python program for children ages
  8–14 at the Bellevue Library, designing all curriculum, lesson
  plans, and practice exercises from scratch in Python, VS Code, and
  Scratch.
▹ Grew enrollment from 3 to 7 students per session through
  consistent, hands-on weekly instruction and informal office hours
  tailored to each student's pace.
```
(Wilburton Soccer and Mochinut tabs follow the same title/dates/bullets
pattern, copied verbatim from the resume's EXPERIENCE section.) Green
1px vertical highlight bar slides between tabs on selection
(`transform: translateY`), active tab text green, inactive slate.

### 7. Work — Featured Projects (large, alternating)

```
03. Some Things I've Built                      (numbered-heading)
```

Three entries, alternating left/right image placement, in this order:

**Dubly** (external: canvas-study-assistant.onrender.com/chat · github:
YutaB123/dubly · demo: lightbox via existing `script.js`)
> A husky-themed study buddy wired to your UW Canvas. Chat to see
> what's due and your grades, ask about any syllabus, and spin up
> quizzes, flashcards, study plans, and Word docs for your
> assignments — plus a bring-your-own-API-key architecture that keeps
> it free to run at scale.
Tech: Next.js, Twilio, Canvas LMS API, Anthropic Claude API

**AI CSV Data Analyzer** (external: csv-reader-iyw5.onrender.com ·
github: YutaB123/CSV-Reader)
> Upload a CSV, ask questions about it in plain English, and get
> answers with auto-generated bar, pie, line, and scatter charts. A
> three-stage agent pipeline (LLM planning → local Python execution →
> LLM explanation) keeps raw data on-device, sending only schema and
> aggregates to the API for privacy.
Tech: Python, Gradio, pandas, OpenAI GPT-4o-mini, Matplotlib

**Yutachess** (external: yutachess-production.up.railway.app · github:
YutaB123/yutachess)
> Real-time multiplayer chess — share a 6-character room code, pick a
> time control (Bullet/Blitz/Rapid), and play with live rematch
> support synchronized over WebSockets. Server-authoritative move
> validation blocks illegal moves and guarantees fair play across
> concurrent clients.
Tech: Node.js, Express, Socket.IO, chess.js

Each: overline "Featured Project" (green, mono), title (lightest-slate,
links to external), description in a `light-navy` card, mono tech tag
list, GitHub + external-link icon row. Image side: screenshot
(existing `assets/screenshots/*`) at green duotone by default
(`mix-blend-mode: multiply` + `grayscale`), snaps to full color on
hover; whole image is a link to the external URL.

### 8. Other Noteworthy Projects (grid, no images)

```
Other Noteworthy Projects
view the archive → (only if/when a project archive page exists — omit for now)
```

Grid, `repeat(auto-fill, minmax(300px,1fr))`, shows first 6, "Show More"
button reveals the remaining 3 (9 total, same show/hide toggle logic as
hers). Card: folder icon (green, top-left) + GitHub/external icon row
(top-right) + title (lightest-slate) + description (light-slate) + mono
tech-tag list pinned to bottom. Whole card lifts `translateY(-7px)` on
hover, `light-navy` bg, box-shadow.

Order: AI Debate Colosseum, AI Resume Analyzer, AI Poker Room, AdSnap,
recipe.AI, Charades vs. AI, Hand Tennis, Zyde, KitNations — copy/tags
carried over from the current site's cards. AdSnap and recipe.AI use
the existing lightbox demo (`data-demo` attribute + a small "play" icon)
in place of an external-link icon, since neither has a public live URL.

### 9. Contact

```
04. What's Next?                    (overline, numbered-heading style)
Get In Touch                        (big centered heading)

I'm currently open to internships and new opportunities. Whether you
have a question, a project idea, or just want to say hi, my inbox is
open — I'll get back to you.

[ Say Hello ]   (big bordered button → mailto:yutabanishky@gmail.com)
```

### 10. Footer
Centered, mono, small, light-slate: "Designed & Built by Yuta
Banishky" linking to the site's GitHub repo. On mobile (<768px), a row
of the same social icons appears above the credit line (the fixed side
rails are hidden at that width).

## Technical approach

- **No React/Gatsby** — this stays a static HTML/CSS/vanilla-JS site.
  Her component behaviors are reimplemented directly:
  - Scroll-reveal (fade-up on section/card entry) → `IntersectionObserver`
  - Nav shrink/hide-on-scroll → `scroll` listener comparing last position
  - Hero line stagger on load → CSS animation classes toggled after a
    short timeout, gated behind `prefers-reduced-motion` (same pattern
    already used for `.is-loading` in `index.html`)
  - Experience tabs → small vanilla JS tab controller (click + arrow-key
    nav, ARIA `tablist`/`tab`/`tabpanel` roles, matching her a11y
    pattern)
  - Grid "Show More" → toggle a class that reveals the hidden `<li>`s
  - Mobile hamburger menu → toggle a class, trap focus, close on Escape
    /outside click (matching her `menu.js` behavior)
- **Removed:** `gallery.js` (coverflow), the black/gold theme in
  `styles.css`, GSAP/ScrollTrigger `<script>` tags and any code in
  `animations.js` that drives them, the sticky split-photo hero markup.
- **Kept as-is:** `script.js` (demo lightbox) — reused for Dubly, AdSnap,
  recipe.AI.
- **Files touched:** `index.html` (full rewrite), `styles.css` (full
  rewrite), `animations.js` (rewrite — reveal/nav/tabs/show-more logic),
  `script.js` (unchanged), new `assets/resume.pdf` (copy of
  `~/Downloads/Yuta Banishky Resume.pdf`).
- Existing screenshots/headshot/favicons are reused as-is; no new image
  assets needed.

## Content sourcing note

Bio, Experience section, and the Dubly/CSV-Analyzer/Yutachess featured
descriptions are drawn from `~/Downloads/Yuta Banishky Resume.pdf`
(resume dated 2026-07-23, the most recently modified of several resume
files found in Downloads). The other 9 project descriptions/tags are
carried over from the current site's existing card copy, which was
already accurate and specific (not resume-sourced, since the resume
only details 3 projects).

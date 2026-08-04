# Data Analyst Repositioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retarget the portfolio site and résumé from software-engineering positioning to data-analyst positioning, promoting analysis work above software projects.

**Architecture:** Content-and-ordering changes to two existing static HTML files, one PIL asset generator, plus one new self-contained HTML résumé that headless Chrome prints to PDF. No CSS architecture changes — every change reuses existing classes (`selected-project`, `tech-pill`, `exp-entry`, `projects-heading-secondary`).

**Tech Stack:** Plain HTML + CSS (no build step), Python 3 + Pillow 10.4.0 for `og-image.png`, headless Chrome for PDF generation.

## Global Constraints

- **No fabricated credentials.** Every metric must already appear in `C:\Users\yutab\OneDrive\Documents\Resume\Yuta Resume.pdf`. Do not invent numbers, tools, or coursework. Do not add skills (e.g. Tableau, Power BI, Jupyter, A/B testing) that the existing résumé does not claim.
- **Copy rule:** zero occurrences of "Software Developer" or "software engineering" in site copy or résumé after this work.
- **No emojis** anywhere — this is a résumé artifact (per user preference).
- **No layout/CSS changes.** Reuse existing classes only. Do not edit `styles.css`.
- **Duplicated sidebar:** `index.html` and `archive.html` each contain their own copy of the sidebar markup. Any sidebar change must be applied to BOTH.
- **Verification is grep-based**, not unit-tested — this repo has no test framework. Each task defines the exact grep that must fail before the change and pass after.
- Chrome is at `C:\Program Files\Google\Chrome\Application\chrome.exe`.
- Site root is `C:\Claude\Yuta Website`. Run all commands from there.

---

### Task 1: Identity and social metadata

**Files:**
- Modify: `index.html:19-44` (title, meta description, OG, Twitter), `index.html:59-63` (sidebar title + desc)
- Modify: `archive.html:6-7` (title, meta description), `archive.html:27-31` (sidebar title + desc)

**Interfaces:**
- Consumes: nothing.
- Produces: the canonical role string **`Data Analyst`** and the canonical blurb **`I turn messy public datasets into decisions people can act on — Python, SQL, and pandas.`** Tasks 2 and 6 reuse both verbatim.

- [ ] **Step 1: Confirm the old copy is present (the check that must fail after)**

```bash
grep -c "Software Developer" index.html archive.html
```
Expected: `index.html:3`, `archive.html:1` — four hits total.

- [ ] **Step 2: Rewrite `index.html` head metadata**

Replace lines 19-20:

```html
  <title>Yuta Banishky — Data Analyst</title>
  <meta name="description" content="Portfolio of Yuta Banishky — Informatics student at the University of Washington (Data Science track). Data analysis in Python, SQL, and pandas, turning public datasets into decisions." />
```

Replace the OG block (lines 30-38):

```html
  <meta property="og:title" content="Yuta Banishky — Data Analyst" />
  <meta property="og:description" content="Informatics @ UW (Data Science). I analyze public datasets in Python and SQL to find what's actually actionable — and build the tools that deliver it." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://yutabanishky.com/" />
  <meta property="og:site_name" content="Yuta Banishky" />
  <meta property="og:image" content="https://yutabanishky.com/assets/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Yuta Banishky — Data analyst. Informatics @ UW, Data Science." />
```

Replace the Twitter block (lines 41-44):

```html
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Yuta Banishky — Data Analyst" />
  <meta name="twitter:description" content="Informatics @ UW (Data Science). I analyze public datasets in Python and SQL to find what's actually actionable — and build the tools that deliver it." />
  <meta name="twitter:image" content="https://yutabanishky.com/assets/og-image.png" />
```

- [ ] **Step 3: Rewrite the sidebar block in `index.html`**

Replace lines 59-63:

```html
          <h2 class="sidebar-title">Data Analyst</h2>
          <p class="sidebar-desc">
            I turn messy public datasets into decisions people can act on — Python, SQL, and
            pandas.
          </p>
```

- [ ] **Step 4: Apply the same sidebar block to `archive.html`**

Replace `archive.html` lines 27-31 with the identical five lines from Step 3 (indentation matches — both files use 10 spaces for `<h2>`).

- [ ] **Step 5: Update `archive.html` head metadata**

Replace lines 6-7:

```html
  <title>All Projects — Yuta Banishky</title>
  <meta name="description" content="Full project archive for Yuta Banishky — data analyst and Informatics student at the University of Washington (Data Science track)." />
```

- [ ] **Step 6: Verify the copy rule holds**

```bash
grep -rn "Software Developer\|software engineering\|computer-vision games" index.html archive.html
```
Expected: no output, exit code 1.

```bash
grep -c "Data Analyst" index.html archive.html
```
Expected: `index.html:4`, `archive.html:1`.

- [ ] **Step 7: Commit**

```bash
git add index.html archive.html
git commit -m "Rebrand site identity from software developer to data analyst"
```

---

### Task 2: Regenerate the social card

**Files:**
- Modify: `make_assets.py:81`
- Regenerate: `assets/og-image.png`

**Interfaces:**
- Consumes: the role string from Task 1.
- Produces: `assets/og-image.png` at exactly 1200x630 (the dimensions Task 1's `og:image:width`/`height` declare).

- [ ] **Step 1: Confirm the stale text is in the generator**

```bash
grep -n "Software developer" make_assets.py
```
Expected: line 81.

- [ ] **Step 2: Rewrite the role lines**

Replace line 81:

```python
    role_lines = ["Data analyst — Python, SQL & pandas.", "Turning public data into decisions."]
```

- [ ] **Step 3: Regenerate and confirm dimensions**

Run: `python make_assets.py`
Expected output includes: `wrote assets/og-image.png (1200, 630)`

If the two role lines overflow past x=1200-360-70=770px available width, shorten
the second line to `"Turning public data into answers."` and re-run. Do not
change the font size or layout.

- [ ] **Step 4: Visually confirm the card**

Open `assets/og-image.png` and confirm: the eyebrow still reads
`INFORMATICS @ UW · DATA SCIENCE`, the role lines read as data-analyst framing,
no text collides with the headshot frame at x=770.

- [ ] **Step 5: Commit**

```bash
git add make_assets.py assets/og-image.png
git commit -m "Regenerate social card with data analyst framing"
```

---

### Task 3: Rewrite the About section

**Files:**
- Modify: `index.html:87-114`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing consumed downstream.

- [ ] **Step 1: Confirm the old copy is present**

```bash
grep -n "computer-vision\|real-time multiplayer" index.html
```
Expected: hits inside the about panel around lines 97-99.

- [ ] **Step 2: Replace the About panel body**

Replace lines 88-113 (everything between `<section id="about" ...>` and `</section>`):

```html
        <p>
          Hello! I'm Yuta, a B.S. Informatics student at the University of Washington on the Data
          Science track, expected to graduate in June 2029.
        </p>
        <p>
          I'm drawn to the part of analysis that actually changes a decision. Volunteering at the
          <span class="about-highlight">University Food Bank</span>, that meant working through
          distribution data to find which items kept running out — and cutting stockouts on them by
          18%. Analyzing Seattle's traffic collisions, it meant weighting 221,266 records by how
          severe each crash was instead of just counting them, which surfaced a cyclist hotspot
          that raw crash counts had buried.
        </p>
        <p>
          Before college I founded <span class="about-highlight">Bellevue Coding</span>, a free
          weekly Python program for kids ages 8–14 at the Bellevue Library, and
          <span class="about-highlight">Wilburton Soccer</span>, a youth training program I built
          and ran from scratch. I still build software — mostly tools that put data or AI in front
          of people — and most of it is live and linked below.
        </p>
        <p>
          Currently I'm taking coursework in data programming and statistics at UW, and spending my
          own time getting sharper with SQL.
        </p>
        <p>Here are a few technologies I've been working with recently:</p>
        <ul class="skills-list">
          <li>Python</li>
          <li>SQL</li>
          <li>pandas / Matplotlib</li>
          <li>Excel</li>
          <li>Statistical analysis</li>
          <li>Next.js / React</li>
        </ul>
```

Note: `.skills-list` is a 2-column grid, so 6 items fill 3 clean rows. Keep the
count at 6.

- [ ] **Step 3: Verify**

```bash
grep -n "computer-vision\|real-time multiplayer\|I build things that ship" index.html
```
Expected: no output, exit code 1.

Open `index.html` in a browser and confirm the About panel renders four
paragraphs, one lead-in line, and a 6-item skills grid with Python first.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Lead About section with analysis work instead of software building"
```

---

### Task 4: Bring the résumé's quantified results onto the site

**Files:**
- Modify: `index.html:119-163` (the three Relevant Experience entries that have metrics on the résumé but not the site)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing consumed downstream.

**Source of every number below** — `Yuta Resume.pdf`, verbatim. Do not round,
embellish, or add figures not listed here.

- [ ] **Step 1: Confirm the site is currently missing the metrics**

```bash
grep -c "340+\|18%\|12%\|200+ households\|50-member" index.html
```
Expected: `0`.

- [ ] **Step 2: Replace the University Food Bank bullets**

Replace lines 123-127:

```html
            <ul>
              <li>Analyzed distribution data across 340+ weekly orders to identify demand patterns, reducing stockouts on high-turnover items by 18% and cutting overstock waste by 12% over one quarter.</li>
              <li>Support inventory management for a food bank serving 200+ households weekly, including students, community members, and unhoused individuals experiencing food insecurity.</li>
            </ul>
            <ul class="tech-pill-list"><li class="tech-pill">Python</li><li class="tech-pill">pandas</li><li class="tech-pill">SQL</li><li class="tech-pill">Excel</li></ul>
```

- [ ] **Step 3: Replace the UW Data Science Club bullets**

Replace lines 135-139:

```html
            <ul>
              <li>Coordinated project timelines across 6 teams of 4–5 members, delivering 3 completed projects per quarter for a 50-member club.</li>
              <li>Organized club meetings and workshops, connecting members with project opportunities and technical resources to build practical data science skills.</li>
            </ul>
            <ul class="tech-pill-list"><li class="tech-pill">Python</li><li class="tech-pill">Data Analysis</li></ul>
```

- [ ] **Step 4: Replace the Bellevue High School Peer Tutor bullets**

The résumé claims statistics tutoring and an outcome the site omits entirely.
Replace lines 159-161:

```html
            <ul>
              <li>Tutored 15 students per week in introductory programming and statistics, holding 6 hours of sessions weekly across 2 semesters; 80% of tutees reported improved course grades.</li>
            </ul>
            <ul class="tech-pill-list"><li class="tech-pill">Python</li><li class="tech-pill">Statistics</li></ul>
```

- [ ] **Step 5: Verify**

```bash
grep -c "340+\|18%\|12%\|200+ households\|50-member\|80% of tutees" index.html
```
Expected: `6`.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "Add quantified analysis results to site experience entries"
```

---

### Task 5: Promote Data & Analysis above the software projects

**Files:**
- Modify: `index.html:200-317` (the whole `#work` projects panel)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing consumed downstream.

**Target order inside `<section id="work">`:**
1. `.resume-link` (View Full Résumé) — unchanged, stays first
2. `<h3 class="projects-heading">Data &amp; Analysis</h3>`
3. Seattle Traffic Collision Analysis card (moved up from the bottom, copy unchanged)
4. AI CSV Data Analyzer card (**new** — promoted from `archive.html`)
5. `<h3 class="projects-heading projects-heading-secondary">Software &amp; Product Projects</h3>`
6. Dubly, AI Poker Room, Yutachess, CineMate, KitNations (copy unchanged)
7. `.archive-link` (View Full Project Archive) — moves to the very end

Rationale for moving `.archive-link`: it currently sits between the two project
groups, which after reordering would read as if the archive only covered the
data projects. `.archive-link` has `margin-top: 40px`, so it spaces correctly
as the last child.

- [ ] **Step 1: Confirm current order is software-first**

```bash
grep -n "projects-heading\|archive-link\|selected-project-title" index.html
```
Expected: `Selected Projects` heading appears before the `Data Analysis`
heading, and `archive-link` appears between them (around line 293).

- [ ] **Step 2: Change the two headings**

Line 203 becomes:

```html
        <h3 class="projects-heading">Data &amp; Analysis</h3>
```

Line 295 becomes:

```html
        <h3 class="projects-heading projects-heading-secondary">Software &amp; Product Projects</h3>
```

- [ ] **Step 3: Move the Seattle collision card up**

Cut the entire `<div class="selected-project">` block for Seattle Traffic
Collision Analysis (lines 297-316) and paste it immediately after the
`Data &amp; Analysis` heading. Leave its markup and description text byte-identical
— the plain-language blurb was deliberately rewritten in commit `0c49bbc` and
must not be re-edited.

- [ ] **Step 4: Add the AI CSV Data Analyzer card**

Insert immediately after the Seattle collision card. `assets/screenshots/csv.jpg`
already exists and is 1280x800 — use those exact intrinsic dimensions so the
browser reserves the right space and the page doesn't shift on load.

```html
        <div class="selected-project">
          <a class="selected-project-thumb" href="https://csv-reader-iyw5.onrender.com/" target="_blank" rel="noopener">
            <img src="assets/screenshots/csv.jpg" alt="AI CSV Data Analyzer — plain-English questions answered with generated charts" loading="lazy" width="1280" height="800" />
          </a>
          <div class="selected-project-body">
            <h4 class="selected-project-title"><a href="https://csv-reader-iyw5.onrender.com/" target="_blank" rel="noopener">AI CSV Data Analyzer <span aria-hidden="true">↗</span></a></h4>
            <p class="selected-project-desc">
              Upload a CSV, ask a question in plain English, and get back the chart that answers
              it. A three-stage pipeline decides what to compute, runs the pandas itself, then
              explains the result — and only the column names ever leave your machine, so the raw
              rows stay on-device.
            </p>
            <ul class="tech-pill-list">
              <li class="tech-pill">Python</li><li class="tech-pill">pandas</li><li class="tech-pill">Gradio</li><li class="tech-pill">OpenAI GPT-4o-mini</li>
            </ul>
          </div>
        </div>
```

- [ ] **Step 5: Reorder the software cards and move the archive link**

Under the `Software &amp; Product Projects` heading, order the five existing
cards: Dubly, AI Poker Room, Yutachess, CineMate, KitNations. (Yutachess and
KitNations swap relative to today; their markup is otherwise unchanged.)

Then move the `.archive-link` anchor so it is the last element before
`</section>`:

```html
        <a class="archive-link" href="archive.html">View Full Project Archive <span aria-hidden="true">→</span></a>
```

- [ ] **Step 6: Fix the poker image dimension mismatch (drive-by)**

`assets/screenshots/poker.jpg` is actually 1280x844 but the markup declares
`height="800"`, which causes a small layout shift. Correct it:

```html
            <img src="assets/screenshots/poker.jpg" alt="AI Poker Room — LLMs playing five-card draw against each other" loading="lazy" width="1280" height="844" />
```

- [ ] **Step 7: Verify order and integrity**

```bash
grep -n "projects-heading\|archive-link\|selected-project-title\|<img src=" index.html
```
Expected order: `Data &amp; Analysis` → collisions img → csv img →
`Software &amp; Product Projects` → dubly → poker → chess → cinemate → kit →
`archive-link` last.

Confirm no card was lost or duplicated:
```bash
grep -c "class=\"selected-project\"" index.html
```
Expected: `7` (2 data + 5 software).

Confirm the CSV Analyzer is still listed in the archive (featuring it must not
remove it from the full list):
```bash
grep -c "csv-reader-iyw5" archive.html
```
Expected: `2`.

Open `index.html` in a browser. Confirm all 7 thumbnails load, no broken
images, and the `#work` anchor from the sidebar nav still scrolls correctly.
Then narrow to <600px and confirm cards stack to one column.

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "Lead projects with Data & Analysis, feature the CSV analyzer"
```

---

### Task 6: Rebuild the résumé as HTML and generate the PDF

**Files:**
- Create: `resume/resume.html` (self-contained — inline `<style>`, no dependency on `styles.css`)
- Create: `build_resume.py`
- Overwrite: `assets/resume.pdf`
- Modify: `README.md` (document the build step)

**Interfaces:**
- Consumes: the role framing from Task 1.
- Produces: `assets/resume.pdf`, which `index.html:201`'s `.resume-link` already points at. That link needs no change.

**Content changes from the current PDF** — everything else stays byte-equivalent
in meaning:

| Section | Change |
|---|---|
| Summary line | Drop "and software engineering internships". Target data analyst roles only. |
| Technical Skills | Lead with Languages and Data & Analysis. Demote Next.js/Node.js into a trailing Tools line. |
| Projects | Seattle Collision Analysis first, AI CSV Data Analyzer second, Canvas SMS Study Assistant last and cut to one bullet. |
| Education, Experience, Other Experience | Unchanged — already accurate and analyst-appropriate. |

- [ ] **Step 1: Create `resume/resume.html`**

Single page, US Letter, 0.5in margins, serif to match the existing PDF's look.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Yuta Banishky — Résumé</title>
<style>
  @page { size: letter; margin: 0.5in; }
  * { box-sizing: border-box; }
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 10.5pt;
    line-height: 1.28;
    color: #000;
    margin: 0;
  }
  h1 { font-size: 20pt; text-align: center; margin: 0 0 2pt; }
  .contact, .summary { text-align: center; font-size: 9.5pt; margin: 0 0 2pt; }
  .summary { font-style: italic; margin-bottom: 8pt; }
  a { color: #000; }
  h2 {
    font-size: 10.5pt;
    text-transform: uppercase;
    border-bottom: 1px solid #000;
    margin: 9pt 0 4pt;
    padding-bottom: 1pt;
  }
  .row { display: flex; justify-content: space-between; }
  .row .left { font-weight: bold; }
  .row.sub { font-style: italic; }
  ul { margin: 2pt 0 0; padding-left: 16pt; }
  li { margin-bottom: 1.5pt; }
  .skills p { margin: 0 0 2pt; }
  .entry { margin-bottom: 6pt; }
  .proj { margin-bottom: 5pt; }
  .proj-title { font-weight: bold; }
  .proj-stack { font-style: italic; }
</style>
</head>
<body>

<h1>Yuta Banishky</h1>
<p class="contact">425-321-7715 | yutabanishky@gmail.com | yutabanishky.com | github.com/YutaB123</p>
<p class="summary">Data Science student focused on turning large public datasets into findings people can act on; seeking data analyst internships</p>

<h2>Education</h2>
<div class="entry">
  <div class="row"><span class="left">University of Washington</span><span>Expected June 2029</span></div>
  <div class="row sub"><span>B.S. in Informatics, Data Science Track — GPA: 3.75</span><span>Seattle, WA</span></div>
  <ul><li>Relevant Coursework: CSE 163 (Intermediate Data Programming), STAT 311 (Intro to Statistical Methods), INFO 201</li></ul>
</div>

<h2>Experience</h2>
<div class="entry">
  <div class="row"><span class="left">Volunteer Data Analyst</span><span><strong>Jan 2026 – Present</strong></span></div>
  <div class="row sub"><span>University Food Bank</span><span>Seattle, WA</span></div>
  <ul>
    <li>Analyzed distribution data across 340+ weekly orders to identify demand patterns, reducing stockouts on high-turnover items by 18% and cutting overstock waste by 12% over one quarter</li>
    <li>Supported inventory management for a food bank serving 200+ households weekly, including students, community members, and unhoused individuals experiencing food insecurity</li>
  </ul>
</div>
<div class="entry">
  <div class="row"><span class="left">Project Officer</span><span><strong>Nov 2025 – May 2026</strong></span></div>
  <div class="row sub"><span>UW Data Science Club</span><span>Seattle, WA</span></div>
  <ul>
    <li>Coordinated project timelines across 6 teams of 4–5 members, delivering 3 completed projects per quarter for a 50-member club</li>
    <li>Organized club meetings and workshops, connecting members with project opportunities and technical resources to build practical data science skills</li>
  </ul>
</div>
<div class="entry">
  <div class="row"><span class="left">Founder &amp; Instructor</span><span><strong>Jan 2025 – Jun 2025</strong></span></div>
  <div class="row sub"><span>Bellevue Coding</span><span>Bellevue, WA</span></div>
  <ul>
    <li>Founded and taught a free weekly Python program for children ages 8–14 at the Bellevue Library, designing all curriculum and lesson plans from scratch; grew enrollment from 3 to 7 students per session</li>
  </ul>
</div>
<div class="entry">
  <div class="row"><span class="left">Peer Tutor, Coding &amp; Computer Science</span><span><strong>Sep 2023 – Jun 2025</strong></span></div>
  <div class="row sub"><span>Bellevue High School</span><span>Bellevue, WA</span></div>
  <ul>
    <li>Tutored 15 students per week in intro programming and statistics, holding 6 hours of sessions weekly across 2 semesters; 80% of tutees reported improved course grades</li>
  </ul>
</div>

<h2>Projects</h2>
<div class="proj">
  <p style="margin:0"><span class="proj-title">Seattle Traffic Collision Analysis</span> | <span class="proj-stack">Python, pandas, Matplotlib</span></p>
  <ul>
    <li>Analyzed 221,266 records from the City of Seattle's SDOT Collisions dataset (2004–present) to identify where the city should prioritize traffic safety spending</li>
    <li>Answered three research questions on crash-location hotspots, street lighting effects, and time-of-day severity patterns, isolating cyclist-strike hotspots (e.g. Burke-Gilman Trail crossings) as the strongest actionable finding</li>
    <li>Found commute hours (5–7pm, 6–7am) had higher average crash severity than late-night hours, contrary to initial hypothesis; published on GitHub</li>
  </ul>
</div>
<div class="proj">
  <p style="margin:0"><span class="proj-title">AI CSV Data Analyzer</span> | <span class="proj-stack">Python, pandas, Gradio, OpenAI GPT-4o-mini</span></p>
  <ul>
    <li>Built a tool to upload a CSV, ask questions in plain English, and receive auto-generated charts in response</li>
    <li>Designed a three-stage agent pipeline that keeps raw data on-device for privacy, sending only column schemas off-machine</li>
  </ul>
</div>
<div class="proj">
  <p style="margin:0"><span class="proj-title">Canvas SMS Study Assistant</span> | <span class="proj-stack">Next.js, Twilio, Claude API</span></p>
  <ul>
    <li>Built an SMS study assistant that texts AI-generated flashcards and tracks Canvas deadlines, with a bring-your-own-token model to keep it free to run at scale</li>
  </ul>
</div>

<h2>Technical Skills</h2>
<div class="skills">
  <p><strong>Languages:</strong> Python, SQL, R, JavaScript</p>
  <p><strong>Data &amp; Analysis:</strong> pandas, Matplotlib, Excel, statistical analysis, data cleaning &amp; visualization</p>
  <p><strong>AI &amp; APIs:</strong> Anthropic Claude API, OpenAI API, LLM application development</p>
  <p><strong>Tools:</strong> Git, GitHub, VS Code, Microsoft Azure, Next.js, Node.js</p>
</div>

<h2>Other Experience</h2>
<div class="entry">
  <div class="row"><span class="left">Shift Manager</span><span><strong>Mar 2024 – May 2025</strong></span></div>
  <div class="row sub"><span>Mochinut</span><span>Bellevue, WA</span></div>
  <ul>
    <li>Managed shift operations for a 5-person team serving roughly 300 customers daily; drove a 5–10% increase in shift sales through upselling and operational efficiency</li>
  </ul>
</div>
<div class="entry">
  <div class="row"><span class="left">Founder &amp; Organizer</span><span><strong>Mar 2024 – Aug 2024</strong></span></div>
  <div class="row sub"><span>Wilburton Soccer</span><span>Bellevue, WA</span></div>
  <ul>
    <li>Founded and operated a youth soccer training program with a paid membership model; grew participation from 2 to 8+ players per session through self-directed outreach</li>
  </ul>
</div>

</body>
</html>
```

- [ ] **Step 2: Create `build_resume.py`**

```python
"""
Render resume/resume.html to PDF via headless Chrome.

Writes:
  assets/resume.pdf   what the site's "View Full Resume" link serves
  <OneDrive>/Resume/Yuta Resume.pdf   Yuta's working copy, if the folder exists

Run:  python build_resume.py
"""
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent.resolve()
SRC = ROOT / "resume" / "resume.html"
OUT = ROOT / "assets" / "resume.pdf"
ONEDRIVE = Path(os.path.expanduser("~")) / "OneDrive" / "Documents" / "Resume"

CHROME_CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
]


def find_browser():
    for path in CHROME_CANDIDATES:
        if os.path.exists(path):
            return path
    sys.exit("No Chrome or Edge found. Install one, or add its path to CHROME_CANDIDATES.")


def main():
    if not SRC.exists():
        sys.exit(f"Missing source: {SRC}")

    browser = find_browser()
    OUT.parent.mkdir(parents=True, exist_ok=True)

    subprocess.run(
        [
            browser,
            "--headless",
            "--disable-gpu",
            "--no-pdf-header-footer",
            f"--print-to-pdf={OUT}",
            SRC.as_uri(),
        ],
        check=True,
    )
    print(f"wrote {OUT} ({OUT.stat().st_size:,} bytes)")

    if ONEDRIVE.is_dir():
        dest = ONEDRIVE / "Yuta Resume.pdf"
        shutil.copyfile(OUT, dest)
        print(f"copied to {dest}")
    else:
        print(f"skipped OneDrive copy - {ONEDRIVE} not found")


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Generate the PDF**

Run: `python build_resume.py`
Expected: `wrote ...\assets\resume.pdf (N bytes)` then `copied to ...`.

If Chrome rejects `--no-pdf-header-footer` (older builds used
`--print-to-pdf-no-header`), swap the flag and re-run. If the PDF comes out
blank, the `file://` URI failed — confirm `SRC.as_uri()` percent-encodes the
space in `Yuta Website`.

- [ ] **Step 4: Verify the PDF is one page and correct**

```bash
python -c "d=open('assets/resume.pdf','rb').read(); print('pages:', d.count(b'/Type /Page') - d.count(b'/Type /Pages'))"
```
Expected: `pages: 1`. If it reports 2, reduce `body` `font-size` to `10pt` and
`line-height` to `1.22` in `resume/resume.html`, then re-run Step 3.

Open `assets/resume.pdf` and confirm: name centred, no browser header/footer
text, no clipped right margin, section rules span the full width.

- [ ] **Step 5: Confirm the copy rule holds in the résumé source**

```bash
grep -n "software engineering\|Software Developer" resume/resume.html
```
Expected: no output, exit code 1.

- [ ] **Step 6: Document the build in `README.md`**

The README is stale in other ways (it still describes a `.hero`/`.card` layout
this site no longer uses). Do NOT rewrite it wholesale — that's out of scope.
Append only this section:

```markdown
## Résumé

`resume/resume.html` is the editable source. After editing it, regenerate the PDF:

```bash
python build_resume.py
```

That writes `assets/resume.pdf` (served by the site's "View Full Résumé" link)
and copies it over `~/OneDrive/Documents/Resume/Yuta Resume.pdf`. Requires
Chrome or Edge; no other dependency.
```

- [ ] **Step 7: Commit**

```bash
git add resume/resume.html build_resume.py assets/resume.pdf README.md
git commit -m "Rebuild resume as HTML source targeting data analyst roles"
```

---

### Task 7: Full-site verification

**Files:** none modified — this task only inspects.

**Interfaces:**
- Consumes: the output of Tasks 1-6.
- Produces: a pass/fail report.

- [ ] **Step 1: Copy rule across every tracked text file**

```bash
grep -rn "Software Developer\|software engineering" --include=*.html --include=*.py --include=*.md . | grep -v docs/superpowers
```
Expected: no output. (`docs/superpowers` is excluded because the spec and this
plan legitimately quote the old strings.)

- [ ] **Step 2: No broken asset references**

```bash
python - <<'PY'
import re, pathlib
for page in ("index.html", "archive.html"):
    for src in re.findall(r'(?:src|href)="((?!http|mailto|#)[^"]+)"', pathlib.Path(page).read_text(encoding="utf-8")):
        p = pathlib.Path(src.lstrip("/"))
        print(("OK  " if p.exists() else "MISS"), page, src)
PY
```
Expected: every line starts `OK`.

- [ ] **Step 3: Serve and check both pages render**

```bash
python nocache_server.py
```
Visit `http://localhost:8000/` and `http://localhost:8000/archive.html`.
Confirm: sidebar reads "Data Analyst" on both; About shows the analysis-led
copy; Experience shows the metrics; Projects leads with Data & Analysis
containing 2 cards, then Software & Product Projects with 5; the résumé link
opens the new one-page PDF. Check at 1440px and at 375px.

- [ ] **Step 4: Report**

State plainly which checks passed and which failed, with the actual command
output. Do not claim success for any check that was not run.

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
|---|---|
| 1. Identity (`index.html`, `archive.html`, meta, OG/Twitter) | Task 1 |
| 1. `og-image.png` regeneration | Task 2 |
| 2. About | Task 3 |
| 3. Experience metrics | Task 4 |
| 4. Projects reorder + CSV Analyzer promotion | Task 5 |
| 5. Résumé HTML + PDF + README | Task 6 |
| Verification section | Task 7 |

No gaps.

**Deviation from the spec, noted deliberately:** the spec's §4 mentions
reframing software project descriptions to surface data dimensions (e.g.
CineMate's Azure SQL). Task 5 does not do this. Those descriptions are
accurate and well-written, and rewriting them to sound more data-flavored
than the projects actually are cuts against the no-inflation constraint.
Demoting them below the Data & Analysis heading already does the positioning
work. Flag this to the user rather than silently dropping it.

**Placeholder scan:** none — every code step carries literal content.

**Type consistency:** `build_resume.py` uses `SRC`/`OUT`/`ONEDRIVE` consistently;
`find_browser()` is defined before use in `main()`. Class names used in Task 5
(`selected-project`, `selected-project-thumb`, `selected-project-body`,
`selected-project-title`, `selected-project-desc`, `tech-pill-list`,
`tech-pill`, `projects-heading`, `projects-heading-secondary`, `archive-link`)
all verified present in `styles.css`.

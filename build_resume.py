"""
Render resume/resume.html to PDF via headless Chrome.

Writes:
  assets/resume.pdf                    what the site's "View Full Resume" link serves
  <OneDrive>/Documents/Resume/Yuta Resume.pdf   Yuta's working copy, if that folder exists

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
ONEDRIVE = Path.home() / "OneDrive" / "Documents" / "Resume"

BROWSER_CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
]


def find_browser():
    for path in BROWSER_CANDIDATES:
        if os.path.exists(path):
            return path
    sys.exit("No Chrome or Edge found. Add its path to BROWSER_CANDIDATES.")


def page_count(pdf: Path) -> int:
    """Rough page count: /Type /Page objects minus the single /Type /Pages tree node."""
    data = pdf.read_bytes()
    return data.count(b"/Type /Page") - data.count(b"/Type /Pages")


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

    if not OUT.exists():
        sys.exit("Chrome exited cleanly but wrote no PDF.")

    pages = page_count(OUT)
    print(f"wrote {OUT} ({OUT.stat().st_size:,} bytes, {pages} page(s))")
    if pages != 1:
        print(f"WARNING: expected 1 page, got {pages}. Tighten resume.html font-size/line-height.")

    if ONEDRIVE.is_dir():
        dest = ONEDRIVE / "Yuta Resume.pdf"
        shutil.copyfile(OUT, dest)
        print(f"copied to {dest}")
    else:
        print(f"skipped OneDrive copy - {ONEDRIVE} not found")


if __name__ == "__main__":
    main()

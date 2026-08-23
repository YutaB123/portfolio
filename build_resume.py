"""
Sync Yuta's resume PDF from OneDrive into the site.

The resume is authored outside this repo (Word -> PDF, in
<OneDrive>/Documents/Resume). This script just mirrors the current version
into assets/resume.pdf, which is what the site's "Download Resume" buttons
serve.

This used to generate the PDF from a resume/resume.html source via headless
Chrome. That source drifted out of date and the generated PDF no longer
matched the real resume, so the HTML pipeline was removed -- OneDrive is the
single source of truth now.

Run:  python build_resume.py
"""
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).parent.resolve()
OUT = ROOT / "assets" / "resume.pdf"
SRC = Path.home() / "OneDrive" / "Documents" / "Resume" / "Yuta Banishky Resume.pdf"


def page_count(pdf: Path) -> int:
    """Rough page count: /Type /Page objects minus the single /Type /Pages tree node."""
    data = pdf.read_bytes()
    return data.count(b"/Type /Page") - data.count(b"/Type /Pages")


def main():
    if not SRC.exists():
        sys.exit(
            f"Resume not found at {SRC}\n"
            "If you renamed it, update SRC at the top of this script."
        )

    head = SRC.open("rb").read(5)
    if head != b"%PDF-":
        sys.exit(f"{SRC} does not look like a PDF (starts with {head!r}).")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(SRC, OUT)

    pages = page_count(OUT)
    print(f"copied {SRC}\n     -> {OUT} ({OUT.stat().st_size:,} bytes, {pages} page(s))")
    if pages != 1:
        print(f"WARNING: expected 1 page, got {pages}.")
    print("\nCommit assets/resume.pdf and push to deploy it.")


if __name__ == "__main__":
    main()

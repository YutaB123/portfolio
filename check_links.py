"""Verify every local asset/page reference in the site actually resolves."""
import pathlib
import re
import sys

PAGES = ("index.html", "archive.html")
missing = []

for page in PAGES:
    text = pathlib.Path(page).read_text(encoding="utf-8")
    for ref in re.findall(r'(?:src|href)="((?!https?:|mailto:|#)[^"]+)"', text):
        target = pathlib.Path(ref.split("#")[0].lstrip("/"))
        ok = target.exists()
        print(("OK  " if ok else "MISS"), page, ref)
        if not ok:
            missing.append((page, ref))

print()
if missing:
    print(f"FAIL: {len(missing)} missing reference(s)")
    sys.exit(1)
print("PASS: all local references resolve")

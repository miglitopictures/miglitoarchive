#!/usr/bin/env python3
"""
src/utils/generate_sitemap.py

Generates sitemap.xml at the project root by extracting project keys
straight out of data/projects.js. Run this any time a project is added,
renamed, or removed.

Usage:
    python3 src/utils/generate_sitemap.py

Note: projects.js is a JavaScript file, not JSON, so this doesn't do a
real JS parse — it uses a regex to find each top-level project key
(lines like `    "histerica": {`). This works because every entry in
`works` is formatted consistently (4-space indent, quoted key, colon,
open brace). If that formatting style ever changes, the regex below
(PROJECT_KEY_PATTERN) is the one place to adjust.
"""

import re
from pathlib import Path

# ---- configure this if the domain ever changes ----
DOMAIN = "https://miglito.com"
# -----------------------------------------------------

def find_project_root(start: Path) -> Path:
    """
    Walk upward from `start` until a directory containing both
    `index.html` and a `data/projects.js` is found. This avoids hardcoding
    how many folders deep this script lives (src/utils/, scripts/, or
    anywhere else) — if the script ever moves, this still finds the
    right root automatically.
    """
    current = start
    while current != current.parent:  # stop at filesystem root
        if (current / "index.html").exists() and (current / "data" / "projects.js").exists():
            return current
        current = current.parent
    raise FileNotFoundError(
        "Could not locate the project root (a folder containing both "
        "index.html and data/projects.js) above this script."
    )


SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = find_project_root(SCRIPT_DIR)
PROJECTS_JS_PATH = PROJECT_ROOT / "data" / "projects.js"
SITEMAP_PATH = PROJECT_ROOT / "sitemap.xml"

# Matches a top-level entry in the `works` object, e.g.:
#     "histerica": {
#     "tap-to-pay": {
PROJECT_KEY_PATTERN = re.compile(r'^\s{4}"([^"]+)":\s*\{', re.MULTILINE)


def extract_project_keys(js_source: str) -> list[str]:
    return PROJECT_KEY_PATTERN.findall(js_source)


def url_entry(loc: str, changefreq: str, priority: str) -> str:
    return (
        "    <url>\n"
        f"        <loc>{loc}</loc>\n"
        f"        <changefreq>{changefreq}</changefreq>\n"
        f"        <priority>{priority}</priority>\n"
        "    </url>"
    )


def build_sitemap(project_keys: list[str]) -> str:
    entries = [url_entry(f"{DOMAIN}/", "monthly", "1.0")]

    for key in project_keys:
        entries.append(url_entry(f"{DOMAIN}/{key}", "yearly", "0.8"))

    body = "\n\n".join(entries)
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n'
        f"{body}\n\n"
        "</urlset>\n"
    )


def main():
    if not PROJECTS_JS_PATH.exists():
        raise FileNotFoundError(f"Could not find {PROJECTS_JS_PATH}")

    js_source = PROJECTS_JS_PATH.read_text(encoding="utf-8")
    project_keys = extract_project_keys(js_source)

    if not project_keys:
        raise ValueError(
            "No project keys found — check that PROJECT_KEY_PATTERN still "
            "matches the formatting used in data/projects.js"
        )

    xml = build_sitemap(project_keys)
    SITEMAP_PATH.write_text(xml, encoding="utf-8")

    print(f"sitemap.xml written with {len(project_keys) + 1} URLs -> {SITEMAP_PATH}")
    print(f"Found {len(project_keys)} projects: {', '.join(project_keys)}")


if __name__ == "__main__":
    main()
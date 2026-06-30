#!/usr/bin/env python3
"""
export-sow-pdf.py — Convert a Markdown SOW/proposal to a branded PDF

Looks for sow-pdf.toml in the input file's directory and parent directories,
so most projects need only: python3 scripts/export-sow-pdf.py --input <file>

Full usage (all flags override sow-pdf.toml):
  python3 scripts/export-sow-pdf.py \
    --input docs/sow2/proposal/SOW2-Proposal.md \
    [--type "Statement of Work"] \
    [--sow "SOW #2"] \
    [--project "Primary Brain Health — DTC Funnel & Editorial Expansion"] \
    [--client "Primary Brain Health"] \
    [--client-logo apps/marketing/public/images/pbh-logo.png] \
    [--output SOW2-Proposal.pdf]
"""

import argparse
import base64
import os
import re
import subprocess
import sys
import tempfile
import tomllib
from pathlib import Path

import markdown as md_lib


# ---------------------------------------------------------------------------
# CSS
# ---------------------------------------------------------------------------

CSS = """
@page {
  size: letter;
  margin: 1in;
}
@page :first {
  margin: 0;
}

* { box-sizing: border-box; }

/* ---- Cover page ---- */
.cover {
  width: 100%;
  height: 11in;
  overflow: hidden;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 200px 72px 52px 72px;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
}
.cover-top { width: 100%; }
.cover-doc-type {
  font-size: 42px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
}
.cover-project {
  font-size: 18px;
  font-weight: 400;
  color: #6b7280;
  margin: 0;
}
.cover-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 0 300px 0;
}
.cover-center img {
  max-height: 80px;
  max-width: 260px;
  width: auto;
  height: auto;
  display: block;
}
.cover-client-name {
  font-size: 22px;
  font-weight: 600;
  color: #374151;
}
.cover-agency {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

/* ---- Body content ---- */
.content {
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.65;
  color: #1f2937;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  color: #111827;
  margin-top: 2em;
  margin-bottom: 0.5em;
  line-height: 1.3;
}
h1 { font-size: 22pt; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
h2 { font-size: 16pt; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
h3 { font-size: 13pt; }
h4 { font-size: 11pt; }

p { margin: 0 0 1em 0; }

a { color: #2563eb; text-decoration: none; }

/* Tables */
table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.2em 0;
  font-size: 10pt;
}
th {
  background: #f3f4f6;
  font-weight: 600;
  text-align: left;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
}
td {
  padding: 7px 10px;
  border: 1px solid #d1d5db;
  vertical-align: top;
}
tr:nth-child(even) td { background: #fafafa; }

/* Code */
code {
  font-family: "SF Mono", "Fira Code", "Fira Mono", monospace;
  font-size: 9pt;
  background: #f3f4f6;
  padding: 1px 5px;
  border-radius: 3px;
}
pre {
  background: #f3f4f6;
  padding: 12px 16px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 9pt;
  line-height: 1.5;
}
pre code { background: none; padding: 0; }

/* Lists */
ul, ol { margin: 0 0 1em 0; padding-left: 1.5em; }
li { margin-bottom: 0.3em; }

/* Blockquotes */
blockquote {
  border-left: 4px solid #d1d5db;
  margin: 1em 0;
  padding: 0.5em 1em;
  color: #6b7280;
  background: #f9fafb;
}

/* Horizontal rules */
hr { border: none; border-top: 1px solid #e5e7eb; margin: 2em 0; }

/* Bold */
strong { font-weight: 600; }

/* ---- Signature block ---- */
.signature-section {
  break-inside: avoid;
  page-break-inside: avoid;
}
.signature-section h2 {
  margin-top: 2em;
}
.signature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  margin-top: 24px;
}
.signature-party h3 {
  font-size: 11pt;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 16px;
  border: none;
  padding: 0;
}
.sig-line {
  display: block;
  border-bottom: 1px solid #374151;
  width: 100%;
  margin-bottom: 4px;
  height: 36px;
}
.sig-label {
  font-size: 8pt;
  color: #6b7280;
  display: block;
  margin-bottom: 20px;
}
.sig-field {
  margin-bottom: 20px;
}
.sig-field-label {
  font-size: 9pt;
  color: #374151;
  display: block;
  margin-bottom: 2px;
}
.sig-field-line {
  display: block;
  border-bottom: 1px solid #9ca3af;
  width: 100%;
  height: 28px;
}
"""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def img_to_data_uri(path: str) -> str:
    """Convert image file to base64 data URI."""
    p = Path(path)
    ext = p.suffix.lower().lstrip(".")
    mime = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg",
            "svg": "image/svg+xml", "gif": "image/gif", "webp": "image/webp"}.get(ext, "image/png")
    with open(p, "rb") as f:
        data = base64.b64encode(f.read()).decode()
    return f"data:{mime};base64,{data}"


def build_cover(doc_type: str, project: str, sow: str, client: str,
                client_logo: str | None) -> str:
    """Return HTML for the cover page."""
    if client_logo and Path(client_logo).exists():
        logo_src = img_to_data_uri(client_logo)
        logo_html = f'<img src="{logo_src}" alt="{client} logo">'
    else:
        logo_html = f'<p class="cover-client-name">{client}</p>'

    return f"""
<div class="cover">
  <div class="cover-top">
    <p class="cover-doc-type">{doc_type}</p>
    <p class="cover-project">{project} &mdash; {sow}</p>
  </div>
  <div class="cover-center">
    {logo_html}
  </div>
  <p class="cover-agency">VisualBoston, Inc.</p>
</div>
"""


SIGNATURE_HEADING_RE = re.compile(r'^##\s+Signature\s*$', re.MULTILINE)
SIGNATURE_BLOCK_RE = re.compile(
    r'^##\s+Signature\s*\n(.*?)(?=\n##\s|\Z)', re.DOTALL | re.MULTILINE
)


def build_signature_html(party_a: str = "VISUALBOSTON, INC.",
                          party_b: str = "CLIENT") -> str:
    """Return a two-column signature block."""
    def party_block(name: str) -> str:
        return f"""
<div class="signature-party">
  <h3>{name}</h3>
  <div class="sig-field">
    <span class="sig-line"></span>
    <span class="sig-label">(Signature)</span>
  </div>
  <div class="sig-field">
    <span class="sig-field-label">Name:</span>
    <span class="sig-field-line"></span>
  </div>
  <div class="sig-field">
    <span class="sig-field-label">Title:</span>
    <span class="sig-field-line"></span>
  </div>
  <div class="sig-field">
    <span class="sig-field-label">Date:</span>
    <span class="sig-field-line"></span>
  </div>
</div>
"""
    return f"""
<div class="signature-section">
  <h2>Signature</h2>
  <div class="signature-grid">
    {party_block(party_a)}
    {party_block(party_b)}
  </div>
</div>
"""


def strip_version_banner(text: str) -> str:
    """Remove the leading > Revised ... (vN). banner."""
    return re.sub(r'^>\s*\*\*Revised.*?\*\*.*?\n\n?', '', text, flags=re.DOTALL)


def fix_internal_links(html: str) -> str:
    """Rewrite href="#..." fragments to match the IDs the toc extension actually generated.

    GitHub-flavoured slugs treat '&' as a word separator (producing '--'),
    but Python-markdown's toc extension strips '&' and collapses the dashes.
    This collects every real heading id and normalises each link fragment to match.
    """
    actual_ids = set(re.findall(r'<h[1-6][^>]*\sid="([^"]+)"', html))

    def fix_href(m: re.Match) -> str:
        fragment = m.group(1)
        if fragment in actual_ids:
            return f'href="#{fragment}"'
        normalised = re.sub(r'-+', '-', fragment).strip('-')
        if normalised in actual_ids:
            return f'href="#{normalised}"'
        return m.group(0)

    return re.sub(r'href="#([^"]+)"', fix_href, html)


def markdown_to_html(md_text: str, client: str) -> str:
    """Convert markdown body to HTML, replacing the signature section."""
    md_text = strip_version_banner(md_text)

    sig_match = SIGNATURE_BLOCK_RE.search(md_text)
    if sig_match:
        body_md = md_text[:sig_match.start()]
        sig_html = build_signature_html(party_b=client.upper())
    else:
        body_md = md_text
        sig_html = build_signature_html(party_b=client.upper())

    extensions = ['tables', 'fenced_code', 'toc', 'attr_list', 'md_in_html']
    body_html = md_lib.markdown(body_md, extensions=extensions)
    body_html = fix_internal_links(body_html)

    return body_html + sig_html


def build_full_html(cover_html: str, body_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
{CSS}
</style>
</head>
<body>
{cover_html}
<div class="content">
{body_html}
</div>
</body>
</html>
"""


def html_to_pdf(html_path: str, pdf_path: str) -> None:
    """Convert HTML to PDF using Chrome headless."""
    chrome_paths = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium-browser",
    ]
    chrome = next((p for p in chrome_paths if Path(p).exists()), None)
    if not chrome:
        sys.exit("Chrome not found. Install Google Chrome or Chromium.")

    abs_html = Path(html_path).resolve()
    abs_pdf = Path(pdf_path).resolve()

    cmd = [
        chrome,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        f"--print-to-pdf={abs_pdf}",
        "--print-to-pdf-no-header",
        "--no-margins",
        f"file://{abs_html}",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(result.stderr, file=sys.stderr)
        sys.exit(f"Chrome failed (exit {result.returncode})")


# ---------------------------------------------------------------------------
# Config loader
# ---------------------------------------------------------------------------

CONFIG_FILE = "sow-pdf.toml"

def find_config(start: Path) -> dict:
    """Walk up from start looking for sow-pdf.toml; return its contents or {}."""
    for directory in [start, *start.parents]:
        candidate = directory / CONFIG_FILE
        if candidate.exists():
            with open(candidate, "rb") as f:
                cfg = tomllib.load(f)
            print(f"Using config: {candidate}")
            # Resolve logo path relative to the config file's directory
            if "client_logo" in cfg and cfg["client_logo"]:
                logo = Path(cfg["client_logo"])
                if not logo.is_absolute():
                    cfg["client_logo"] = str(directory / logo)
            return cfg
    return {}


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="Export Markdown SOW to branded PDF")
    parser.add_argument("--input", required=True, help="Path to the Markdown file")
    parser.add_argument("--type", default=None, dest="doc_type",
                        help='Document type label on cover (default: "Statement of Work")')
    parser.add_argument("--sow", default=None, help='SOW identifier, e.g. "SOW #2"')
    parser.add_argument("--project", default=None, help="Project name")
    parser.add_argument("--client", default=None, help="Client name")
    parser.add_argument("--client-logo", default=None,
                        help="Path to client logo image (PNG/SVG). Optional.")
    parser.add_argument("--output", default=None,
                        help="Output PDF path. Defaults to same dir as input.")
    args = parser.parse_args()

    input_path = Path(args.input).resolve()
    if not input_path.exists():
        sys.exit(f"Input file not found: {input_path}")

    # Load config, then let CLI flags override
    cfg = find_config(input_path.parent)
    doc_type    = args.doc_type    or cfg.get("doc_type", "Statement of Work")
    sow         = args.sow         or cfg.get("sow")
    project     = args.project     or cfg.get("project")
    client      = args.client      or cfg.get("client")
    client_logo = args.client_logo or cfg.get("client_logo")

    missing = [name for name, val in [("--sow", sow), ("--project", project), ("--client", client)] if not val]
    if missing:
        sys.exit(f"Missing required values (no sow-pdf.toml found and not passed on CLI): {', '.join(missing)}")

    output_path = Path(args.output).resolve() if args.output else \
        input_path.with_suffix(".pdf")

    md_text = input_path.read_text(encoding="utf-8")

    cover_html = build_cover(
        doc_type=doc_type,
        project=project,
        sow=sow,
        client=client,
        client_logo=client_logo,
    )
    body_html = markdown_to_html(md_text, client=client)
    full_html = build_full_html(cover_html, body_html)

    with tempfile.NamedTemporaryFile(suffix=".html", delete=False,
                                     mode="w", encoding="utf-8") as tmp:
        tmp.write(full_html)
        tmp_path = tmp.name

    try:
        html_to_pdf(tmp_path, str(output_path))
    finally:
        os.unlink(tmp_path)

    print(f"PDF written to: {output_path}")


if __name__ == "__main__":
    main()

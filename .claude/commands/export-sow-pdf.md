# export-sow-pdf

Export a Markdown SOW or proposal document to a branded PDF with a cover page and two-column signature block.

## Usage

Run from the repo root:

```
/export-sow-pdf
```

Then follow the prompts, or pass arguments directly:

```bash
python3 scripts/export-sow-pdf.py \
  --input docs/sow2/proposal/SOW2-Proposal-v5-no-pricing.md \
  --type "Statement of Work" \
  --sow "SOW #2" \
  --project "Primary Brain Health — DTC Funnel & Editorial Expansion" \
  --client "Primary Brain Health" \
  --client-logo apps/marketing/public/images/pbh-logo.png
```

Output defaults to the same directory as `--input` with a `.pdf` extension.

## What it does

1. **Cover page** — document type heading near the top (centered), PBH logo centered in the middle, "VisualBoston, Inc." near the bottom; all on a single white page, no blank pages before content
2. **Body** — Markdown rendered to styled HTML: tables, code blocks, blockquotes, lists
3. **Signature block** — `## Signature` section replaced with a print-ready two-column grid (VisualBoston left, client right), each with Signature / Name / Title / Date fields
4. **PDF via Chrome headless** — no Google Docs, no manual reformatting

## Arguments

| Flag | Required | Description |
|---|---|---|
| `--input` | yes | Path to the Markdown file |
| `--type` | no | Cover page label (default: `"Statement of Work"`) |
| `--sow` | yes | SOW identifier, e.g. `"SOW #2"` |
| `--project` | yes | Project name shown on the cover subtitle |
| `--client` | yes | Client name — used for signature block heading and as fallback if no logo |
| `--client-logo` | no | Path to client logo PNG/SVG (default: `apps/marketing/public/images/pbh-logo.png`) |
| `--output` | no | Output PDF path (default: same dir as `--input`, `.pdf` extension) |

## Instructions for Claude

When the user types `/export-sow-pdf`:

1. Ask which Markdown file to export if not already clear from context.
2. Confirm or infer: SOW number, project name, client name. For PBH documents use these defaults:
   - `--sow "SOW #2"`
   - `--project "Primary Brain Health — DTC Funnel & Editorial Expansion"`
   - `--client "Primary Brain Health"`
   - `--client-logo apps/marketing/public/images/pbh-logo.png`
3. Run:
   ```bash
   python3 scripts/export-sow-pdf.py \
     --input <file> \
     --type "<doc_type>" \
     --sow "<sow>" \
     --project "<project>" \
     --client "<client>" \
     --client-logo apps/marketing/public/images/pbh-logo.png \
     [--output <output>]
   ```
4. Open the PDF and report the output path.

# Grounded Legal Extraction

A Next.js app that extracts case data from German/Swiss legal documents and shows
it **highlighted in the source text** — every value tied to the exact words it
came from. Built so a lawyer can verify the output, not just trust it:
**file upload → structured output → source highlighting → eval harness.**

Most "AI + document" integrations stop at "the model returned some JSON". The hard
(and interesting) part is making the output *auditable* and *measurable*. That's
the focus here.

## What it does

1. **Upload** a document in the browser (`.txt`/`.md`, a `.docx`, or a `.pdf`
   with a text layer — scanned image-only PDFs need OCR first).
2. The server extracts structured case data — `Aktenzeichen`, court, parties,
   deadlines, claim amount — via a Zod-validated `generateObject` call.
3. For **every** field the model returns a verbatim source quote; deterministic
   code locates it and the **UI highlights it in place** (hover a field ⇄ source).
4. Quotes that can't be located are flagged **“unverified”** (hallucination guard).
5. `pnpm eval` scores extraction quality per field against a hand-labelled gold set.

## Quick start

```bash
pnpm install
cp .env.example .env        # add AI_GATEWAY_API_KEY

pnpm dev                    # UI at http://localhost:3000 — upload a file
pnpm extract                # CLI: run on fixtures/sample-document.txt
pnpm eval                   # measure accuracy against the gold set
pnpm test                   # unit tests (deadline math, etc.)
```

No sample file handy? Save [fixtures/sample-document.txt](./fixtures/sample-document.txt)
and drop it into the UI.

## Layout

| Path | What |
|------|------|
| `src/app/page.tsx` | UI: upload, extract, split view (document + fields). |
| `src/app/api/extract/route.ts` | Server route — runs extraction (model key stays server-side). |
| `src/app/api/parse-pdf/route.ts` | Pulls the text layer out of an uploaded PDF (`unpdf`). |
| `src/app/api/parse-docx/route.ts` | Pulls text out of an uploaded `.docx` (`mammoth`). |
| `src/components/` | `FileDrop`, `DocumentViewer` (highlighting), `FieldList`. |
| `src/schema/case-document.ts` | The Zod schema — the contract the model must satisfy. |
| `src/extraction/prompt.ts` | Versioned extraction prompt (an artifact, not a buried string). |
| `src/extraction/extract.ts` | Pipeline: `generateObject` → verify citations. |
| `src/extraction/locate.ts` | Quote → source-offset location + hallucination flagging. |
| `src/extraction/highlights.ts` | Flattens extraction into highlight ranges for the UI. |
| `src/deadlines/fristen.ts` | Fristen math in **pure code** — never the LLM. |
| `src/eval/` | Gold set + scorer + harness (per-field precision/recall). |

## Why these choices

See [DECISIONS.md](./DECISIONS.md) and [ARCHITECTURE.md](./ARCHITECTURE.md).
The short version: **the LLM extracts; plain code verifies, locates, and computes.**

## Status / next steps

Teaching/portfolio scaffold. Digital PDFs work via `unpdf`; *scanned* PDFs still
need an OCR stage (Tesseract / a vision model) — the obvious next extension. The
gold set ships with one example — grow it to 20–30 (see `src/eval/gold/README.md`).

## Learn

- [learn/01-grounding.md](./learn/01-grounding.md) — why citations make LLM output trustworthy
- [learn/02-evals.md](./learn/02-evals.md) — how to prove and improve extraction quality

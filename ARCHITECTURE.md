# Architecture

> Leitmotif: **the LLM extracts; deterministic code verifies and computes.**
> Everything risky (citation correctness, date math, scoring) is pulled out of
> the model and into code you can test.

## Data flow

```
  Browser: user uploads a file (src/components/FileDrop.tsx)
            │  OCR (upstream — Tesseract / a vision model; out of scope here)
            ▼
        plain text  ──POST /api/extract──►  server (src/app/api/extract/route.ts)
                                                  │
  generateObject({ model, schema: CaseDocument, system, prompt })   ← src/extraction/extract.ts
            │   the SDK validates against the Zod schema and retries on mismatch
            ▼
  { documentType: {value, quote, confidence}, aktenzeichen: {...}, parties: [...], ... }
            │
            ├──► locate(quote, source)   ← src/extraction/locate.ts
            │       every quote must exist in the source text (original offsets).
            │       not found ⇒ unverified ⇒ hallucination signal.
            │
            ├──► buildHighlights(...)    ← src/extraction/highlights.ts
            │       flatten fields → highlight ranges for the UI.
            │
            └──► computeFristende(...)   ← src/deadlines/fristen.ts (pure code)
                    date arithmetic is NOT done by the model.
            │
            ▼
  { data, highlights, unverified }  ──►  back to the browser
            │
            ▼
  DocumentViewer highlights the source in place; FieldList lists values +
  confidence and flags "unverified" fields. (Same code path the eval harness scores.)
```

## The three ideas worth internalising

1. **Schema as contract.** `generateObject` + Zod means the model can't return a
   shape your code doesn't expect. No regex parsing of free text.

2. **Grounding via verbatim quotes.** The model cites; code locates. A value with
   no findable quote is flagged, not trusted. This is how you make LLM output
   safe for a high-stakes domain.

3. **Evals over vibes.** A gold set + per-field precision/recall turns prompt
   tuning from guesswork into measurement. Run `pnpm eval` before/after any change.

## What's intentionally out of scope

- **OCR** — assume text input; OCR is a separate, swappable stage.
- **§-accurate Fristenberechnung** — weekends/Feiertage rollover is sketched, not
  complete. Extend `fristen.ts` if you want production-grade deadline law.
- **UI** — the result shape (`value` + `quote` + verified offset) is designed for
  a highlight-and-confirm UI; building it is the obvious next step.
```

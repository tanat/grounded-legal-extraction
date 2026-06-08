# Decisions

Short rationale for the non-obvious choices. The kind of thing an interviewer
asks about.

### Why `generateObject` (structured output) instead of parsing text?

Free-text responses force you to regex-parse the model's prose, which breaks the
moment phrasing changes. `generateObject` validates against a Zod schema at the
SDK layer and retries on mismatch — the shape is guaranteed. This is the single
biggest reliability win over a naive "call the API, parse the string" approach.

### Why ask for verbatim quotes instead of character offsets?

LLMs are bad at counting characters; offsets they produce are unreliable. So we
ask for something they *are* good at — copying text — and let deterministic code
(`locate.ts`) find the offset. Bonus: if the quote can't be found, we've caught a
hallucination for free.

### Why is deadline math not done by the LLM?

Date arithmetic is deterministic and must be correct in a legal context. Models
produce confidently-wrong dates. The model extracts the *inputs* (service date,
deadline type); `fristen.ts` computes the result and is unit-tested.

### Why temperature 0?

Extraction is not creative. We want the same document to yield the same fields so
that eval numbers are stable and regressions are real, not noise.

### Why a gold set / eval harness for a "simple" feature?

Because "it worked on my one test document" is not a quality claim. Per-field
precision/recall lets you compare prompts and models objectively and catch
regressions. This is the part that separates a product-AI engineer from someone
who wired up an API.

### Why the Vercel AI Gateway?

Provider-agnostic: a bare `"anthropic/claude-…"` model string routes through the
gateway, so swapping or A/B-testing models in evals is a one-line change with no
new provider code.

### Model: Claude (default)

Strong instruction-following and structured output, good with multilingual legal
German. Swap `MODEL` in `src/config.ts` and re-run `pnpm eval` to compare against
alternatives — the harness makes that comparison concrete.

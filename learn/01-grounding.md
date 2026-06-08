# Learn 01 — Grounding (why citations matter)

The concept that makes this project more than a toy.

## The problem

An LLM can return a perfectly-formatted answer that is simply wrong. In a chat
app that's annoying. For a legal case file, an invented `Aktenzeichen` or wrong
claim amount is a liability. You cannot ship an LLM feature into a high-stakes
domain on trust alone.

## The fix: make every value verifiable

Instead of:

```json
{ "aktenzeichen": "27 O 145/25" }
```

we require:

```json
{ "aktenzeichen": { "value": "27 O 145/25", "quote": "Aktenzeichen: 27 O 145/25", "confidence": 0.98 } }
```

Now two things become possible:

1. **Automatic verification.** `locate(quote, source)` checks the quote really
   appears in the document. If it doesn't → the model hallucinated → flag it.
   See `src/extraction/locate.ts`.
2. **Human verification.** A UI can highlight the exact source text so a lawyer
   confirms with a glance instead of re-reading the whole document.

## The division of labour

| Job | Who does it | Why |
|-----|-------------|-----|
| Find the facts | LLM | It's good at reading messy language |
| Copy the supporting quote | LLM | It's good at copying text |
| Locate the quote / flag fakes | Code | Deterministic, testable |
| Compute deadlines | Code | Math must be exact |
| Measure accuracy | Code (eval) | "Looks right" isn't a metric |

> Rule of thumb: **let the model do language, let code do truth and math.**

## Try it

1. Run `pnpm extract` — note "All citations verified".
2. Edit the prompt in `src/extraction/prompt.ts` to *remove* the "verbatim quote"
   rule. Re-run. Watch unverified citations (hallucinations) appear.
3. Run `pnpm eval` before and after a prompt change — see the numbers move.

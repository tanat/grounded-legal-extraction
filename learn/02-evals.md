# Learn 02 — Evals (how you prove the thing works)

If grounding (learn 01) is what makes the output *trustworthy*, evals are what
make it *improvable*. This is the single strongest signal that you're a product-AI
engineer and not someone who wired up an API.

## The problem evals solve

You tweak the prompt. The one document you keep re-testing looks right. Ship it?
You have no idea whether you just:
- improved accuracy on `Aktenzeichen` but broke `parties`, or
- improved your one test doc and regressed the other 25.

"Looks right on my example" is not a quality claim. Evals turn vibes into numbers.

## The three pieces

### 1. A gold set — `src/eval/gold/`

Hand-labelled ground truth: for each document, what the *correct* extraction is.
This is the most valuable asset in the project. Models and prompts change; the
gold set is the fixed yardstick. Start with 20–30 real documents (see the gold
README for public, PII-free sources).

### 2. A scorer — `src/eval/score.ts`

Compares prediction vs gold **per field**, because a single overall number hides
where the model is weak. We use two kinds of metric:

| Field kind | Metric | Why |
|------------|--------|-----|
| Scalar (`Aktenzeichen`, `court`) | exact match (normalised) | one right answer |
| List (`parties`, `deadlines`) | precision / recall / F1 | partial credit matters |

- **Precision** = of what the model extracted, how much was correct? (low ⇒ it
  invents / over-extracts)
- **Recall** = of what should have been found, how much did it find? (low ⇒ it
  misses things)
- **F1** = harmonic mean — one number balancing both.

In a legal context recall on deadlines matters more than precision (a missed
`Berufungsfrist` is far worse than an extra candidate). Evals let you see and tune
that trade-off deliberately.

### 3. A harness — `src/eval/harness.ts`

Runs the whole gold set through the real pipeline and prints per-field scores plus
the count of unverified citations (hallucinations). Run it **before and after**
every prompt or model change:

```bash
pnpm eval
```

## Why temperature 0 for evals

Extraction isn't creative. `temperature: 0` (see `src/config.ts`) makes runs
near-deterministic, so a score change reflects *your* change — not random
sampling noise. Otherwise you can't tell a real regression from luck.

## How to actually use this

1. Establish a baseline: `pnpm eval` → note the numbers.
2. Change one thing (a prompt rule, the model in `config.ts`).
3. `pnpm eval` again. Did overall go up? Did any field regress?
4. Keep the change only if the numbers justify it.

Swapping `MODEL` and re-running is a one-line, measured model comparison — far
more convincing than "Claude felt better than X".

## Interview talking points (all true once you've built it)

- "I measured extraction quality per field with precision/recall, not a single
  accuracy number — so I could see *which* fields were weak."
- "I prioritised recall on deadlines because a missed legal deadline is the
  expensive error."
- "I A/B-tested models by swapping one constant and re-running the eval harness."
- "I caught hallucinations automatically by verifying every cited quote against
  the source."

## Next step for the project

Log each eval run (date, model, prompt version, scores) to a file so you can chart
quality over time — a lightweight version of an experiment tracker.

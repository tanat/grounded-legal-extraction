/**
 * Deterministic span location + hallucination guard.
 *
 * The model returns a verbatim `quote`; we find WHERE it lives in the source.
 * Doing this in code (not in the model) is the key lesson: the LLM extracts,
 * plain code verifies. If a quote cannot be found, the model likely hallucinated
 * it — we surface that instead of trusting it.
 *
 * Offsets are always into the ORIGINAL source text, so the UI can highlight the
 * exact characters.
 */

export type Located = {
  quote: string;
  start: number; // -1 when not found
  end: number; // -1 when not found
  found: boolean;
};

const notFound = (quote: string): Located => ({ quote, start: -1, end: -1, found: false });
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function locate(quote: string, source: string): Located {
  if (!quote.trim()) return notFound(quote);

  // 1. Exact match — the happy path.
  const exact = source.indexOf(quote);
  if (exact !== -1) {
    return { quote, start: exact, end: exact + quote.length, found: true };
  }

  // 2. Whitespace-tolerant match — OCR and copy/paste mangle spacing/newlines.
  //    We build a regex that allows any run of whitespace between tokens, so the
  //    returned offsets still point into the ORIGINAL text.
  const pattern = quote.trim().split(/\s+/).map(escapeRegex).join('\\s+');
  const m = new RegExp(pattern).exec(source);
  if (m) {
    return { quote, start: m.index, end: m.index + m[0].length, found: true };
  }

  // 3. Not found anywhere → treat as a hallucinated citation.
  return notFound(quote);
}

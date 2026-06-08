/**
 * Extraction prompt. Kept in its own file because the prompt is a real artifact:
 * it gets versioned, A/B'd, and regression-tested by the eval harness. Treating
 * the prompt as code (not a string buried in a function) is a product-AI habit.
 */

export const SYSTEM_PROMPT = `You are a precise information-extraction engine for German and Swiss legal documents.

Rules:
- Extract ONLY information explicitly present in the document. Never infer or invent.
- If a field is not present, return null (or an empty array) — do not guess.
- For every extracted value, provide a VERBATIM "quote" copied exactly from the
  source text that supports it. The quote must appear character-for-character in
  the document.
- Keep German legal terms in German (e.g. "Aktenzeichen", "Berufungsfrist").
- Dates: only output an ISO date when an explicit calendar date is stated.
- Set a low "confidence" when the text is ambiguous or OCR quality is poor.`;

export function buildUserPrompt(documentText: string): string {
  return `Extract the structured fields from the following legal document.

--- DOCUMENT START ---
${documentText}
--- DOCUMENT END ---`;
}

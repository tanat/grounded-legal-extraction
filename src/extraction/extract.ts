import { generateObject } from 'ai';
import { CaseDocument } from '../schema/case-document';
import { MODEL, TEMPERATURE } from '../config';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompt';
import { locate } from './locate';

export type ExtractionResult = {
  data: CaseDocument;
  /** Quotes the model produced that do NOT appear in the source — hallucination flags. */
  unverified: { field: string; quote: string }[];
};

/**
 * Run extraction end-to-end:
 *  1. LLM returns schema-validated structured data (generateObject).
 *  2. Deterministic code verifies every citation against the source.
 *
 * Pure (no side effects) so it's safe to import from a server route or the CLI.
 */
export async function extractCaseDocument(text: string): Promise<ExtractionResult> {
  const { object } = await generateObject({
    model: MODEL,
    schema: CaseDocument,
    temperature: TEMPERATURE,
    system: SYSTEM_PROMPT,
    prompt: buildUserPrompt(text),
  });

  const unverified: ExtractionResult['unverified'] = [];
  const check = (field: string, quote: string | undefined) => {
    if (quote && !locate(quote, text).found) unverified.push({ field, quote });
  };

  check('documentType', object.documentType.quote);
  check('aktenzeichen', object.aktenzeichen.quote);
  check('court', object.court.quote);
  check('claimAmount', object.claimAmount.quote);
  object.parties.forEach((p, i) => check(`parties[${i}]`, p.quote));
  object.deadlines.forEach((d, i) => check(`deadlines[${i}]`, d.quote));

  return { data: object, unverified };
}

import { z } from 'zod';

/**
 * The schema IS the contract. We use `generateObject` so the model is forced
 * to return data matching this shape — validation happens at the SDK layer and
 * the model retries on mismatch. This is far more reliable than parsing a text
 * response with regex (which is what a naive "LLM + API" integration does).
 */

/**
 * Grounding wrapper — the heart of the project.
 *
 * Every extracted value carries the VERBATIM quote it came from. A lawyer must
 * be able to verify each field against the source; an unverifiable value is
 * useless (worse: dangerous) in a legal context.
 *
 * We deliberately do NOT ask the model for character offsets — LLMs are bad at
 * counting characters. Instead the model returns the quote, and deterministic
 * code (src/extraction/locate.ts) finds the offset. If the quote can't be found
 * in the source, that's a hallucination signal.
 */
export const cited = <T extends z.ZodType>(value: T) =>
  z.object({
    value,
    quote: z
      .string()
      .describe('Verbatim text from the document that supports this value. Copy it exactly.'),
    confidence: z
      .number()
      .min(0)
      .max(1)
      .describe('Model self-reported confidence, 0..1. Use <0.5 when unsure.'),
  });

export const DocumentType = z
  .enum(['Klage', 'Urteil', 'Beschluss', 'Bescheid', 'Schriftsatz', 'Vertrag', 'Sonstiges'])
  .describe('Type of German legal document');

export const PartyRole = z.enum(['Klaeger', 'Beklagter', 'Gericht', 'Anwalt', 'Sonstiges']);

export const Party = z.object({
  name: z.string(),
  role: PartyRole,
});

export const Deadline = z.object({
  description: z.string().describe('What the deadline is for, e.g. "Berufungsfrist"'),
  date: z
    .string()
    .nullable()
    .describe('ISO date (YYYY-MM-DD) if an explicit date is stated, else null'),
});

/**
 * The full extraction target. Nullable fields make "not present in this
 * document" a first-class answer — we want the model to say "null", not invent.
 */
export const CaseDocument = z.object({
  documentType: cited(DocumentType),
  aktenzeichen: cited(z.string().nullable()).describe('Court case reference number'),
  court: cited(z.string().nullable()).describe('Issuing court, e.g. "Landgericht Berlin"'),
  parties: z.array(cited(Party)),
  deadlines: z.array(cited(Deadline)),
  claimAmount: cited(
    z
      .object({ amount: z.number(), currency: z.string() })
      .nullable(),
  ).describe('Monetary claim / Streitwert, if stated'),
});

export type CaseDocument = z.infer<typeof CaseDocument>;
export type Cited<T> = { value: T; quote: string; confidence: number };

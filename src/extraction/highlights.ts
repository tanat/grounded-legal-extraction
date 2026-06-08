import type { CaseDocument } from '../schema/case-document';
import { locate } from './locate';

/**
 * Flattens the structured extraction into a list of UI highlights, each tied to
 * its character range in the source text. `found: false` means the model's quote
 * could not be located — render it as "unverified" rather than trusting it.
 */
export type Highlight = {
  field: string; // stable key, e.g. "aktenzeichen" or "parties.0"
  label: string; // human label for the sidebar
  value: string; // display value
  quote: string;
  confidence: number;
  start: number;
  end: number;
  found: boolean;
};

export function buildHighlights(text: string, doc: CaseDocument): Highlight[] {
  type Raw = { field: string; label: string; value: string; quote: string; confidence: number };
  const raw: Raw[] = [];
  const add = (field: string, label: string, value: string, c: { quote: string; confidence: number }) =>
    raw.push({ field, label, value, quote: c.quote, confidence: c.confidence });

  add('documentType', 'Document type', doc.documentType.value, doc.documentType);
  add('aktenzeichen', 'Aktenzeichen', doc.aktenzeichen.value ?? '—', doc.aktenzeichen);
  add('court', 'Court', doc.court.value ?? '—', doc.court);
  const claim = doc.claimAmount.value
    ? `${doc.claimAmount.value.amount} ${doc.claimAmount.value.currency}`
    : '—';
  add('claimAmount', 'Claim amount', claim, doc.claimAmount);
  doc.parties.forEach((p, i) =>
    add(`parties.${i}`, `Party · ${p.value.role}`, p.value.name, p),
  );
  doc.deadlines.forEach((d, i) =>
    add(
      `deadlines.${i}`,
      'Deadline',
      `${d.value.description}${d.value.date ? ` — ${d.value.date}` : ''}`,
      d,
    ),
  );

  return raw.map((r) => {
    const loc = locate(r.quote, text);
    return { ...r, start: loc.start, end: loc.end, found: loc.found };
  });
}

/** The field "family" (parties.0 → parties) used for colour-coding in the UI. */
export const fieldFamily = (field: string) => field.split('.')[0]!;

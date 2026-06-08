import type { CaseDocument } from '../schema/case-document';

/**
 * Per-field scoring. Scalar fields are scored by exact (normalised) match;
 * list fields (parties, deadlines) by set precision/recall. This is the part
 * that turns "I integrated an LLM" into "I can prove and improve its quality".
 */

export type GoldDocument = {
  documentType: string | null;
  aktenzeichen: string | null;
  court: string | null;
  parties: string[]; // "name|role"
  deadlines: string[]; // "description|date"
  claimAmount: string | null; // "amount currency"
};

export type FieldScore = { correct: boolean } | { precision: number; recall: number; f1: number };
export type Report = { fields: Record<string, FieldScore>; overall: number };

const norm = (s: string | null | undefined) => (s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();

function scalarScore(pred: string | null | undefined, gold: string | null): { correct: boolean } {
  return { correct: norm(pred) === norm(gold) };
}

function setScore(pred: string[], gold: string[]): { precision: number; recall: number; f1: number } {
  const p = new Set(pred.map(norm));
  const g = new Set(gold.map(norm));
  const tp = [...p].filter((x) => g.has(x)).length;
  const precision = p.size ? tp / p.size : g.size ? 0 : 1;
  const recall = g.size ? tp / g.size : 1;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
  return { precision, recall, f1 };
}

export function scoreDocument(pred: CaseDocument, gold: GoldDocument): Report {
  const claim = pred.claimAmount.value
    ? `${pred.claimAmount.value.amount} ${pred.claimAmount.value.currency}`
    : null;

  const fields: Record<string, FieldScore> = {
    documentType: scalarScore(pred.documentType.value, gold.documentType),
    aktenzeichen: scalarScore(pred.aktenzeichen.value, gold.aktenzeichen),
    court: scalarScore(pred.court.value, gold.court),
    claimAmount: scalarScore(claim, gold.claimAmount),
    parties: setScore(
      pred.parties.map((p) => `${p.value.name}|${p.value.role}`),
      gold.parties,
    ),
    deadlines: setScore(
      pred.deadlines.map((d) => `${d.value.description}|${d.value.date ?? ''}`),
      gold.deadlines,
    ),
  };

  // Overall = mean of (accuracy or F1) across fields.
  const vals = Object.values(fields).map((s) => ('correct' in s ? (s.correct ? 1 : 0) : s.f1));
  const overall = vals.reduce((a, b) => a + b, 0) / vals.length;
  return { fields, overall };
}

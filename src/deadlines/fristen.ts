/**
 * Fristen (legal deadlines) calculator — PURE CODE, no LLM.
 *
 * The lesson: the model extracts the *facts* (service date, deadline type), but
 * date arithmetic is deterministic and must NOT be done by an LLM. Mixing the
 * two up is the most common way "AI features" produce confidently-wrong output.
 *
 * NOTE: real §-accurate Fristenberechnung (§§ 222 ZPO, 187–193 BGB — weekends,
 * Feiertage, Fristende fällt auf Sonn-/Feiertag → nächster Werktag) is more
 * involved. This is a teaching skeleton you can extend.
 */

export type FristType = 'Berufungsfrist' | 'Einspruchsfrist' | 'Beschwerdefrist';

/** Standard period lengths (calendar months) per deadline type. */
const FRIST_MONTHS: Record<FristType, number> = {
  Berufungsfrist: 1, // § 517 ZPO: 1 month from Zustellung
  Einspruchsfrist: 0.5, // 2 weeks (modelled as half a month here for the demo)
  Beschwerdefrist: 0.5,
};

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const whole = Math.trunc(months);
  const extraDays = Math.round((months - whole) * 30);
  d.setMonth(d.getMonth() + whole);
  d.setDate(d.getDate() + extraDays);
  return d;
}

/**
 * Compute the due date for a deadline that starts on the service date (Zustellung).
 * @param zustellung ISO date string (YYYY-MM-DD)
 */
export function computeFristende(zustellung: string, type: FristType): string {
  const start = new Date(`${zustellung}T00:00:00Z`);
  if (Number.isNaN(start.getTime())) throw new Error(`Invalid date: ${zustellung}`);
  const due = addMonths(start, FRIST_MONTHS[type]);
  return due.toISOString().slice(0, 10);
}

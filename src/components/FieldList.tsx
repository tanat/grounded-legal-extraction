'use client';

import { type Highlight, fieldFamily } from '../extraction/highlights';

/**
 * Sidebar listing every extracted field with its confidence. Hovering a row
 * activates the matching highlight in the document. Fields whose quote could not
 * be located are flagged "unverified" — the visible payoff of grounding.
 */
export function FieldList({
  highlights,
  activeField,
  onActivate,
}: {
  highlights: Highlight[];
  activeField: string | null;
  onActivate: (field: string | null) => void;
}) {
  return (
    <ul className="fields">
      {highlights.map((h) => (
        <li
          key={h.field}
          className={`field${activeField === h.field ? ' field--active' : ''}`}
          onMouseEnter={() => onActivate(h.field)}
          onMouseLeave={() => onActivate(null)}
        >
          <div className="field__head">
            <span className={`dot dot--${fieldFamily(h.field)}`} />
            <span className="field__label">{h.label}</span>
            {!h.found && <span className="badge badge--warn">unverified</span>}
          </div>
          <div className="field__value">{h.value}</div>
          <div className="conf" title={`confidence ${h.confidence.toFixed(2)}`}>
            <span className="conf__bar" style={{ width: `${Math.round(h.confidence * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

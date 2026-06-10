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
      {highlights.map((h) => {
        const family = fieldFamily(h.field);
        const pct = Math.round(h.confidence * 100);
        const confLevel = pct >= 80 ? 'high' : pct >= 50 ? 'mid' : 'low';
        return (
          <li
            key={h.field}
            className={`field field--${family}${
              activeField === h.field ? ' field--active' : ''
            }${!h.found ? ' field--unverified' : ''}`}
            onMouseEnter={() => onActivate(h.field)}
            onMouseLeave={() => onActivate(null)}
          >
            <div className="field__head">
              <span className={`dot dot--${family}`} aria-hidden="true" />
              <span className="field__label">{h.label}</span>
              {h.found ? (
                <span className="badge badge--ok" title="Quote located in source">
                  <span className="badge__dot" aria-hidden="true" />
                  verified
                </span>
              ) : (
                <span className="badge badge--warn" title="Quote could not be located in the source">
                  unverified
                </span>
              )}
            </div>
            <div className="field__value">{h.value}</div>
            <div className="field__conf">
              <div
                className={`conf conf--${confLevel}`}
                title={`confidence ${h.confidence.toFixed(2)}`}
              >
                <span className="conf__bar" style={{ width: `${pct}%` }} />
              </div>
              <span className="field__pct">{pct}%</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

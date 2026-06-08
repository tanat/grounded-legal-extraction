'use client';

import { useEffect } from 'react';
import { type Highlight, fieldFamily } from '../extraction/highlights';

/**
 * Renders the source document with extracted values highlighted in place.
 * Highlights are sorted and de-overlapped, then the text is split into plain and
 * marked segments. Each <mark> carries its field key so the sidebar can drive the
 * active highlight.
 */
export function DocumentViewer({
  text,
  highlights,
  activeField,
  onActivate,
}: {
  text: string;
  highlights: Highlight[];
  activeField: string | null;
  onActivate: (field: string | null) => void;
}) {
  // Scroll the active highlight into view when it changes.
  useEffect(() => {
    if (!activeField) return;
    document
      .querySelector(`[data-field="${CSS.escape(activeField)}"]`)
      ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [activeField]);

  const found = highlights
    .filter((h) => h.found)
    .sort((a, b) => a.start - b.start);

  // Drop overlaps (keep the earliest-starting highlight in any overlap).
  const clean: Highlight[] = [];
  let lastEnd = 0;
  for (const h of found) {
    if (h.start >= lastEnd) {
      clean.push(h);
      lastEnd = h.end;
    }
  }

  const segments: ({ kind: 'text'; text: string } | { kind: 'mark'; h: Highlight; text: string })[] =
    [];
  let cursor = 0;
  for (const h of clean) {
    if (h.start > cursor) segments.push({ kind: 'text', text: text.slice(cursor, h.start) });
    segments.push({ kind: 'mark', h, text: text.slice(h.start, h.end) });
    cursor = h.end;
  }
  if (cursor < text.length) segments.push({ kind: 'text', text: text.slice(cursor) });

  return (
    <pre className="viewer">
      {segments.map((seg, i) =>
        seg.kind === 'text' ? (
          <span key={i}>{seg.text}</span>
        ) : (
          <mark
            key={i}
            data-field={seg.h.field}
            className={`hl hl--${fieldFamily(seg.h.field)}${
              activeField === seg.h.field ? ' hl--active' : ''
            }`}
            title={`${seg.h.label}: ${seg.h.value} (conf ${seg.h.confidence.toFixed(2)})`}
            onMouseEnter={() => onActivate(seg.h.field)}
            onMouseLeave={() => onActivate(null)}
          >
            {seg.text}
          </mark>
        ),
      )}
    </pre>
  );
}

'use client';

import { useState } from 'react';
import { FileDrop } from '../components/FileDrop';
import { DocumentViewer } from '../components/DocumentViewer';
import { FieldList } from '../components/FieldList';
import type { Highlight } from '../extraction/highlights';

type ApiResponse = {
  highlights: Highlight[];
  unverified: { field: string; quote: string }[];
};

export default function Page() {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onText = (t: string, name: string) => {
    setText(t);
    setFileName(name);
    setResult(null);
    setError(null);
  };

  const extract = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Extraction failed');
      setResult(json as ApiResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Extraction failed');
    } finally {
      setLoading(false);
    }
  };

  const charCount = text.length;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand">
            <span className="brand__mark" aria-hidden="true">§</span>
            <div className="brand__text">
              <span className="brand__name">Grounded Legal Extraction</span>
              <span className="brand__tag">German / Swiss case data, traced to the source</span>
            </div>
          </div>
          <span className="pill">Demo</span>
        </div>
      </header>

      <main className="page">
        <section className="hero">
          <h1 className="hero__title">Every extracted value, tied to the text it came from.</h1>
          <p className="hero__lead">
            Upload a German or Swiss legal document. Each field is highlighted in the source — and
            any quote that can&apos;t be located is flagged <em>unverified</em>, so you never trust a
            value the model couldn&apos;t ground.
          </p>
        </section>

        <FileDrop onText={onText} onError={setError} />

        {text && (
          <div className="toolbar">
            <span className="toolbar__meta">
              <span className="toolbar__file">{fileName ?? 'document'}</span>
              <span className="toolbar__dot" aria-hidden="true">·</span>
              <span className="muted">{charCount.toLocaleString()} characters</span>
            </span>
            <button className="btn" onClick={extract} disabled={loading}>
              {loading ? (
                <>
                  <span className="btn__spinner" aria-hidden="true" />
                  Extracting…
                </>
              ) : (
                <>Extract case data</>
              )}
            </button>
          </div>
        )}

        {error && (
          <p className="alert alert--error" role="alert">
            <span className="alert__icon" aria-hidden="true">!</span>
            {error}
          </p>
        )}

        {result && result.unverified.length > 0 && (
          <p className="alert alert--warn" role="status">
            <span className="alert__icon" aria-hidden="true">!</span>
            <span>
              <strong>{result.unverified.length}</strong> citation
              {result.unverified.length > 1 ? 's' : ''} could not be verified against the source —
              review the fields flagged <strong>unverified</strong>.
            </span>
          </p>
        )}

        {text && (
          <section className="split">
            <div className="panel panel--source">
              <div className="panel__head">
                <h2 className="panel__title">Source document</h2>
                <span className="panel__hint">Hover a highlight to reveal its field</span>
              </div>
              <DocumentViewer
                text={text}
                highlights={result?.highlights ?? []}
                activeField={activeField}
                onActivate={setActiveField}
              />
            </div>

            <aside className="panel panel--fields sidebar">
              <div className="panel__head">
                <h2 className="panel__title">Extracted fields</h2>
                {result && (
                  <span className="panel__hint">{result.highlights.length} fields</span>
                )}
              </div>
              {loading ? (
                <div className="fields-skeleton" aria-hidden="true">
                  <span className="skeleton-card" />
                  <span className="skeleton-card" />
                  <span className="skeleton-card" />
                  <span className="skeleton-card" />
                </div>
              ) : result ? (
                <FieldList
                  highlights={result.highlights}
                  activeField={activeField}
                  onActivate={setActiveField}
                />
              ) : (
                <div className="empty">
                  <div className="empty__icon" aria-hidden="true">⤷</div>
                  <p className="empty__title">No fields yet</p>
                  <p className="empty__text">
                    Run <strong>Extract case data</strong> to populate this panel.
                  </p>
                </div>
              )}
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}

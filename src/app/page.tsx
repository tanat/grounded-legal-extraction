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

  return (
    <main className="page">
      <header className="page__header">
        <h1>Grounded Legal Extraction</h1>
        <p className="muted">
          Upload a German/Swiss legal document — extracted case data is highlighted in the source,
          every value tied to the text it came from.
        </p>
      </header>

      <FileDrop onText={onText} onError={setError} />

      {text && (
        <div className="toolbar">
          <span className="muted">{fileName ?? 'document'} · {text.length} chars</span>
          <button className="btn" onClick={extract} disabled={loading}>
            {loading ? 'Extracting…' : 'Extract'}
          </button>
        </div>
      )}

      {error && <p className="error">⚠️ {error}</p>}

      {result && result.unverified.length > 0 && (
        <p className="warn-banner">
          ⚠️ {result.unverified.length} citation(s) could not be verified against the source —
          review the fields flagged “unverified”.
        </p>
      )}

      {text && (
        <section className="split">
          <DocumentViewer
            text={text}
            highlights={result?.highlights ?? []}
            activeField={activeField}
            onActivate={setActiveField}
          />
          <aside className="sidebar">
            {result ? (
              <FieldList
                highlights={result.highlights}
                activeField={activeField}
                onActivate={setActiveField}
              />
            ) : (
              <p className="muted">Run “Extract” to see fields here.</p>
            )}
          </aside>
        </section>
      )}
    </main>
  );
}

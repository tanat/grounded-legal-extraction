'use client';

import { useRef, useState } from 'react';

/**
 * File input. Reads a document and hands its text up.
 *  - .txt/.md  → read directly in the browser
 *  - .pdf      → sent to /api/parse-pdf to pull out the text layer
 * Scanned (image-only) PDFs have no text layer and need OCR first (see README).
 */
export function FileDrop({
  onText,
  onError,
}: {
  onText: (text: string, name: string) => void;
  onError: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);

  const handleFile = async (file: File) => {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    try {
      if (isPdf) {
        setParsing(true);
        const form = new FormData();
        form.append('file', file);
        const res = await fetch('/api/parse-pdf', { method: 'POST', body: form });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Could not parse PDF');
        onText(json.text as string, file.name);
      } else {
        onText(await file.text(), file.name);
      }
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Could not read file');
    } finally {
      setParsing(false);
    }
  };

  return (
    <div
      className={`filedrop${dragging ? ' filedrop--active' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) void handleFile(file);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,.text,.pdf,text/plain,application/pdf"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      {parsing ? (
        <p>
          <strong>Extracting text from PDF…</strong>
        </p>
      ) : (
        <>
          <p>
            <strong>Drop a document here</strong> or click to choose a file
          </p>
          <p className="muted">.txt / .md / .pdf — scanned (image-only) PDFs need OCR first</p>
        </>
      )}
    </div>
  );
}

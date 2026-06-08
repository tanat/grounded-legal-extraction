'use client';

import { useRef, useState } from 'react';

/**
 * File input. Reads a document and hands its text up.
 *  - .txt/.md  → read directly in the browser
 *  - .pdf      → sent to /api/parse-pdf to pull out the text layer
 *  - .docx     → sent to /api/parse-docx (mammoth) to pull out the text
 * Scanned (image-only) PDFs have no text layer and need OCR first (see README).
 * Anything else is rejected with a clear error rather than read as garbage.
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
    const name = file.name.toLowerCase();
    const isPdf = file.type === 'application/pdf' || name.endsWith('.pdf');
    const isDocx =
      name.endsWith('.docx') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const isText =
      name.endsWith('.txt') ||
      name.endsWith('.md') ||
      name.endsWith('.text') ||
      file.type.startsWith('text/');
    try {
      if (isPdf || isDocx) {
        setParsing(true);
        const form = new FormData();
        form.append('file', file);
        const res = await fetch(isPdf ? '/api/parse-pdf' : '/api/parse-docx', {
          method: 'POST',
          body: form,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Could not parse file');
        onText(json.text as string, file.name);
      } else if (isText) {
        onText(await file.text(), file.name);
      } else {
        onError('Unsupported file type. Use .txt, .md, .pdf, or .docx.');
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
        accept=".txt,.md,.text,.pdf,.docx,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      {parsing ? (
        <p>
          <strong>Extracting text…</strong>
        </p>
      ) : (
        <>
          <p>
            <strong>Drop a document here</strong> or click to choose a file
          </p>
          <p className="muted">.txt / .md / .pdf / .docx — scanned (image-only) PDFs need OCR first</p>
        </>
      )}
    </div>
  );
}

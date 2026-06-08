import type { NextRequest } from 'next/server';
import { extractCaseDocument } from '../../../extraction/extract';
import { buildHighlights } from '../../../extraction/highlights';

// Extraction needs the Node runtime (uses the AI SDK server-side) and a little
// more time than the default. The model key never leaves the server.
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let text: unknown;
  try {
    ({ text } = await req.json());
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof text !== 'string' || !text.trim()) {
    return Response.json({ error: 'No document text provided' }, { status: 400 });
  }

  try {
    const { data, unverified } = await extractCaseDocument(text);
    const highlights = buildHighlights(text, data);
    return Response.json({ data, highlights, unverified });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Extraction failed';
    return Response.json({ error: message }, { status: 500 });
  }
}

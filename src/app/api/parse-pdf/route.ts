import type { NextRequest } from 'next/server';
import { extractText, getDocumentProxy } from 'unpdf';

/**
 * Extracts the text layer from an uploaded PDF.
 *
 * This is the OCR-adjacent stage: a *digital* PDF already has selectable text, so
 * we just pull it out. A *scanned* PDF (image only) has no text layer — that's
 * where real OCR (Tesseract / a vision model) would slot in instead. Keeping this
 * as its own route makes the extraction pipeline indifferent to the source format:
 * everything downstream still works on plain text.
 */
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return Response.json({ error: 'No file uploaded' }, { status: 400 });
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const pdf = await getDocumentProxy(bytes);
    const { text } = await extractText(pdf, { mergePages: true });

    if (!text.trim()) {
      return Response.json(
        { error: 'No text layer found — this looks like a scanned PDF. Run OCR first.' },
        { status: 422 },
      );
    }
    return Response.json({ text });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not parse PDF';
    return Response.json({ error: message }, { status: 500 });
  }
}

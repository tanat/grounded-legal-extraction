import type { NextRequest } from 'next/server';
import mammoth from 'mammoth';

/**
 * Extracts plain text from an uploaded .docx (Word) file.
 *
 * .docx is a ZIP of XML, so reading it as text gives garbage — mammoth unzips it
 * and pulls out the document text. Same contract as /api/parse-pdf: everything
 * downstream works on plain text regardless of the source format.
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
    const buffer = Buffer.from(await file.arrayBuffer());
    const { value } = await mammoth.extractRawText({ buffer });

    if (!value.trim()) {
      return Response.json({ error: 'No text found in the .docx file.' }, { status: 422 });
    }
    return Response.json({ text: value });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not parse .docx';
    return Response.json({ error: message }, { status: 500 });
  }
}

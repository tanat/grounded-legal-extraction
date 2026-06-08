import { readFileSync } from 'node:fs';
import { extractCaseDocument } from './extract';

// CLI: `pnpm extract [path]` (defaults to the sample fixture).
const path = process.argv[2] ?? 'fixtures/sample-document.txt';
const text = readFileSync(path, 'utf8');
const result = await extractCaseDocument(text);

console.log(JSON.stringify(result.data, null, 2));
if (result.unverified.length) {
  console.warn(`\n⚠️  ${result.unverified.length} unverified citation(s) — possible hallucination:`);
  for (const u of result.unverified) console.warn(`  - ${u.field}: "${u.quote}"`);
} else {
  console.log('\n✓ All citations verified against the source.');
}

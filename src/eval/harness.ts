import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractCaseDocument } from '../extraction/extract';
import { scoreDocument, type GoldDocument } from './score';
import { MODEL } from '../config';

/**
 * The eval loop. Run it after every prompt or model change to catch regressions.
 * A gold set + this script is the difference between "it looked right in my one
 * test" and "I measured per-field accuracy across the set".
 */

type GoldEntry = { id: string; document: string; expected: GoldDocument };

const here = dirname(fileURLToPath(import.meta.url));
const goldPath = join(here, 'gold', 'sample.json');
const gold: GoldEntry[] = JSON.parse(readFileSync(goldPath, 'utf8'));

console.log(`Running eval on ${gold.length} document(s) with model: ${MODEL}\n`);

let overallSum = 0;
let unverifiedTotal = 0;

for (const entry of gold) {
  const { data, unverified } = await extractCaseDocument(entry.document);
  const report = scoreDocument(data, entry.expected);
  overallSum += report.overall;
  unverifiedTotal += unverified.length;

  console.log(`📄 ${entry.id} — overall ${(report.overall * 100).toFixed(0)}%`);
  for (const [field, score] of Object.entries(report.fields)) {
    if ('correct' in score) {
      console.log(`   ${score.correct ? '✓' : '✗'} ${field}`);
    } else {
      console.log(
        `   • ${field}: P=${score.precision.toFixed(2)} R=${score.recall.toFixed(2)} F1=${score.f1.toFixed(2)}`,
      );
    }
  }
  if (unverified.length) console.log(`   ⚠️  ${unverified.length} unverified citation(s)`);
  console.log();
}

console.log('─'.repeat(40));
console.log(`Mean overall accuracy: ${((overallSum / gold.length) * 100).toFixed(1)}%`);
console.log(`Unverified citations (hallucination signal): ${unverifiedTotal}`);

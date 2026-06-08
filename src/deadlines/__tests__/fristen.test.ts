import { describe, it, expect } from 'vitest';
import { computeFristende } from '../fristen';

describe('computeFristende', () => {
  it('adds one month for a Berufungsfrist', () => {
    expect(computeFristende('2026-01-15', 'Berufungsfrist')).toBe('2026-02-15');
  });

  it('rolls the month over correctly', () => {
    expect(computeFristende('2026-01-31', 'Berufungsfrist')).toBe('2026-03-03');
  });

  it('throws on an invalid date', () => {
    expect(() => computeFristende('not-a-date', 'Berufungsfrist')).toThrow();
  });
});

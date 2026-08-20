import { describe, expect, it } from 'vitest';
import { reportToMarkdown } from './qa-report.mjs';

describe('QA report formatter', () => {
  it('renders summary, coverage, and issue details', () => {
    const markdown = reportToMarkdown({
      generatedAt: '2026-08-19T00:00:00.000Z',
      summary: { locations: 2, pokemon: 493, encounters: 5, issues: 1 },
      sourceCoverage: { encounters: { total: 5, withSource: 4, withoutSource: 1, canonicalLikeWithoutSource: 1, specialCaseWithoutSource: 0 }, details: { total: 5, withSource: 5, withoutSource: 0, canonicalLikeWithoutSource: 0, specialCaseWithoutSource: 0 } },
      issues: [{ severity: 'warning', kind: 'unknown-time', location: 'Route 206', pokemonId: 401, message: 'Review time.' }],
    });

    expect(markdown).toContain('# RouteDex data QA');
    expect(markdown).toContain('Route 206');
    expect(markdown).toContain('unknown-time');
    expect(markdown).toContain('5 encontros');
  });
});

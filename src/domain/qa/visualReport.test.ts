import { describe, expect, it } from 'vitest';
import { classifyViewport } from './visualReport';

const base = { viewportWidth: 390, documentWidth: 390, documentHeight: 844, horizontalOverflow: false, cards: 3, encounterRows: 4 };

describe('visual QA report', () => {
  it('does not flag a healthy viewport', () => {
    expect(classifyViewport(base)).toEqual([]);
  });

  it('flags horizontal overflow as an error', () => {
    expect(classifyViewport({ ...base, documentWidth: 803, horizontalOverflow: true })).toEqual([
      expect.objectContaining({ kind: 'horizontal-overflow', severity: 'error' }),
    ]);
  });
});

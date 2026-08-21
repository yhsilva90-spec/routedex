import { describe, expect, it } from 'vitest';
import { classifyViewport } from './visualReport';

const base = { viewportWidth: 390, documentWidth: 390, documentHeight: 844, horizontalOverflow: false, cards: 3, encounterRows: 4, workspaceWidth: 390, sidebarStripeVisible: false, spriteEffectCount: 0 };

describe('visual QA report', () => {
  it('does not flag a healthy viewport', () => {
    expect(classifyViewport(base)).toEqual([]);
  });

  it('flags horizontal overflow as an error', () => {
    expect(classifyViewport({ ...base, documentWidth: 803, horizontalOverflow: true })).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'horizontal-overflow', severity: 'error' }),
    ]));
  });

  it('flags a workspace that does not fill the available width', () => {
    expect(classifyViewport({ ...base, viewportWidth: 1920, workspaceWidth: 1660, documentWidth: 1905 })).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'workspace-width', severity: 'error' }),
    ]));
  });

  it('flags the sidebar stripe and sprite effects', () => {
    expect(classifyViewport({ ...base, sidebarStripeVisible: true, spriteEffectCount: 2 })).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'sidebar-stripe', severity: 'error' }),
      expect.objectContaining({ kind: 'sprite-effect', severity: 'error' }),
    ]));
  });
});

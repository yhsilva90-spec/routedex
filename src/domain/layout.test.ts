import { describe, expect, it } from 'vitest';
import { expandedRouteLayout, getBalancedRowSizes, getLocationGridColumns } from './layout';

describe('expanded route layout', () => {
  it('keeps the expanded panel separated and internally padded', () => {
    expect(expandedRouteLayout.panelGapPx).toBe(9);
    expect(expandedRouteLayout.panelTopPaddingPx).toBe(9);
  });

  it('stretches method groups to the same height within each grid row', () => {
    expect(expandedRouteLayout.methodGroupAlign).toBe('stretch');
  });

  it('uses a consistent encounter cell size with a larger sprite', () => {
    expect(expandedRouteLayout.encounterRowMinHeightPx).toBe(72);
    expect(expandedRouteLayout.spriteSizePx).toBe(48);
    expect(expandedRouteLayout.methodGroupMinHeightPx).toBe(112);
    expect(expandedRouteLayout.methodGroupPlacement).toBe('packed');
    expect(expandedRouteLayout.encounterNameNoWrap).toBe(true);
  });

  it('keeps encounter groups in their original three-column sequence', () => {
    expect(getBalancedRowSizes(4)).toEqual([3, 1]);
    expect(getBalancedRowSizes(5)).toEqual([3, 2]);
    expect(getBalancedRowSizes(7)).toEqual([3, 3, 1]);
    expect(getBalancedRowSizes(8)).toEqual([3, 3, 2]);
  });

  it('uses four location columns only on ultra-wide viewports', () => {
    expect(getLocationGridColumns(600)).toBe(1);
    expect(getLocationGridColumns(1920)).toBe(3);
    expect(getLocationGridColumns(2560)).toBe(4);
  });
});

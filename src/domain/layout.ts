export const expandedRouteLayout = {
  panelGapPx: 9,
  panelTopPaddingPx: 9,
  methodGroupAlign: 'stretch' as const,
  encounterRowMinHeightPx: 72,
  spriteSizePx: 48,
  methodGroupMinHeightPx: 112,
  methodGroupPlacement: 'packed' as const,
  encounterNameNoWrap: true,
};

export function getBalancedRowSizes(count: number, columns = 3): number[] {
  if (count <= 0) return [];
  return Array.from({ length: Math.ceil(count / columns) }, (_, index) => Math.min(columns, count - index * columns));
}

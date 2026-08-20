export type ViewportMetrics = {
  viewportWidth: number;
  documentWidth: number;
  documentHeight: number;
  horizontalOverflow: boolean;
  cards: number;
  encounterRows: number;
};

export type VisualFinding = {
  severity: 'warning' | 'error';
  kind: 'horizontal-overflow' | 'empty-viewport' | 'missing-content';
  message: string;
};

export function classifyViewport(metrics: ViewportMetrics): VisualFinding[] {
  const findings: VisualFinding[] = [];
  if (metrics.horizontalOverflow || metrics.documentWidth > metrics.viewportWidth + 1) {
    findings.push({ severity: 'error', kind: 'horizontal-overflow', message: `Document width ${metrics.documentWidth}px exceeds viewport ${metrics.viewportWidth}px.` });
  }
  if (metrics.documentHeight <= 0) {
    findings.push({ severity: 'error', kind: 'empty-viewport', message: 'Document has no measurable height.' });
  }
  if (metrics.cards === 0 && metrics.encounterRows === 0) {
    findings.push({ severity: 'warning', kind: 'missing-content', message: 'No location cards or encounter rows are visible.' });
  }
  return findings;
}

export function summarizeVisualReports(reports: Array<{ metrics: ViewportMetrics }>) {
  return reports.flatMap(({ metrics }) => classifyViewport(metrics));
}

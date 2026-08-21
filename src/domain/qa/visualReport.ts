export type ViewportMetrics = {
  viewportWidth: number;
  documentWidth: number;
  documentHeight: number;
  horizontalOverflow: boolean;
  cards: number;
  encounterRows: number;
  workspaceWidth?: number;
  sidebarStripeVisible?: boolean;
  spriteEffectCount?: number;
};

export type VisualFinding = {
  severity: 'warning' | 'error';
  kind: 'horizontal-overflow' | 'workspace-width' | 'sidebar-stripe' | 'sprite-effect' | 'empty-viewport' | 'missing-content';
  message: string;
};

export function classifyViewport(metrics: ViewportMetrics): VisualFinding[] {
  const findings: VisualFinding[] = [];
  if (metrics.horizontalOverflow || metrics.documentWidth > metrics.viewportWidth + 1) {
    findings.push({ severity: 'error', kind: 'horizontal-overflow', message: `Document width ${metrics.documentWidth}px exceeds viewport ${metrics.viewportWidth}px.` });
  }
  if (metrics.workspaceWidth != null && metrics.workspaceWidth < metrics.documentWidth - 1) {
    findings.push({ severity: 'error', kind: 'workspace-width', message: `Workspace width ${metrics.workspaceWidth}px does not fill the available document width ${metrics.documentWidth}px.` });
  }
  if (metrics.sidebarStripeVisible) {
    findings.push({ severity: 'error', kind: 'sidebar-stripe', message: 'Sidebar contains an unintended decorative stripe.' });
  }
  if ((metrics.spriteEffectCount ?? 0) > 0) {
    findings.push({ severity: 'error', kind: 'sprite-effect', message: `${metrics.spriteEffectCount} sprite(s) still have a visual filter or opacity effect.` });
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

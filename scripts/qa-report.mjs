import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export function reportToMarkdown(report) {
  const { summary, sourceCoverage, issues } = report;
  const issueLines = issues.length
    ? issues.slice(0, 30).map((issue) => `- **${issue.severity}** [${issue.kind}] — ${issue.location}${issue.pokemonId ? ` · #${String(issue.pokemonId).padStart(3, '0')}` : ''}: ${issue.message}`).join('\n')
    : '- Nenhum problema encontrado.';

  return [
    '# RouteDex data QA',
    '',
    `Gerado em: ${report.generatedAt}`,
    '',
    `- ${summary.locations} localidades`,
    `- ${summary.pokemon} Pokémon`,
    `- ${summary.encounters} encontros`,
    `- ${summary.issues} problemas`,
    '',
    '## Cobertura de fonte',
    '',
    `- Encontros: ${sourceCoverage.encounters.withSource}/${sourceCoverage.encounters.total} com fonte; ${sourceCoverage.encounters.withoutSource} sem fonte.`,
    `- Detalhes: ${sourceCoverage.details.withSource}/${sourceCoverage.details.total} com fonte; ${sourceCoverage.details.withoutSource} sem fonte.`,
    `- Registros canônicos sem fonte: ${sourceCoverage.encounters.canonicalLikeWithoutSource}.`,
    `- Casos especiais sem fonte: ${sourceCoverage.encounters.specialCaseWithoutSource}.`,
    '',
    '## Problemas',
    '',
    issueLines,
    issues.length > 30 ? `\n- ... e mais ${issues.length - 30} problema(s).` : '',
    '',
  ].join('\n');
}

export function writeQaReport(report, directory = resolve('artifacts/qa')) {
  mkdirSync(directory, { recursive: true });
  const jsonPath = resolve(directory, 'data-report.json');
  const markdownPath = resolve(directory, 'data-report.md');
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  writeFileSync(markdownPath, reportToMarkdown(report), 'utf8');
  return { jsonPath, markdownPath };
}

export function serializeDataReport(auditReport, generatedAt = new Date().toISOString()) {
  return { generatedAt, ...auditReport };
}

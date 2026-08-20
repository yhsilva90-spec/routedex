import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gameData } from '../src/data/gameData.ts';
import { compareLocalEncounters, parsePokemonDatabaseHtml } from '../src/domain/qa/sourceCompare.ts';

const cacheDir = resolve('artifacts/qa/source-cache');
mkdirSync(cacheDir, { recursive: true });

function cachePath(url) {
  return resolve(cacheDir, `${Buffer.from(url).toString('base64url')}.html`);
}

async function fetchSource(url) {
  const path = cachePath(url);
  if (existsSync(path)) return readFileSync(path, 'utf8');
  const response = await fetch(url, { headers: { 'user-agent': 'RouteDex-QA/1.0' } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const html = await response.text();
  writeFileSync(path, html, 'utf8');
  return html;
}

function isExternalSource(source) {
  return typeof source === 'string' && /^https:\/\/pokemondb\.net\/location\//.test(source);
}

function localRecords(location) {
  return location.encounters.flatMap((encounter) => {
    const details = encounter.details?.length ? encounter.details : [encounter];
    return details.map((detail) => ({
      pokemonId: encounter.pokemonId,
      method: detail.method ?? encounter.method,
      versions: detail.versions?.length ? detail.versions : encounter.versions,
      times: detail.times?.length ? detail.times : encounter.times,
      location: location.name,
    }));
  });
}

function markdown(report) {
  const errors = report.issues.filter((issue) => issue.severity === 'error');
  const warnings = report.issues.filter((issue) => issue.severity !== 'error');
  const lines = report.issues.slice(0, 80).map((issue) => `- **${issue.severity}** [${issue.kind}] ${issue.location} · #${String(issue.pokemonId).padStart(3, '0')} · ${issue.method}${issue.version ? ` · ${issue.version}` : ''}${issue.time ? ` · ${issue.time}` : ''}: ${issue.message}`);
  return [
    '# RouteDex source QA',
    '',
    `Gerado em: ${report.generatedAt}`,
    '',
    `- Fontes externas: ${report.summary.sources}`,
    `- Fontes consultadas: ${report.summary.fetchedSources}`,
    `- Registros locais comparados: ${report.summary.localRecords}`,
    `- Registros externos encontrados: ${report.summary.externalRecords}`,
    `- Conflitos: ${errors.length}`,
    `- Avisos: ${warnings.length}`,
    '',
    '## Divergências',
    '',
    lines.length ? lines.join('\n') : '- Nenhuma divergência encontrada.',
    report.issues.length > 80 ? `\n- ... e mais ${report.issues.length - 80} divergência(s).` : '',
    '',
    'A auditoria é somente leitura; nenhum dado local foi alterado.',
    '',
  ].join('\n');
}

const locations = gameData.locations.filter((location) => location.encounters.some((encounter) => isExternalSource(encounter.source)));
const urls = [...new Set(locations.flatMap((location) => location.encounters.map((encounter) => encounter.source).filter(isExternalSource)))];
const sourceRecords = new Map();
const fetchErrors = [];

for (const url of urls) {
  try {
    sourceRecords.set(url, parsePokemonDatabaseHtml(await fetchSource(url)));
  } catch (error) {
    fetchErrors.push({ url, message: error instanceof Error ? error.message : String(error) });
  }
}

const issues = [];
let localRecordCount = 0;
let externalRecordCount = 0;
for (const location of locations) {
  const url = location.encounters.find((encounter) => isExternalSource(encounter.source))?.source;
  const external = sourceRecords.get(url) ?? [];
  const local = localRecords(location);
  localRecordCount += local.length;
  externalRecordCount += external.length;
  issues.push(...compareLocalEncounters(local, external));
}

issues.push(...fetchErrors.map((error) => ({ severity: 'error', kind: 'source-fetch-error', location: error.url, pokemonId: 0, method: 'source', message: error.message })));
const report = {
  generatedAt: new Date().toISOString(),
  summary: { sources: urls.length, fetchedSources: sourceRecords.size, localRecords: localRecordCount, externalRecords: externalRecordCount },
  issues,
  fetchErrors,
};
const outputDir = resolve('artifacts/qa');
mkdirSync(outputDir, { recursive: true });
writeFileSync(resolve(outputDir, 'source-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
writeFileSync(resolve(outputDir, 'source-report.md'), markdown(report), 'utf8');
console.log(JSON.stringify({ command: 'agent:qa:source', report: { jsonPath: 'artifacts/qa/source-report.json', markdownPath: 'artifacts/qa/source-report.md' }, summary: report.summary, issues: report.issues.length }, null, 2));
if (issues.some((issue) => issue.severity === 'error')) process.exitCode = 1;

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { serializeDataReport, writeQaReport } from './qa-report.mjs';

function loadGeneratedData() {
  const source = readFileSync(resolve('src/data/gameData.ts'), 'utf8');
  const start = source.indexOf('export const gameData = ') + 'export const gameData = '.length;
  const end = source.lastIndexOf(' as const;');
  if (start < 0 || end < start) throw new Error('Não foi possível localizar gameData.ts.');
  return JSON.parse(source.slice(start, end));
}

async function loadAuditFunction() {
  const module = await import('../src/domain/qa/dataAudit.ts');
  return module.auditGameData;
}

const data = loadGeneratedData();
const auditGameData = await loadAuditFunction();
const report = serializeDataReport(auditGameData(data.locations, data.pokemon));
const paths = writeQaReport(report);

console.log(JSON.stringify({
  command: 'agent:qa:data',
  report: paths,
  summary: report.summary,
  sourceCoverage: report.sourceCoverage,
}, null, 2));

if (report.issues.some((issue) => issue.severity === 'error')) process.exitCode = 1;

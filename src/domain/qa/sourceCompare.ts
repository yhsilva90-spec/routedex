export type SourceGameVersion = 'BD' | 'SP';
export type SourceEncounterTime = 'morning' | 'day' | 'night';

export type SourceEncounterRecord = {
  pokemonId: number;
  method: string;
  versions: SourceGameVersion[];
  times: SourceEncounterTime[];
};

export type LocalSourceEncounter = {
  pokemonId: number;
  method?: string;
  versions: SourceGameVersion[];
  times: Array<SourceEncounterTime | 'unknown'>;
  location: string;
};

export type SourceComparisonIssue = {
  severity: 'warning' | 'error';
  kind: 'source-version-conflict' | 'source-time-conflict' | 'source-encounter-unmatched' | 'source-encounter-missing';
  location: string;
  pokemonId: number;
  method: string;
  version?: SourceGameVersion;
  time?: SourceEncounterTime;
  message: string;
};

const METHODS = [
  { pattern: /^walking$/i, method: 'Walking' },
  { pattern: /random encounter/i, method: 'Walking' },
  { pattern: /surf/i, method: 'Surf' },
  { pattern: /old rod/i, method: 'Old Rod' },
  { pattern: /good rod/i, method: 'Good Rod' },
  { pattern: /super rod/i, method: 'Super Rod' },
  { pattern: /pok[eé] ?radar/i, method: 'Poké Radar' },
  { pattern: /swarm/i, method: 'Swarm' },
  { pattern: /honey tree/i, method: 'Honey Tree' },
  { pattern: /shaking tree/i, method: 'Shaking Trees' },
] as const;

const TIME_NAMES: Record<string, SourceEncounterTime> = { morning: 'morning', day: 'day', night: 'night' };

function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/&(?:amp|#38);/g, '&').replace(/&(?:eacute|#233);/g, 'é').replace(/&(?:nbsp|#160);/g, ' ').replace(/\s+/g, ' ').trim();
}

function getMethodAndHeadingTime(heading: string): { method: string; time?: SourceEncounterTime } | null {
  const method = METHODS.find((candidate) => candidate.pattern.test(heading))?.method;
  if (!method) return null;
  const timeMatch = heading.match(/\b(Morning|Day|Night)\b/i);
  return { method, time: timeMatch ? TIME_NAMES[timeMatch[1].toLowerCase()] : undefined };
}

function parseVersions(row: string): SourceGameVersion[] {
  const versions: SourceGameVersion[] = [];
  const cellPattern = /<td[^>]+class="([^"]*cell-loc-game[^"]*)"[^>]*>([\s\S]*?)<\/td>/gi;
  for (const match of row.matchAll(cellPattern)) {
    const gameClass = match[1].match(/cell-loc-game-(BD|SP)\d*/i)?.[1]?.toUpperCase();
    if (!gameClass) continue;
    const value = stripTags(match[2]);
    if ((value === 'BD' || value === 'SP') && value === gameClass && !versions.includes(value)) versions.push(value);
  }
  return versions;
}

function parsePokemonId(row: string): number | null {
  const title = row.match(/title="[^"]*#0*(\d{1,3})\s+[^\"]+"/i)?.[1];
  if (title) return Number(title);
  const href = row.match(/href="\/pokedex\/[^\"]+"/i)?.[0];
  if (!href) return null;
  return null;
}

function parseTimes(row: string, headingTime?: SourceEncounterTime): SourceEncounterTime[] {
  const times: SourceEncounterTime[] = [];
  for (const match of row.matchAll(/(?:alt|title)="(Morning|Day|Night)"/gi)) {
    const time = TIME_NAMES[match[1].toLowerCase()];
    if (time && !times.includes(time)) times.push(time);
  }
  if (!times.length && headingTime) times.push(headingTime);
  return times;
}

export function parsePokemonDatabaseHtml(html: string): SourceEncounterRecord[] {
  const records: SourceEncounterRecord[] = [];
  const tablePattern = /<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/gi;
  for (const tableMatch of html.matchAll(tablePattern)) {
    const heading = stripTags(tableMatch[1]);
    const methodInfo = getMethodAndHeadingTime(heading);
    if (!methodInfo) continue;
    let currentMethodInfo = methodInfo;
    for (const rowMatch of tableMatch[2].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const row = rowMatch[1];
      const statusHeading = row.match(/<th[^>]*class="[^"]*cell-loc-status[^"]*"[^>]*>([\s\S]*?)<\/th>/i);
      if (statusHeading) {
        const nextMethodInfo = getMethodAndHeadingTime(stripTags(statusHeading[1]));
        if (nextMethodInfo) currentMethodInfo = nextMethodInfo;
        continue;
      }
      const pokemonId = parsePokemonId(row);
      const versions = parseVersions(row);
      if (!pokemonId || !versions.length) continue;
      records.push({ pokemonId, method: currentMethodInfo.method, versions, times: parseTimes(row, currentMethodInfo.time) });
    }
  }
  return records;
}

function sameMethod(left: string | undefined, right: string): boolean {
  if (!left) return false;
  return left.split(' · ').some((part) => part.trim() === right);
}

function hasVersionAndTime(records: SourceEncounterRecord[], version: SourceGameVersion, time: SourceEncounterTime): boolean {
  return records.some((record) => record.versions.includes(version) && (!record.times.length || record.times.includes(time)));
}

function pushUnique(issues: SourceComparisonIssue[], issue: SourceComparisonIssue): void {
  const fingerprint = [issue.kind, issue.location, issue.pokemonId, issue.method, issue.version, issue.time].join('|');
  if (!issues.some((existing) => [existing.kind, existing.location, existing.pokemonId, existing.method, existing.version, existing.time].join('|') === fingerprint)) issues.push(issue);
}

export function compareLocalEncounters(local: LocalSourceEncounter[], source: SourceEncounterRecord[]): SourceComparisonIssue[] {
  const issues: SourceComparisonIssue[] = [];
  local.forEach((encounter) => {
    if (!encounter.method) return;
    const method = encounter.method;
    const matches = source.filter((record) => record.pokemonId === encounter.pokemonId && sameMethod(method, record.method));
    if (!matches.length) {
      pushUnique(issues, { severity: 'warning', kind: 'source-encounter-unmatched', location: encounter.location, pokemonId: encounter.pokemonId, method, message: `No matching ${method} row was found in the external source.` });
      return;
    }
    encounter.versions.forEach((version) => {
      if (!matches.some((record) => record.versions.includes(version))) {
        pushUnique(issues, { severity: 'error', kind: 'source-version-conflict', location: encounter.location, pokemonId: encounter.pokemonId, method, version, message: `${version} is present locally but absent from the external source.` });
      }
    });
    encounter.times.filter((time): time is SourceEncounterTime => time !== 'unknown').forEach((time) => {
      encounter.versions.forEach((version) => {
        if (!matches.some((record) => record.versions.includes(version))) return;
        if (!hasVersionAndTime(matches, version, time)) {
          pushUnique(issues, { severity: 'error', kind: 'source-time-conflict', location: encounter.location, pokemonId: encounter.pokemonId, method, version, time, message: `${version} / ${time} is present locally but absent from the external source.` });
        }
      });
    });
  });
  source.forEach((record) => {
    const represented = local.some((encounter) => encounter.pokemonId === record.pokemonId
      && sameMethod(encounter.method, record.method)
      && encounter.versions.some((version) => record.versions.includes(version))
      && (encounter.times.includes('unknown') || !record.times.length || record.times.some((time) => encounter.times.includes(time))));
    if (!represented) {
      pushUnique(issues, { severity: 'warning', kind: 'source-encounter-missing', location: local[0]?.location ?? '(external source)', pokemonId: record.pokemonId, method: record.method, message: `The external source has a ${record.method} row that is not represented locally.` });
    }
  });
  return issues;
}

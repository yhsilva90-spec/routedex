import type { Encounter, EncounterDetail, EncounterTime } from '../types';
import type { SourceEncounterRecord, SourceEncounterTime, SourceGameVersion } from './sourceCompare';

const EXTERNAL_SOURCE = /^https:\/\/pokemondb\.net\/location\//;

function sameMethod(localMethod: string | undefined, sourceMethod: string): boolean {
  if (!localMethod) return false;
  return localMethod.split(' · ').some((part) => part.trim() === sourceMethod);
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function sourceVersionsForTime(records: SourceEncounterRecord[], time?: SourceEncounterTime): SourceGameVersion[] {
  return unique(records
    .filter((record) => !time || !record.times.length || record.times.includes(time))
    .flatMap((record) => record.versions));
}

function versionsKey(versions: SourceGameVersion[]): string {
  return versions.join('|');
}

function reconcileDetail(
  encounter: Encounter,
  detail: EncounterDetail,
  source: SourceEncounterRecord[],
): EncounterDetail[] {
  const detailSource = detail.source ?? encounter.source;
  if (!detailSource || !EXTERNAL_SOURCE.test(detailSource)) return [detail];

  const matches = source.filter((record) => record.pokemonId === encounter.pokemonId && sameMethod(detail.method, record.method));
  const hasSwarmDetail = encounter.details?.some((candidate) => candidate.method === 'Swarm') ?? false;
  const swarmMatches = source.filter((record) => record.pokemonId === encounter.pokemonId && record.method === 'Swarm');
  if (detail.method === 'Walking' && !matches.length && swarmMatches.length) {
    if (hasSwarmDetail) return [];
    return reconcileDetail(encounter, {
      ...detail,
      method: 'Swarm',
      condition: detail.condition ?? encounter.condition ?? 'Pós-jogo',
    }, source);
  }
  if (!matches.length) {
    return [detail];
  }

  const localVersions = detail.versions.length ? detail.versions : encounter.versions;
  const times: EncounterTime[] = detail.times.length ? detail.times : ['unknown'];
  const segments = new Map<string, EncounterDetail>();

  times.forEach((time) => {
    const sourceVersions = time === 'unknown'
      ? sourceVersionsForTime(matches)
      : sourceVersionsForTime(matches, time);
    const versions = localVersions.filter((version): version is SourceGameVersion => sourceVersions.includes(version));
    if (!versions.length) return;

    const key = versionsKey(versions);
    const existing = segments.get(key);
    if (existing) {
      existing.times = [...existing.times, time];
      return;
    }
    segments.set(key, { ...detail, times: [time], versions });
  });

  return [...segments.values()];
}

export type SourceReconciliationResult = {
  encounter: Encounter;
  changed: boolean;
  removedDetails: number;
};

/**
 * Applies only externally verified version/time corrections to one encounter.
 * Records without a matching external row remain untouched for manual review.
 */
export function reconcileEncounterWithSource(
  encounter: Encounter,
  source: SourceEncounterRecord[],
): SourceReconciliationResult {
  const originalDetails = encounter.details ?? [];
  const details = originalDetails.flatMap((detail) => reconcileDetail(encounter, detail, source));
  const versions = unique(details.flatMap((detail) => detail.versions));
  const times = unique(details.flatMap((detail) => detail.times));
  const methods = unique(details.map((detail) => detail.method));
  const detailsChanged = JSON.stringify(details) !== JSON.stringify(originalDetails);
  const staleSwarmMethod = methods.includes('Swarm') && !methods.includes('Walking') && encounter.method?.includes('Walking');
  const method = (detailsChanged || staleSwarmMethod) && methods.length ? methods.join(' · ') : encounter.method;
  const reconciled: Encounter = { ...encounter, method, details, versions, times };
  const changed = JSON.stringify(reconciled) !== JSON.stringify(encounter);
  return { encounter: reconciled, changed, removedDetails: originalDetails.length - details.length };
}

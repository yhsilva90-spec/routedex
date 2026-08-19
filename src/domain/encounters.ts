import type { Encounter, EncounterDetail, EncounterTime } from './types';

export type EncounterMethodGroup = { key: string; label: string; method: string; encounters: Encounter[] };
export type PackedEncounterCell = { encounter: Encounter; groupLabel: string; isGroupStart: boolean };

function detailsFor(encounter: Encounter): EncounterDetail[] {
  return encounter.details?.length ? encounter.details : [{ method: encounter.method ?? 'Walking', times: encounter.times, versions: encounter.versions, condition: encounter.condition, source: encounter.source }];
}

export function getEncounterMethods(encounter: Encounter): string[] {
  return [...new Set(detailsFor(encounter).map((detail) => detail.method))];
}

export function getEncounterChanceLabels(encounter: Encounter, selectedTime: EncounterTime | 'all'): string[] {
  return detailsFor(encounter)
    .filter((detail) => selectedTime === 'all' || detail.times.includes(selectedTime))
    .filter((detail) => detail.chance)
    .map((detail) => detail.chance as string)
    .filter((label, index, labels) => labels.indexOf(label) === index);
}

export function getEncounterLevelLabels(encounter: Encounter): string[] {
  const levels = detailsFor(encounter).map((detail) => detail.levels).filter(Boolean) as string[];
  if (!levels.length) return [];
  const numbers = levels.flatMap((level) => (level.match(/\d+/g) ?? []).map(Number));
  if (numbers.length) return [`Nv. ${Math.min(...numbers)}–${Math.max(...numbers)}`];
  return [...new Set(levels)].map((level) => `Nv. ${level}`);
}

export function encounterTimeStatus(encounter: Encounter): 'not-applicable' | 'unconfirmed' | null {
  if (!encounter.times.includes('unknown')) return null;
  const method = encounter.method ?? detailsFor(encounter)[0]?.method;
  const noClockMethod = ['Swarm', 'Old Rod', 'Good Rod', 'Super Rod', 'Honey Tree', 'Poké Radar', 'PokéRadar'];
  const noClockLocation = ['grand-underground', 'great-marsh', 'trophy-garden', 'ramanas-park', 'honey-trees'];
  return noClockMethod.includes(method ?? '') || noClockLocation.includes(encounter.locationId) ? 'not-applicable' : 'unconfirmed';
}

export function groupEncounterLabel(method: string): string {
  if (method === 'Poké Radar' || method === 'PokéRadar') return 'Poké Radar';
  if (method === 'Surf') return 'Surf';
  if (['Old Rod', 'Good Rod', 'Super Rod'].includes(method)) return `Pesca · ${method}`;
  if (method === 'Walking') return 'Grama';
  if (method === 'Swarm') return 'Swarm';
  if (method === 'Honey Tree') return 'Outros métodos';
  return method || 'Outros métodos';
}

function groupOrder(method: string): number {
  if (method === 'Poké Radar' || method === 'PokéRadar') return 0;
  if (method === 'Surf') return 1;
  if (method === 'Old Rod') return 2;
  if (method === 'Good Rod') return 3;
  if (method === 'Super Rod') return 4;
  if (method === 'Swarm') return 5;
  if (method === 'Honey Tree') return 6;
  if (method === 'Walking') return 7;
  return 7;
}

export function groupEncountersByMethod(encounters: Encounter[]): EncounterMethodGroup[] {
  const groups = new Map<string, EncounterMethodGroup>();
  encounters.forEach((encounter) => {
    const methods = [...new Set(detailsFor(encounter).map((detail) => detail.method))];
    methods.forEach((method) => {
      const key = `${groupOrder(method)}-${groupEncounterLabel(method)}`;
      const details = detailsFor(encounter).filter((detail) => detail.method === method);
      const groupedEncounter: Encounter = { ...encounter, id: `${encounter.id}-${method.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, method, details, times: [...new Set(details.flatMap((detail) => detail.times))] };
      const group = groups.get(key) ?? { key, label: groupEncounterLabel(method), method, encounters: [] };
      group.encounters.push(groupedEncounter);
      groups.set(key, group);
    });
  });
  return [...groups.values()].sort((a, b) => groupOrder(a.method) - groupOrder(b.method));
}

export function packEncounterGroups(groups: EncounterMethodGroup[], columns = 3): PackedEncounterCell[][] {
  const rows: PackedEncounterCell[][] = [];
  let row: PackedEncounterCell[] = [];
  groups.forEach((group) => {
    group.encounters.forEach((encounter, index) => {
      if (row.length === columns) {
        rows.push(row);
        row = [];
      }
      row.push({ encounter, groupLabel: group.label, isGroupStart: index === 0 });
    });
  });
  if (row.length) rows.push(row);
  return rows;
}

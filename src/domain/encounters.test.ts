import { describe, expect, it } from 'vitest';
import { encounterTimeStatus, getEncounterMethods, getEncounterChanceLabels, getEncounterLevelLabels, groupEncounterLabel, groupEncountersByMethod, packEncounterGroups } from './encounters';
import type { Encounter } from './types';

const encounter: Encounter = {
  id: 'route-201-399', pokemonId: 399, locationId: 'route-201', times: ['morning', 'day', 'night'], versions: ['BD', 'SP'],
  details: [
    { method: 'Walking', times: ['morning', 'day'], versions: ['BD', 'SP'], chance: '50%', levels: '2-3' },
    { method: 'Walking', times: ['night'], versions: ['BD', 'SP'], chance: '60%', levels: '2-3' },
    { method: 'Old Rod', times: ['morning', 'day', 'night'], versions: ['BD', 'SP'], rarity: 'Very common' },
  ],
};

describe('encounter details', () => {
  it('lists distinct methods including fishing rods', () => {
    expect(getEncounterMethods(encounter)).toEqual(['Walking', 'Old Rod']);
  });

  it('shows chance only for the selected time when available', () => {
    expect(getEncounterChanceLabels(encounter, 'night')).toEqual(['60%']);
    expect(getEncounterChanceLabels(encounter, 'morning')).toEqual(['50%']);
  });

  it('deduplicates levels and groups methods in the gameplay order', () => {
    expect(getEncounterLevelLabels(encounter)).toEqual(['Nv. 2–3']);
    expect(groupEncounterLabel('Super Rod')).toBe('Pesca · Super Rod');
    expect(groupEncounterLabel('Swarm')).toBe('Swarm');
    expect(groupEncounterLabel('Walking')).toBe('Grama');
    expect(groupEncountersByMethod([encounter]).map((group) => group.label)).toEqual(['Pesca · Old Rod', 'Grama']);
  });

  it('distinguishes a method without clock time from an unconfirmed time', () => {
    expect(encounterTimeStatus({ ...encounter, method: 'Swarm', times: ['unknown'] })).toBe('not-applicable');
    expect(encounterTimeStatus({ ...encounter, method: 'Walking', times: ['unknown'] })).toBe('unconfirmed');
  });

  it('packs groups continuously without interleaving their encounters', () => {
    const groups = groupEncountersByMethod([encounter]);
    const rows = packEncounterGroups(groups, 3);
    expect(rows.flat().map((cell) => cell.groupLabel)).toEqual(['Pesca · Old Rod', 'Grama']);
    expect(rows.flat().map((cell) => cell.isGroupStart)).toEqual([true, true]);
  });

  it('fills the remaining cells before starting the next row', () => {
    const makeEncounter = (id: number): Encounter => ({ id: `a-${id}`, pokemonId: id, locationId: 'test', times: ['unknown'], versions: ['BD'] });
    const rows = packEncounterGroups([
      { key: 'a', label: 'Poké Radar', method: 'Poké Radar', encounters: Array.from({ length: 9 }, (_, index) => makeEncounter(index + 1)) },
      { key: 'b', label: 'Swarm', method: 'Swarm', encounters: [makeEncounter(10)] },
    ], 3);
    expect(rows.map((row) => row.length)).toEqual([3, 3, 3, 1]);
    expect(rows[3][0].groupLabel).toBe('Swarm');
  });
});

import { describe, expect, it } from 'vitest';
import { createProgress, toggleCaptured, getLocationProgress, filterEncounters, toggleLeagueChecklist, parseProgress } from './progress';
import type { Encounter, Location, ProgressState } from './types';

const encounters: Encounter[] = [
  { id: 'route-103-pikachu', pokemonId: 25, locationId: 'route-103', times: ['day'], versions: ['BD', 'SP'], source: 'test' },
  { id: 'route-105-pikachu', pokemonId: 25, locationId: 'route-105', times: ['night'], versions: ['BD'], source: 'test' },
  { id: 'route-103-zubat', pokemonId: 41, locationId: 'route-103', times: ['unknown'], versions: ['SP'], source: 'test' },
];

const locations: Location[] = [
  { id: 'route-103', name: 'Route 103', category: 'route', encounters: encounters.filter((item) => item.locationId === 'route-103') },
  { id: 'route-105', name: 'Route 105', category: 'route', encounters: encounters.filter((item) => item.locationId === 'route-105') },
];

describe('RouteDex progress rules', () => {
  it('shares a capture across every occurrence and records the first origin', () => {
    const state = toggleCaptured(createProgress(), encounters[0]);

    expect(state.capturedPokemon[25]).toBe(true);
    expect(state.captureOrigins[25]).toBe('route-103');
    expect(getLocationProgress(locations[1], state)).toEqual({ captured: 1, total: 1, percent: 100 });
  });

  it('removes the shared capture and origin when the capture is unchecked', () => {
    const captured = toggleCaptured(createProgress(), encounters[0]);
    const cleared = toggleCaptured(captured, encounters[0]);

    expect(Boolean(cleared.capturedPokemon[25])).toBe(false);
    expect(cleared.captureOrigins[25]).toBeUndefined();
  });

  it('filters by version and time without changing the route denominator', () => {
    const state: ProgressState = createProgress();
    expect(filterEncounters(encounters, { version: 'BD', time: 'night' })).toHaveLength(1);
    expect(getLocationProgress(locations[0], state)).toEqual({ captured: 0, total: 2, percent: 0 });
  });

  it('keeps unknown-time encounters visible when no time filter is selected', () => {
    expect(filterEncounters(encounters, { version: 'all', time: 'all' })).toHaveLength(3);
  });

  it('tracks gym and Elite Four battles independently from Pokémon capture progress', () => {
    const gymState = toggleLeagueChecklist(createProgress(), 'gymLeadersCompleted', 'roark');
    const leagueState = toggleLeagueChecklist(gymState, 'eliteFourCompleted', 'aaron');

    expect(leagueState.gymLeadersCompleted.roark).toBe(true);
    expect(leagueState.eliteFourCompleted.aaron).toBe(true);
    expect(leagueState.capturedPokemon).toEqual({});
  });

  it('fills new league progress fields when importing an older backup', () => {
    const oldBackup = JSON.stringify({
      version: 1,
      capturedPokemon: { 25: true },
      captureOrigins: { 25: 'route-103' },
      postgameCompleted: {},
      collectedTMs: {},
    });

    const restored = parseProgress(oldBackup);
    expect(restored.capturedPokemon[25]).toBe(true);
    expect(restored.gymLeadersCompleted).toEqual({});
    expect(restored.eliteFourCompleted).toEqual({});
  });
});

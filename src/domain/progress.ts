import type { Encounter, GameVersion, Location, ProgressState } from './types';

export const createProgress = (): ProgressState => ({
  version: 1,
  capturedPokemon: {},
  captureOrigins: {},
  postgameCompleted: {},
  collectedTMs: {},
  gymLeadersCompleted: {},
  eliteFourCompleted: {},
});

export function toggleCaptured(state: ProgressState, encounter: Encounter): ProgressState {
  const captured = Boolean(state.capturedPokemon[encounter.pokemonId]);
  const capturedPokemon = { ...state.capturedPokemon };
  const captureOrigins = { ...state.captureOrigins };

  if (captured) {
    delete capturedPokemon[encounter.pokemonId];
    delete captureOrigins[encounter.pokemonId];
  } else {
    capturedPokemon[encounter.pokemonId] = true;
    captureOrigins[encounter.pokemonId] = encounter.locationId;
  }

  return { ...state, capturedPokemon, captureOrigins };
}

export function toggleChecklist(state: ProgressState, key: 'postgameCompleted' | 'collectedTMs', id: number): ProgressState {
  return {
    ...state,
    [key]: { ...state[key], [id]: !state[key][id] },
  };
}

export function toggleLeagueChecklist(state: ProgressState, key: 'gymLeadersCompleted' | 'eliteFourCompleted', id: string): ProgressState {
  return {
    ...state,
    [key]: { ...state[key], [id]: !state[key][id] },
  };
}

export function getLocationProgress(location: Location, state: ProgressState) {
  const pokemonIds = [...new Set(location.encounters.map((encounter) => encounter.pokemonId))];
  const captured = pokemonIds.filter((id) => state.capturedPokemon[id]).length;
  return { captured, total: pokemonIds.length, percent: pokemonIds.length ? Math.round((captured / pokemonIds.length) * 100) : 0 };
}

export function filterEncounters(encounters: Encounter[], filters: { version: GameVersion | 'all'; time: Encounter['times'][number] | 'all' }) {
  return encounters.filter((encounter) => {
    const versionMatches = filters.version === 'all' || encounter.versions.includes(filters.version);
    const timeMatches = filters.time === 'all' || encounter.times.includes(filters.time);
    return versionMatches && timeMatches;
  });
}

export function serializeProgress(state: ProgressState): string {
  return JSON.stringify(state, null, 2);
}

export function parseProgress(raw: string): ProgressState {
  const parsed = JSON.parse(raw) as Partial<ProgressState>;
  if (parsed.version !== 1 || !parsed.capturedPokemon || !parsed.captureOrigins || !parsed.postgameCompleted || !parsed.collectedTMs) {
    throw new Error('Backup incompatível com esta versão do RouteDex.');
  }
  return {
    ...parsed,
    gymLeadersCompleted: parsed.gymLeadersCompleted ?? {},
    eliteFourCompleted: parsed.eliteFourCompleted ?? {},
  } as ProgressState;
}

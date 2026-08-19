import type { Encounter } from './types';

export function getDexToggleEncounter(pokemonId: number, title: string, firstEncounter?: Encounter): Encounter {
  if (firstEncounter) return firstEncounter;

  const dexKey = title.toLowerCase().replace(/\s+/g, '-');
  return {
    id: `dex-${dexKey}-${pokemonId}`,
    pokemonId,
    locationId: `${dexKey}-dex`,
    method: 'Dex',
    times: ['unknown'],
    versions: ['BD', 'SP'],
    source: 'RouteDex Dex',
  };
}

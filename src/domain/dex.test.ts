import { describe, expect, it } from 'vitest';
import { getDexToggleEncounter } from './dex';
import type { Encounter } from './types';

describe('Dex toggle encounters', () => {
  it('preserves a real encounter as the capture origin', () => {
    const encounter: Encounter = { id: 'route-201-1', pokemonId: 1, locationId: 'route-201', times: ['day'], versions: ['BD'] };
    expect(getDexToggleEncounter(1, 'National', encounter)).toBe(encounter);
  });

  it('creates a stable fallback for species without a location encounter', () => {
    expect(getDexToggleEncounter(133, 'National')).toMatchObject({
      id: 'dex-national-133',
      pokemonId: 133,
      locationId: 'national-dex',
      method: 'Dex',
      times: ['unknown'],
      versions: ['BD', 'SP'],
    });
  });
});

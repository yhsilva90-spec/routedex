import { describe, expect, it } from 'vitest';
import type { Encounter } from '../types';
import type { SourceEncounterRecord } from './sourceCompare';
import { reconcileEncounterWithSource } from './sourceReconcile';

const source: SourceEncounterRecord[] = [
  { pokemonId: 439, method: 'Walking', versions: ['BD'], times: ['morning'] },
  { pokemonId: 439, method: 'Walking', versions: ['BD'], times: ['day', 'night'] },
  { pokemonId: 438, method: 'Walking', versions: ['SP'], times: ['morning', 'day', 'night'] },
];

describe('source reconciliation', () => {
  it('removes an invalid version and preserves valid versions by time', () => {
    const encounter: Encounter = {
      id: 'route-209-439',
      pokemonId: 439,
      locationId: 'route-209',
      method: 'Walking',
      times: ['morning', 'day', 'night'],
      versions: ['BD', 'SP'],
      details: [{
        method: 'Walking',
        times: ['morning', 'day', 'night'],
        versions: ['BD', 'SP'],
        chance: '5%',
        levels: '16',
        source: 'https://pokemondb.net/location/sinnoh-route-209',
      }],
      source: 'https://pokemondb.net/location/sinnoh-route-209',
    };

    const result = reconcileEncounterWithSource(encounter, source);

    expect(result.encounter.details).toHaveLength(1);
    expect(result.encounter.details?.[0].versions).toEqual(['BD']);
    expect(result.encounter.details?.[0].times).toEqual(['morning', 'day', 'night']);
    expect(result.encounter.versions).toEqual(['BD']);
    expect(result.changed).toBe(true);
  });

  it('splits details when versions differ across time windows', () => {
    const encounter: Encounter = {
      id: 'route-209-439',
      pokemonId: 439,
      locationId: 'route-209',
      method: 'Walking',
      times: ['morning', 'day', 'night'],
      versions: ['BD', 'SP'],
      details: [{
        method: 'Walking',
        times: ['morning', 'day', 'night'],
        versions: ['BD', 'SP'],
        source: 'https://pokemondb.net/location/sinnoh-route-209',
      }],
      source: 'https://pokemondb.net/location/sinnoh-route-209',
    };

    const result = reconcileEncounterWithSource(encounter, source);

    expect(result.encounter.details).toHaveLength(1);
    expect(result.encounter.details?.[0].versions).toEqual(['BD']);
  });

  it('does not alter details without an external source match', () => {
    const encounter: Encounter = {
      id: 'route-209-209',
      pokemonId: 209,
      locationId: 'route-209',
      method: 'Swarm',
      condition: 'Pós-jogo',
      times: ['unknown'],
      versions: ['BD', 'SP'],
      details: [{
        method: 'Swarm',
        times: ['unknown'],
        versions: ['BD', 'SP'],
        condition: 'Pós-jogo',
        source: 'Cópia de BDSP Pokedex Worklist Sharable.xlsx',
      }],
      source: 'https://pokemondb.net/location/sinnoh-route-209',
    };

    const result = reconcileEncounterWithSource(encounter, source);

    expect(result.changed).toBe(false);
    expect(result.encounter).toEqual(encounter);
  });

  it('removes an external Walking duplicate when the same encounter is a Swarm', () => {
    const encounter: Encounter = {
      id: 'route-209-209',
      pokemonId: 209,
      locationId: 'route-209',
      method: 'Swarm · Walking',
      condition: 'Pós-jogo',
      times: ['unknown', 'morning', 'day', 'night'],
      versions: ['BD', 'SP'],
      details: [
        {
          method: 'Swarm',
          times: ['unknown'],
          versions: ['BD', 'SP'],
          condition: 'Pós-jogo',
          source: 'Cópia de BDSP Pokedex Worklist Sharable.xlsx',
        },
        {
          method: 'Walking',
          times: ['morning', 'day', 'night'],
          versions: ['BD', 'SP'],
          chance: '40%',
          source: 'https://pokemondb.net/location/sinnoh-route-209',
        },
      ],
      source: 'https://pokemondb.net/location/sinnoh-route-209',
    };

    const result = reconcileEncounterWithSource(encounter, [
      { pokemonId: 209, method: 'Swarm', versions: ['BD', 'SP'], times: ['morning', 'day', 'night'] },
    ]);

    expect(result.encounter.details?.map((detail) => detail.method)).toEqual(['Swarm']);
    expect(result.removedDetails).toBe(1);
    expect(result.changed).toBe(true);
  });

  it('converts a local Walking record to Swarm when the source only lists Swarm', () => {
    const encounter: Encounter = {
      id: 'lake-acuity-238',
      pokemonId: 238,
      locationId: 'lake-acuity',
      method: 'Walking',
      times: ['morning', 'day', 'night'],
      versions: ['BD', 'SP'],
      details: [{
        method: 'Walking',
        times: ['morning', 'day', 'night'],
        versions: ['BD', 'SP'],
        chance: '40%',
        source: 'https://pokemondb.net/location/sinnoh-lake-acuity',
      }],
      source: 'https://pokemondb.net/location/sinnoh-lake-acuity',
    };

    const result = reconcileEncounterWithSource(encounter, [
      { pokemonId: 238, method: 'Swarm', versions: ['BD', 'SP'], times: ['morning', 'day', 'night'] },
    ]);

    expect(result.encounter.method).toBe('Swarm');
    expect(result.encounter.details?.[0].method).toBe('Swarm');
    expect(result.changed).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { auditGameData } from './dataAudit';
import type { Location, Pokemon } from '../types';

const pokemon: Pokemon[] = [{ id: 41, name: 'Zubat', types: ['POISON', 'FLYING'] }];

const locationWithEncounter = (pokemonId: number): Location => ({
  id: 'route-201',
  name: 'Route 201',
  category: 'route',
  encounters: [{ id: `route-201-${pokemonId}`, pokemonId, locationId: 'route-201', method: 'Walking', times: ['day'], versions: ['BD'], source: 'source' }],
});

const locationNamed = (name: string): Location => ({
  ...locationWithEncounter(41),
  id: name.toLowerCase().replace(/ /g, '-'),
  name,
});

describe('data audit', () => {
  it('reports duplicate species in one location', () => {
    const location = locationWithEncounter(41);
    location.encounters.push({ ...location.encounters[0], id: 'route-201-41-copy' });
    const report = auditGameData([location], pokemon);
    expect(report.issues.some((issue) => issue.kind === 'duplicate-encounter')).toBe(true);
  });

  it('reports legacy route aliases', () => {
    const report = auditGameData([locationNamed('Route 22')], pokemon);
    expect(report.issues.some((issue) => issue.kind === 'invalid-location')).toBe(true);
  });

  it('reports unknown time records and preserves source coverage counts', () => {
    const location = locationWithEncounter(41);
    location.encounters[0].times = ['unknown'];
    const report = auditGameData([location], pokemon);
    expect(report.issues.some((issue) => issue.kind === 'unknown-time')).toBe(true);
    expect(report.sourceCoverage.encounters.total).toBe(1);
    expect(report.summary.issues).toBeGreaterThan(0);
  });

  it('reports invalid encounter metadata', () => {
    const location = locationWithEncounter(41);
    location.encounters[0].method = 'Teleport';
    location.encounters[0].times = ['afternoon' as never];
    location.encounters[0].versions = ['DP' as never];
    const report = auditGameData([location], pokemon);
    expect(report.issues.map((issue) => issue.kind)).toEqual(expect.arrayContaining(['invalid-method', 'invalid-time', 'invalid-version']));
  });

  it('classifies method-less special records for review instead of failing the audit', () => {
    const special = locationNamed('Grand Underground');
    special.category = 'special';
    special.encounters[0].method = undefined;
    const report = auditGameData([special], pokemon);
    expect(report.issues.some((issue) => issue.kind === 'special-case' && issue.severity === 'info')).toBe(true);
    expect(report.issues.some((issue) => issue.severity === 'error')).toBe(false);
  });
});

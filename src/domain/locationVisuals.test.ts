import { describe, expect, it } from 'vitest';
import { getCompactLocationName, getLocationVisual } from './locationVisuals';
import type { Location } from './types';

const location = (name: string, category: Location['category'] = 'area'): Location => ({ id: name.toLowerCase().replace(/ /g, '-'), name, category, encounters: [] });

describe('location visual classification', () => {
  it('distinguishes caves from larger dungeon-like areas', () => {
    expect(getLocationVisual(location('Wayward Cave')).kind).toBe('cave');
    expect(getLocationVisual(location('Snowpoint Temple')).kind).toBe('dungeon');
  });

  it('uses landscape symbols for cities, forests and water areas', () => {
    expect(getLocationVisual(location('Eterna City')).kind).toBe('city');
    expect(getLocationVisual(location('Eterna Forest')).kind).toBe('forest');
    expect(getLocationVisual(location('Lake Valor')).kind).toBe('water');
    expect(getLocationVisual(location('Full Moon Island')).kind).toBe('island');
    expect(getLocationVisual(location('Great Marsh')).kind).toBe('park');
  });

  it('keeps long roaming-area names compact without losing the source name', () => {
    expect(getCompactLocationName('Full Moon Island off of Canalave Town - then, roams Sinnoh')).toBe('Full Moon Island');
    expect(getCompactLocationName('Route 206')).toBe('Route 206');
  });
});

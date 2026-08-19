import { describe, expect, it } from 'vitest';
import { getPokemonTypeTone } from './typeVisuals';

describe('pokemon type visual tones', () => {
  it('gives every BD/SP type a dedicated tone', () => {
    const types = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];

    expect(new Set(types.map(getPokemonTypeTone)).size).toBe(types.length);
    expect(types.map(getPokemonTypeTone)).not.toContain('default');
  });

  it('falls back safely for an unknown type', () => {
    expect(getPokemonTypeTone('???')).toBe('default');
  });
});

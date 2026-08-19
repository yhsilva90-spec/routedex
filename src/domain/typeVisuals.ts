const typeTones = {
  normal: 'normal', fire: 'fire', water: 'water', electric: 'electric', grass: 'grass', ice: 'ice',
  fighting: 'fighting', poison: 'poison', ground: 'ground', flying: 'flying', psychic: 'psychic', bug: 'bug',
  rock: 'rock', ghost: 'ghost', dragon: 'dragon', dark: 'dark', steel: 'steel', fairy: 'fairy',
} as const;

export function getPokemonTypeTone(type: string): string {
  return typeTones[type.trim().toLowerCase() as keyof typeof typeTones] ?? 'default';
}

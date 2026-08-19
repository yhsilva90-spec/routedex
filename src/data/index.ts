import { gameData } from './gameData';
import type { Acquisition, ChecklistItem, Location, Pokemon, TMEntry } from '../domain/types';
export { eliteFour, gymLeaders } from './leagueData';

export const pokemon = gameData.pokemon as unknown as Pokemon[];
export const locations = gameData.locations as unknown as Location[];
export const postgame = gameData.postgame as unknown as ChecklistItem[];
export const tms = gameData.tms as unknown as TMEntry[];
export const acquisitions = gameData.acquisitions as unknown as Acquisition[];

export const pokemonById = new Map(pokemon.map((item) => [item.id, item]));
export const sinnohPokemon = pokemon.filter((item) => item.sinnohNumber).sort((a, b) => (a.sinnohNumber ?? 999) - (b.sinnohNumber ?? 999));

export const spriteUrl = (id: number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/${id}.png`;

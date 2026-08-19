export type EncounterTime = 'morning' | 'day' | 'night' | 'unknown';
export type GameVersion = 'BD' | 'SP';
export type LocationCategory = 'route' | 'area' | 'special';
export type AcquisitionGroup = 'breed' | 'event' | 'trade' | 'egg' | 'evolution' | 'special';

export type Encounter = {
  id: string;
  pokemonId: number;
  locationId: string;
  method?: string;
  condition?: string;
  times: EncounterTime[];
  versions: GameVersion[];
  details?: EncounterDetail[];
  source?: string;
};

export type EncounterDetail = {
  method: string;
  times: EncounterTime[];
  versions: GameVersion[];
  chance?: string;
  rarity?: string;
  levels?: string;
  condition?: string;
  source?: string;
};

export type Location = {
  id: string;
  name: string;
  category: LocationCategory;
  encounters: Encounter[];
};

export type Pokemon = {
  id: number;
  name: string;
  types: string[];
  sinnohNumber?: number;
};

export type Acquisition = {
  id: string;
  pokemonId: number;
  group: AcquisitionGroup;
  label: string;
  source?: string;
};

export type ChecklistItem = { id: number; title: string };
export type TMEntry = { id: number; name: string; location: string };

export type LeagueMember = {
  id: string;
  order: number;
  name: string;
  kind: 'gym' | 'elite-four';
  specialty: string;
  city?: string;
  badgeName?: string;
  leaderImage: string;
  badgeImage?: string;
};

export type ProgressState = {
  version: number;
  capturedPokemon: Record<number, boolean>;
  captureOrigins: Record<number, string>;
  postgameCompleted: Record<number, boolean>;
  collectedTMs: Record<number, boolean>;
  gymLeadersCompleted: Record<string, boolean>;
  eliteFourCompleted: Record<string, boolean>;
};

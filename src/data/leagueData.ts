import type { LeagueMember } from '../domain/types';

const archiveFile = (filename: string) => `https://archives.bulbagarden.net/wiki/Special:FilePath/${encodeURIComponent(filename.replace(/ /g, '_'))}`;
const leaderImage = (name: string) => archiveFile(`VS${name} BDSP.png`);
const badgeImage = (name: string) => archiveFile(`Badge Case ${name} IV.png`);

export const gymLeaders: LeagueMember[] = [
  { id: 'roark', order: 1, name: 'Roark', kind: 'gym', city: 'Oreburgh City', specialty: 'Rock', badgeName: 'Coal Badge', leaderImage: leaderImage('Roark'), badgeImage: badgeImage('Roark') },
  { id: 'gardenia', order: 2, name: 'Gardenia', kind: 'gym', city: 'Eterna City', specialty: 'Grass', badgeName: 'Forest Badge', leaderImage: leaderImage('Gardenia'), badgeImage: badgeImage('Gardenia') },
  { id: 'maylene', order: 3, name: 'Maylene', kind: 'gym', city: 'Veilstone City', specialty: 'Fighting', badgeName: 'Cobble Badge', leaderImage: leaderImage('Maylene'), badgeImage: badgeImage('Maylene') },
  { id: 'crasher-wake', order: 4, name: 'Crasher Wake', kind: 'gym', city: 'Pastoria City', specialty: 'Water', badgeName: 'Fen Badge', leaderImage: leaderImage('Crasher Wake'), badgeImage: badgeImage('Crasher Wake') },
  { id: 'fantina', order: 5, name: 'Fantina', kind: 'gym', city: 'Hearthome City', specialty: 'Ghost', badgeName: 'Relic Badge', leaderImage: leaderImage('Fantina'), badgeImage: badgeImage('Fantina') },
  { id: 'byron', order: 6, name: 'Byron', kind: 'gym', city: 'Canalave City', specialty: 'Steel', badgeName: 'Mine Badge', leaderImage: leaderImage('Byron'), badgeImage: badgeImage('Byron') },
  { id: 'candice', order: 7, name: 'Candice', kind: 'gym', city: 'Snowpoint City', specialty: 'Ice', badgeName: 'Icicle Badge', leaderImage: leaderImage('Candice'), badgeImage: badgeImage('Candice') },
  { id: 'volkner', order: 8, name: 'Volkner', kind: 'gym', city: 'Sunyshore City', specialty: 'Electric', badgeName: 'Beacon Badge', leaderImage: leaderImage('Volkner'), badgeImage: badgeImage('Volkner') },
];

export const eliteFour: LeagueMember[] = [
  { id: 'aaron', order: 1, name: 'Aaron', kind: 'elite-four', specialty: 'Bug', leaderImage: leaderImage('Aaron') },
  { id: 'bertha', order: 2, name: 'Bertha', kind: 'elite-four', specialty: 'Ground', leaderImage: leaderImage('Bertha') },
  { id: 'flint', order: 3, name: 'Flint', kind: 'elite-four', specialty: 'Fire', leaderImage: leaderImage('Flint') },
  { id: 'lucian', order: 4, name: 'Lucian', kind: 'elite-four', specialty: 'Psychic', leaderImage: leaderImage('Lucian') },
];

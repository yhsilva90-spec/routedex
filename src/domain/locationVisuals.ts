import type { Location } from './types';

export type LocationVisualKind = 'route' | 'cave' | 'dungeon' | 'city' | 'forest' | 'water' | 'island' | 'park' | 'special' | 'map';
export type LocationVisual = { kind: LocationVisualKind; label: string };

export function getCompactLocationName(name: string): string {
  return name
    .replace(/\s+off of .+?(?=\s+- then, roams Sinnoh$)/i, '')
    .replace(/\s+- then, roams Sinnoh$/i, '');
}

export function getLocationVisual(location: Location): LocationVisual {
  const name = location.name.toLowerCase();
  if (location.category === 'route') return { kind: 'route', label: 'Rota' };
  if (/island/.test(name)) return { kind: 'island', label: 'Ilha' };
  if (/park|garden|marsh/.test(name)) return { kind: 'park', label: 'Parque' };
  if (/city|town/.test(name)) return { kind: 'city', label: 'Cidade' };
  if (/cave|tunnel|mine|ravaged path|oreburgh gate/.test(name)) return { kind: 'cave', label: 'Caverna' };
  if (/temple|tower|chateau|victory road|pokemon league|stark mountain|mt\. coronet|ruins|iron island/.test(name)) return { kind: 'dungeon', label: 'Dungeon' };
  if (/forest|honey tree/.test(name)) return { kind: 'forest', label: 'Floresta' };
  if (/lake|lakefront|spring|open water/.test(name)) return { kind: 'water', label: 'Água' };
  if (location.category === 'special') return { kind: 'special', label: 'Especial' };
  return { kind: 'map', label: 'Área' };
}

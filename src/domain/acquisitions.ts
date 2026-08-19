import type { AcquisitionGroup } from './types';

export function classifyAcquisition(label: string): AcquisitionGroup {
  const value = label.toLowerCase();
  if (value.includes('breed')) return 'breed';
  if (value.includes('mystery gift') || value.includes('event') || value.includes('glitch')) return 'event';
  if (value.includes('trade')) return 'trade';
  if (value.includes('egg') || value.includes('starter') || value.includes('gift')) return 'egg';
  if (value.includes('evolve') || value.includes('shedinja')) return 'evolution';
  return 'special';
}

export function getAcquisitionGroupLabel(group: AcquisitionGroup): string {
  return ({ breed: 'Breed', event: 'Eventos', trade: 'Trocas', egg: 'Ovos e presentes', evolution: 'Evoluções', special: 'Especiais' })[group];
}

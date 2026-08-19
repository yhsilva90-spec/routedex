import { describe, expect, it } from 'vitest';
import { classifyAcquisition, getAcquisitionGroupLabel } from './acquisitions';

describe('acquisition groups', () => {
  it('classifies breeding, events, trades, eggs and evolutions separately', () => {
    expect(classifyAcquisition('Breed Ariados')).toBe('breed');
    expect(classifyAcquisition('Future Mystery Gift Required')).toBe('event');
    expect(classifyAcquisition('Oreburgh City (Trade)')).toBe('trade');
    expect(classifyAcquisition('Hatch Egg From Iron Island')).toBe('egg');
    expect(classifyAcquisition('Evolve Kricketot')).toBe('evolution');
  });

  it('provides readable labels for the third section', () => {
    expect(getAcquisitionGroupLabel('breed')).toBe('Breed');
    expect(getAcquisitionGroupLabel('event')).toBe('Eventos');
    expect(getAcquisitionGroupLabel('egg')).toBe('Ovos e presentes');
  });
});

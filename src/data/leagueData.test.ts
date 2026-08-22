import { describe, expect, it } from 'vitest';
import { eliteFour, gymLeaders } from './leagueData';

describe('BDSP League data', () => {
  it('contains the eight gym leaders in badge order', () => {
    expect(gymLeaders).toHaveLength(8);
    expect(gymLeaders.map((leader) => leader.id)).toEqual([
      'roark', 'gardenia', 'maylene', 'crasher-wake', 'fantina', 'byron', 'candice', 'volkner',
    ]);
    expect(gymLeaders.every((leader) => leader.badgeImage)).toBe(true);
    expect(gymLeaders.every((leader) => leader.leaderImage.includes('/media/upload/'))).toBe(true);
  });

  it('contains the four Elite Four members in battle order', () => {
    expect(eliteFour).toHaveLength(4);
    expect(eliteFour.map((member) => member.id)).toEqual(['aaron', 'bertha', 'flint', 'lucian']);
    expect(new Set([...gymLeaders, ...eliteFour].map((member) => member.id)).size).toBe(12);
    expect(eliteFour.every((member) => member.leaderImage.includes('/media/upload/'))).toBe(true);
  });
});

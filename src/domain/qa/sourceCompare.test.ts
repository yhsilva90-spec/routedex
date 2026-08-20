import { describe, expect, it } from 'vitest';
import { compareLocalEncounters, parsePokemonDatabaseHtml } from './sourceCompare';

const route209Html = `
  <h3>Random Encounter - Morning</h3>
  <table>
    <tr>
      <td class="cell-fixed cell-name"><a class="ent-name" title="View Pokedex for #0439 Mime Jr.">Mime Jr.</a></td>
      <td class="cell-loc-game cell-loc-game-BD8">BD</td><td class="cell-loc-game cell-loc-game-blank">SP</td>
      <td class="cell-fixed"><img alt="Morning"><span title="Not in the Day"></span><span title="Not in the Night"></span></td>
    </tr>
  </table>
  <h3>Random Encounter - Day</h3>
  <table>
    <tr>
      <td class="cell-fixed cell-name"><a class="ent-name" title="View Pokedex for #0439 Mime Jr.">Mime Jr.</a></td>
      <td class="cell-loc-game cell-loc-game-BD8">BD</td><td class="cell-loc-game cell-loc-game-blank">SP</td>
      <td class="cell-fixed"><span title="Not in the Morning"></span><img alt="Day"><span title="Not in the Night"></span></td>
    </tr>
  </table>`;

describe('source encounter comparison', () => {
  it('parses version-specific rows and encounter times', () => {
    expect(parsePokemonDatabaseHtml(route209Html)).toEqual([
      { pokemonId: 439, method: 'Walking', versions: ['BD'], times: ['morning'] },
      { pokemonId: 439, method: 'Walking', versions: ['BD'], times: ['day'] },
    ]);
  });

  it('reports a local SP record that the source does not support', () => {
    const issues = compareLocalEncounters(
      [{ pokemonId: 439, method: 'Walking', versions: ['BD', 'SP'], times: ['morning'], location: 'Route 209' }],
      [{ pokemonId: 439, method: 'Walking', versions: ['BD'], times: ['morning'] }],
    );
    expect(issues).toEqual([expect.objectContaining({ kind: 'source-version-conflict', pokemonId: 439, version: 'SP' })]);
  });

  it('reports an encounter present in the source but missing locally', () => {
    const issues = compareLocalEncounters(
      [],
      [{ pokemonId: 438, method: 'Walking', versions: ['SP'], times: ['morning'] }],
    );
    expect(issues).toEqual([expect.objectContaining({ kind: 'source-encounter-missing', pokemonId: 438 })]);
  });
});

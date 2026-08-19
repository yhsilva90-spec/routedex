import { describe, expect, it } from 'vitest';
import { agentCommands } from '../../scripts/routedex-agent.mjs';

describe('RouteDex maintenance agent', () => {
  it('exposes safe, explicit maintenance commands', () => {
    expect(Object.keys(agentCommands)).toEqual(['dev', 'check', 'audit', 'prepareUpdate']);
    expect(agentCommands.check.mutatesFiles).toBe(false);
    expect(agentCommands.prepareUpdate.mutatesFiles).toBe(false);
  });
});

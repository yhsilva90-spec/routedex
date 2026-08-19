import { describe, expect, it } from 'vitest';
import { createProgress, toggleChecklist } from './progress';
import { loadStoredProgress, progressStorageKey, saveStoredProgress } from './storage';

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe('local progress storage', () => {
  it('saves and restores the complete progress state', () => {
    const storage = memoryStorage();
    const progress = toggleChecklist(createProgress(), 'postgameCompleted', 7);

    saveStoredProgress(storage, progress);

    expect(loadStoredProgress(storage).postgameCompleted[7]).toBe(true);
    expect(storage.getItem(progressStorageKey)).toContain('"version": 1');
  });

  it('migrates the previous v1 browser key', () => {
    const storage = memoryStorage();
    const progress = toggleChecklist(createProgress(), 'collectedTMs', 13);
    storage.setItem('routedex-progress-v1', JSON.stringify(progress));

    expect(loadStoredProgress(storage).collectedTMs[13]).toBe(true);
  });

  it('falls back to a clean state when browser data is invalid', () => {
    const storage = memoryStorage();
    storage.setItem(progressStorageKey, '{broken');

    expect(loadStoredProgress(storage)).toEqual(createProgress());
  });
});

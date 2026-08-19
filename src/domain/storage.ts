import { createProgress, parseProgress, serializeProgress } from './progress';
import type { ProgressState } from './types';

export const progressStorageKey = 'routedex-progress-v2';
const legacyProgressStorageKey = 'routedex-progress-v1';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export function loadStoredProgress(storage: StorageLike, fallback: () => ProgressState = createProgress): ProgressState {
  for (const key of [progressStorageKey, legacyProgressStorageKey]) {
    try {
      const saved = storage.getItem(key);
      if (saved) return parseProgress(saved);
    } catch {
      // Continue to the legacy key before falling back to a clean state.
    }
  }
  return fallback();
}

export function saveStoredProgress(storage: StorageLike, progress: ProgressState): void {
  storage.setItem(progressStorageKey, serializeProgress(progress));
}

export async function requestPersistentBrowserStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) return false;
  try {
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

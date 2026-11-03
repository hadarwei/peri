import { useSyncExternalStore } from 'react';

// A tiny "something was saved" signal. Screens that show saved data re-read it when this changes,
// including after a modal closes (a tab does not get a focus event then).
let version = 0;
const listeners = new Set<() => void>();

export function notifyDataChanged(): void {
  version += 1;
  listeners.forEach((l) => l());
}

export function useDataVersion(): number {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => version,
  );
}

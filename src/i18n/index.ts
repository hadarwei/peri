import { he, type StringKey } from './he';

/** Look up a Hebrew string by dotted key, e.g. t('tabs.today'). */
export function t(key: StringKey): string {
  let node: unknown = he;
  for (const part of key.split('.')) {
    node = (node as Record<string, unknown>)[part];
  }
  return node as string;
}

export type { StringKey };

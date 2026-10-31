import { he, type StringKey } from './he';

/** Look up a Hebrew string by dotted key, e.g. t('tabs.today'). */
export function t(key: StringKey): string {
  let node: unknown = he;
  for (const part of key.split('.')) {
    node = (node as Record<string, unknown>)[part];
  }
  return node as string;
}

/** Like t(), then fills {placeholders}: tf('today.dayOfCycle', { day: 3, length: 28 }). */
export function tf(key: StringKey, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (text, [name, value]) => text.split(`{${name}}`).join(String(value)),
    t(key),
  );
}

export type { StringKey };

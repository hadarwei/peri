import * as Haptics from 'expo-haptics';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { pickMessageIndex } from '../core/pickMessage';
import { he } from '../i18n/he';

export const CELEBRATE_MS = 2800;
export const MESSAGE_MS = 5000;

export interface DuckMessage {
  /** Changes with every message, so the same text shown twice still re-animates. */
  id: number;
  text: string;
}

interface DuckContextValue {
  /** True while the duck is dancing. */
  celebrating: boolean;
  /** Makes the duck dance for 2.8 s with a light haptic and says something nice. */
  celebrate: () => void;
  /** The cloud message currently on screen (null when there is none; it clears after 5 s). */
  message: DuckMessage | null;
  /** Shows a friendly hello cloud, e.g. when the Today screen opens. */
  sayHello: () => void;
}

const DuckContext = createContext<DuckContextValue | null>(null);

export function DuckProvider({ children }: { children: ReactNode }) {
  const [celebrating, setCelebrating] = useState(false);
  const [message, setMessage] = useState<DuckMessage | null>(null);
  const danceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastIndex = useRef<Record<'hello' | 'celebrate', number | null>>({
    hello: null,
    celebrate: null,
  });
  const nextId = useRef(1);

  const say = useCallback((kind: 'hello' | 'celebrate') => {
    const list = he.cloud[kind];
    const index = pickMessageIndex(list.length, lastIndex.current[kind]);
    lastIndex.current[kind] = index;
    setMessage({ id: nextId.current++, text: list[index] });
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => {
      setMessage(null);
      messageTimer.current = null;
    }, MESSAGE_MS);
  }, []);

  const celebrate = useCallback(() => {
    // Haptics can fail on devices without a haptic engine; the dance must still happen.
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setCelebrating(true);
    if (danceTimer.current) clearTimeout(danceTimer.current);
    danceTimer.current = setTimeout(() => {
      setCelebrating(false);
      danceTimer.current = null;
    }, CELEBRATE_MS);
    say('celebrate');
  }, [say]);

  const sayHello = useCallback(() => say('hello'), [say]);

  useEffect(
    () => () => {
      if (danceTimer.current) clearTimeout(danceTimer.current);
      if (messageTimer.current) clearTimeout(messageTimer.current);
    },
    [],
  );

  const value = useMemo(
    () => ({ celebrating, celebrate, message, sayHello }),
    [celebrating, celebrate, message, sayHello],
  );
  return <DuckContext.Provider value={value}>{children}</DuckContext.Provider>;
}

/** Any screen can call `const { celebrate } = useDuck(); celebrate();`. */
export function useDuck(): DuckContextValue {
  const ctx = useContext(DuckContext);
  if (!ctx) throw new Error('useDuck must be used inside <DuckProvider>');
  return ctx;
}

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

export const CELEBRATE_MS = 2800;

interface DuckContextValue {
  /** True while the duck is dancing. */
  celebrating: boolean;
  /** Makes the duck dance for 2.8 s with a light haptic. Calling again restarts the dance. */
  celebrate: () => void;
}

const DuckContext = createContext<DuckContextValue | null>(null);

export function DuckProvider({ children }: { children: ReactNode }) {
  const [celebrating, setCelebrating] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const celebrate = useCallback(() => {
    // Haptics can fail on devices without a haptic engine; the dance must still happen.
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setCelebrating(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setCelebrating(false);
      timer.current = null;
    }, CELEBRATE_MS);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const value = useMemo(() => ({ celebrating, celebrate }), [celebrating, celebrate]);
  return <DuckContext.Provider value={value}>{children}</DuckContext.Provider>;
}

/** Any screen can call `const { celebrate } = useDuck(); celebrate();`. */
export function useDuck(): DuckContextValue {
  const ctx = useContext(DuckContext);
  if (!ctx) throw new Error('useDuck must be used inside <DuckProvider>');
  return ctx;
}

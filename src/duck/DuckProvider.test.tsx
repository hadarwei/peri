import { act, renderHook } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';

import { CELEBRATE_MS, DuckProvider, useDuck } from './DuckProvider';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light' },
}));

const wrapper = ({ children }: { children: ReactNode }) => <DuckProvider>{children}</DuckProvider>;

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

describe('useDuck', () => {
  it('starts calm, dances for 2.8 s with one light haptic, then stops', async () => {
    const { result } = await renderHook(() => useDuck(), { wrapper });
    expect(result.current.celebrating).toBe(false);

    await act(async () => {
      result.current.celebrate();
    });
    expect(result.current.celebrating).toBe(true);
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');

    await act(async () => {
      jest.advanceTimersByTime(CELEBRATE_MS - 1);
    });
    expect(result.current.celebrating).toBe(true);
    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current.celebrating).toBe(false);
  });

  it('celebrating again restarts the 2.8 s window', async () => {
    const { result } = await renderHook(() => useDuck(), { wrapper });
    await act(async () => {
      result.current.celebrate();
    });
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    await act(async () => {
      result.current.celebrate();
    });
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.celebrating).toBe(true);
    await act(async () => {
      jest.advanceTimersByTime(800);
    });
    expect(result.current.celebrating).toBe(false);
  });

  it('throws a clear error outside the provider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderHook(() => useDuck())).rejects.toThrow('DuckProvider');
  });
});

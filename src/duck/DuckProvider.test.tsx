import { act, renderHook } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';

import { he } from '../i18n/he';
import { CELEBRATE_MS, DuckProvider, MESSAGE_MS, useDuck } from './DuckProvider';

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

  it('celebrating shows a celebrate message that disappears after 5 s', async () => {
    const { result } = await renderHook(() => useDuck(), { wrapper });
    expect(result.current.message).toBeNull();
    await act(async () => {
      result.current.celebrate();
    });
    expect(he.cloud.celebrate).toContain(result.current.message?.text);
    await act(async () => {
      jest.advanceTimersByTime(MESSAGE_MS - 1);
    });
    expect(result.current.message).not.toBeNull();
    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current.message).toBeNull();
  });

  it('sayHello shows a hello message, and a new message gets a new id', async () => {
    const { result } = await renderHook(() => useDuck(), { wrapper });
    await act(async () => {
      result.current.sayHello();
    });
    const first = result.current.message;
    expect(he.cloud.hello).toContain(first?.text);
    await act(async () => {
      result.current.sayHello();
    });
    expect(result.current.message?.id).not.toBe(first?.id);
    expect(result.current.message?.text).not.toBe(first?.text); // never the same twice in a row
  });
});

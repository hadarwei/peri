import { act, renderHook } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { useReduceMotion } from './useReduceMotion';

describe('useReduceMotion', () => {
  it('reads the current setting and follows live changes', async () => {
    let listener: (v: boolean) => void = () => {};
    const remove = jest.fn();
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation(((
      _name: string,
      cb: (v: boolean) => void,
    ) => {
      listener = cb;
      return { remove };
    }) as never);

    const { result, unmount } = await renderHook(() => useReduceMotion());
    await act(async () => {});
    expect(result.current).toBe(true);

    await act(async () => listener(false));
    expect(result.current).toBe(false);

    await unmount();
    expect(remove).toHaveBeenCalled();
  });
});

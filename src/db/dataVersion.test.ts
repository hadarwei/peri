import { act, renderHook } from '@testing-library/react-native';

import { notifyDataChanged, useDataVersion } from './dataVersion';

describe('useDataVersion', () => {
  it('changes every time data is saved', async () => {
    const { result } = await renderHook(() => useDataVersion());
    const before = result.current;
    await act(async () => notifyDataChanged());
    expect(result.current).toBe(before + 1);
    await act(async () => notifyDataChanged());
    expect(result.current).toBe(before + 2);
  });
});

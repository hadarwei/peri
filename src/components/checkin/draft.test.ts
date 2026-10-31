import { toggleSymptom } from './draft';

describe('toggleSymptom', () => {
  it('adds a missing symptom and removes a present one', () => {
    expect(toggleSymptom([], 'a')).toEqual(['a']);
    expect(toggleSymptom(['a', 'b'], 'a')).toEqual(['b']);
  });
  it('does not change the original list', () => {
    const list = ['a'];
    toggleSymptom(list, 'b');
    expect(list).toEqual(['a']);
  });
});

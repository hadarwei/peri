import {
  EMPTY_DRAFT,
  draftFromLog,
  draftFromYesterday,
  isDraftEmpty,
  toggleSymptom,
} from './draft';

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

const log = { mood: 4, symptoms: ['a'], flow: 1, pain: 3, energy: 2, note: 'hello' };

describe('drafts', () => {
  it('draftFromLog copies everything and does not share the symptoms array', () => {
    const d = draftFromLog(log);
    expect(d).toEqual(log);
    d.symptoms.push('b');
    expect(log.symptoms).toEqual(['a']);
  });

  it('same as yesterday copies the feelings but not the note', () => {
    expect(draftFromYesterday(log)).toEqual({ ...log, note: '' });
  });

  it('an empty draft is empty; any field makes it non-empty; a blank note does not', () => {
    expect(isDraftEmpty(EMPTY_DRAFT)).toBe(true);
    expect(isDraftEmpty({ ...EMPTY_DRAFT, note: '   ' })).toBe(true);
    expect(isDraftEmpty({ ...EMPTY_DRAFT, mood: 1 })).toBe(false);
    expect(isDraftEmpty({ ...EMPTY_DRAFT, symptoms: ['x'] })).toBe(false);
    expect(isDraftEmpty({ ...EMPTY_DRAFT, flow: 0 })).toBe(false); // 0 is a real answer
  });
});

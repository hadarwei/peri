import { topSymptoms } from './topSymptoms';

const D = ['a', 'b', 'c', 'd'];

describe('topSymptoms', () => {
  it('uses the defaults when there is no history', () => {
    expect(topSymptoms([], 3, D)).toEqual(['a', 'b', 'c']);
  });

  it('ranks by how many days each symptom was logged', () => {
    const logs = [
      { date: '2026-01-01', symptoms: ['x', 'y'] },
      { date: '2026-01-02', symptoms: ['y'] },
      { date: '2026-01-03', symptoms: ['y', 'z'] },
      { date: '2026-01-04', symptoms: ['z'] },
    ];
    expect(topSymptoms(logs, 3, D)).toEqual(['y', 'z', 'x']);
  });

  it('breaks ties by the most recent day', () => {
    const logs = [
      { date: '2026-01-01', symptoms: ['old'] },
      { date: '2026-02-01', symptoms: ['new'] },
    ];
    expect(topSymptoms(logs, 2, D)).toEqual(['new', 'old']);
  });

  it('fills the remaining slots from the defaults without repeating', () => {
    const logs = [{ date: '2026-01-01', symptoms: ['b'] }];
    expect(topSymptoms(logs, 3, D)).toEqual(['b', 'a', 'c']);
  });

  it('counts a symptom once per day even if it is listed twice', () => {
    const logs = [
      { date: '2026-01-01', symptoms: ['p', 'p'] },
      { date: '2026-01-02', symptoms: ['q'] },
      { date: '2026-01-03', symptoms: ['q'] },
    ];
    expect(topSymptoms(logs, 2, D)).toEqual(['q', 'p']);
  });
});

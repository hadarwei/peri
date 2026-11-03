import { checkImportDate } from './importCycle';

const TODAY = '2026-11-03';
const STARTS = ['2026-09-10', '2026-10-08'];

describe('checkImportDate', () => {
  it('accepts a past date that starts no cycle yet', () => {
    expect(checkImportDate('2026-08-13', TODAY, STARTS)).toBe('ok');
  });

  it('accepts today', () => {
    expect(checkImportDate(TODAY, TODAY, STARTS)).toBe('ok');
  });

  it('rejects the future', () => {
    expect(checkImportDate('2026-11-04', TODAY, STARTS)).toBe('future');
  });

  it('rejects a date that already starts a cycle', () => {
    expect(checkImportDate('2026-09-10', TODAY, STARTS)).toBe('exists');
  });

  it('works with no cycles yet', () => {
    expect(checkImportDate('2026-10-01', TODAY, [])).toBe('ok');
  });
});

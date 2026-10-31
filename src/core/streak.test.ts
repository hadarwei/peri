import { calculateStreak } from './streak';

const TODAY = '2026-11-10';

describe('calculateStreak', () => {
  it('no check-ins: 0', () => {
    expect(calculateStreak([], TODAY)).toBe(0);
  });

  it('only today: 1', () => {
    expect(calculateStreak([TODAY], TODAY)).toBe(1);
  });

  it('today and the 4 days before: 5', () => {
    expect(
      calculateStreak(['2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09', TODAY], TODAY),
    ).toBe(5);
  });

  it('today not checked yet: the streak is still alive through yesterday', () => {
    expect(calculateStreak(['2026-11-07', '2026-11-08', '2026-11-09'], TODAY)).toBe(3);
  });

  it('a whole missed day breaks it: nothing yesterday and nothing today is 0', () => {
    expect(calculateStreak(['2026-11-07', '2026-11-08'], TODAY)).toBe(0);
  });

  it('a gap in the past ends the count there', () => {
    expect(calculateStreak(['2026-11-05', '2026-11-08', '2026-11-09', TODAY], TODAY)).toBe(3);
  });

  it('does not care about order or duplicates', () => {
    expect(calculateStreak([TODAY, '2026-11-08', '2026-11-09', TODAY, '2026-11-09'], TODAY)).toBe(
      3,
    );
  });

  it('ignores dates in the future', () => {
    expect(calculateStreak(['2026-11-11', '2026-11-12'], TODAY)).toBe(0);
    expect(calculateStreak([TODAY, '2026-11-11'], TODAY)).toBe(1);
  });

  it('counts a long streak across month, year and a leap day', () => {
    const dates: string[] = [];
    let d = new Date(2027, 2, 1); // 1 Mar 2027, counting back 400 days
    for (let i = 0; i < 400; i++) {
      dates.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      );
      d = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
    }
    expect(calculateStreak(dates, '2027-03-01')).toBe(400);
  });
});

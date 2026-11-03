import { getTodayCards, type TodayCardsInput } from './todayCards';

// Base case: has history, a regular day in the middle of a cycle, nothing optional turned on.
const base: TodayCardsInput = {
  today: '2026-11-10',
  hasHistory: true,
  predictedPeriodStart: '2026-11-26', // 16 days away
  periodStartMarked: false,
  fertileWindow: { start: '2026-11-17', end: '2026-11-22' },
  temperatureEnabled: false,
  temperatureDaily: false,
  testsEnabled: false,
  pregnancyMode: false,
};
const cards = (over: Partial<TodayCardsInput> = {}) => getTodayCards({ ...base, ...over });

const ALWAYS = ['mood', 'sameAsYesterday', 'symptoms', 'moreDetails'];

describe('getTodayCards', () => {
  it('regular day: only the always-on cards, in screen order', () => {
    expect(cards()).toEqual(ALWAYS);
  });

  describe('fertile window', () => {
    const inWindow = { today: '2026-11-18' };

    it('with temperature tracking on: adds the temperature card', () => {
      expect(cards({ ...inWindow, temperatureEnabled: true })).toEqual([
        'mood',
        'sameAsYesterday',
        'symptoms',
        'temperature',
        'moreDetails',
      ]);
    });

    it('with only tests on: adds the LH test card and no temperature card', () => {
      expect(cards({ ...inWindow, testsEnabled: true })).toEqual([
        'mood',
        'sameAsYesterday',
        'symptoms',
        'lhTest',
        'moreDetails',
      ]);
    });

    it('with both on: temperature comes before the LH test', () => {
      expect(cards({ ...inWindow, temperatureEnabled: true, testsEnabled: true })).toEqual([
        'mood',
        'sameAsYesterday',
        'symptoms',
        'temperature',
        'lhTest',
        'moreDetails',
      ]);
    });

    it('the window is inclusive on both ends', () => {
      expect(cards({ today: '2026-11-17', testsEnabled: true })).toContain('lhTest');
      expect(cards({ today: '2026-11-22', testsEnabled: true })).toContain('lhTest');
      expect(cards({ today: '2026-11-16', testsEnabled: true })).not.toContain('lhTest');
      expect(cards({ today: '2026-11-23', testsEnabled: true })).not.toContain('lhTest');
    });

    it('features that are switched off never show, even in the window', () => {
      expect(cards(inWindow)).toEqual(ALWAYS);
    });
  });

  describe('daily temperature tracking', () => {
    it('shows the temperature card outside the fertile window', () => {
      expect(cards({ temperatureEnabled: true, temperatureDaily: true })).toContain('temperature');
    });

    it('is ignored when temperature tracking itself is off', () => {
      expect(cards({ temperatureDaily: true })).not.toContain('temperature');
    });

    it('does not add the LH test outside the window', () => {
      expect(
        cards({ temperatureEnabled: true, temperatureDaily: true, testsEnabled: true }),
      ).not.toContain('lhTest');
    });
  });

  describe('did the period start?', () => {
    it('period expected today: asks first', () => {
      expect(cards({ today: '2026-11-26' })).toEqual(['periodStart', ...ALWAYS]);
    });

    it('asks from 2 days before until 2 days after the prediction, not earlier', () => {
      expect(cards({ today: '2026-11-24' })).toContain('periodStart');
      expect(cards({ today: '2026-11-28' })).toContain('periodStart');
      expect(cards({ today: '2026-11-23' })).not.toContain('periodStart');
    });

    it('period late and not yet marked: keeps asking every day', () => {
      expect(cards({ today: '2026-11-29' })).toContain('periodStart');
      expect(cards({ today: '2026-12-10' })).toContain('periodStart');
    });

    it('does not ask when the start was already marked', () => {
      expect(cards({ today: '2026-11-26', periodStartMarked: true })).toEqual(ALWAYS);
      expect(cards({ today: '2026-12-02', periodStartMarked: true })).toEqual(ALWAYS);
    });

    it('does not ask when there is no prediction', () => {
      expect(cards({ predictedPeriodStart: null, fertileWindow: null })).toEqual(ALWAYS);
    });
  });

  describe('pregnancy mode', () => {
    it('hides the fertility cards even in the window', () => {
      expect(
        cards({
          today: '2026-11-18',
          pregnancyMode: true,
          temperatureEnabled: true,
          temperatureDaily: true,
          testsEnabled: true,
        }),
      ).toEqual(ALWAYS);
    });

    it('does not ask whether the period started', () => {
      expect(cards({ today: '2026-11-26', pregnancyMode: true })).toEqual(ALWAYS);
    });
  });

  describe('no history', () => {
    it('shows only the minimal card set, whatever is switched on', () => {
      expect(
        cards({
          hasHistory: false,
          predictedPeriodStart: null,
          fertileWindow: null,
          temperatureEnabled: true,
          temperatureDaily: true,
          testsEnabled: true,
        }),
      ).toEqual(ALWAYS);
    });
  });
});

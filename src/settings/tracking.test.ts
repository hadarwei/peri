import { DEFAULT_SETTINGS, isValidTime, parseSettings, serializeSetting } from './tracking';

describe('parseSettings', () => {
  it('everything missing: the defaults, with every feature off', () => {
    expect(parseSettings({})).toEqual(DEFAULT_SETTINGS);
    expect(DEFAULT_SETTINGS).toMatchObject({
      tempEnabled: false,
      reminderEnabled: false,
      testsEnabled: false,
      pregnancyMode: false,
      tempRemindersIgnoredCount: 0,
    });
  });

  it('reads stored booleans and ignores garbage', () => {
    expect(parseSettings({ tempEnabled: '1', testsEnabled: '0', tempDaily: 'yes' })).toMatchObject({
      tempEnabled: true,
      testsEnabled: false,
      tempDaily: false,
    });
  });

  it('keeps a valid reminder time and falls back from an invalid one', () => {
    expect(parseSettings({ reminderTime: '06:45' }).reminderTime).toBe('06:45');
    expect(parseSettings({ reminderTime: '25:00' }).reminderTime).toBe('07:30');
    expect(parseSettings({ reminderTime: '7:30' }).reminderTime).toBe('07:30');
    expect(parseSettings({ reminderTime: null }).reminderTime).toBe('07:30');
  });

  it('the fallback time follows the evening window', () => {
    expect(parseSettings({ reminderWindow: 'evening' })).toMatchObject({
      reminderWindow: 'evening',
      reminderTime: '21:00',
    });
    expect(parseSettings({ reminderWindow: 'evening', reminderTime: '22:15' }).reminderTime).toBe(
      '22:15',
    );
  });

  it('an unknown window becomes morning', () => {
    expect(parseSettings({ reminderWindow: 'noon' }).reminderWindow).toBe('morning');
  });

  it('the ignored counter must be a non-negative whole number', () => {
    expect(parseSettings({ tempRemindersIgnoredCount: '2' }).tempRemindersIgnoredCount).toBe(2);
    expect(parseSettings({ tempRemindersIgnoredCount: '-1' }).tempRemindersIgnoredCount).toBe(0);
    expect(parseSettings({ tempRemindersIgnoredCount: '1.5' }).tempRemindersIgnoredCount).toBe(0);
    expect(parseSettings({ tempRemindersIgnoredCount: 'x' }).tempRemindersIgnoredCount).toBe(0);
  });
});

describe('isValidTime', () => {
  it.each([
    ['00:00', true],
    ['23:59', true],
    ['24:00', false],
    ['12:60', false],
    ['1:00', false],
    ['', false],
  ])('%s -> %s', (value, expected) => {
    expect(isValidTime(value)).toBe(expected);
  });
});

describe('serializeSetting', () => {
  it('stores booleans as 1 or 0 and other values as text', () => {
    expect(serializeSetting(true)).toBe('1');
    expect(serializeSetting(false)).toBe('0');
    expect(serializeSetting(3)).toBe('3');
    expect(serializeSetting('07:30')).toBe('07:30');
  });
});

import { t } from './index';

describe('t', () => {
  it('returns the Hebrew tab titles', () => {
    expect(t('tabs.today')).toBe('היום');
    expect(t('tabs.calendar')).toBe('יומן');
    expect(t('tabs.me')).toBe('אני');
  });
});

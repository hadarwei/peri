import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { getDb } from '../../src/db';
import { countDayLogs, upsertDayLog } from '../../src/db/repos';
import { toLocalDateString } from '../../src/core/dates';
import { t } from '../../src/i18n';
import { colors, MIN_TOUCH, radii, type } from '../../src/theme';

export default function TodayScreen() {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState(false);

  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const n = await countDayLogs(await getDb());
        if (!cancelled) setCount(n);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const addTestLog = async () => {
    try {
      const mood = 1 + Math.floor(Math.random() * 5);
      await upsertDayLog(await getDb(), toLocalDateString(new Date()), { mood });
      setReload((n) => n + 1);
    } catch {
      setError(true);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        backgroundColor: colors.ground,
      }}
    >
      <Text style={[type.title, { color: colors.ink }]}>{t('tabs.today')}</Text>
      {/* Dev-only smoke test of persistence (removed in a later stage). */}
      {__DEV__ && (
        <>
          <Text style={[type.body, { color: colors.muted }]}>
            {error ? t('dev.dbError') : `${t('dev.logCount')}: ${count ?? t('dev.loading')}`}
          </Text>
          <Pressable
            onPress={addTestLog}
            style={{
              minHeight: MIN_TOUCH,
              paddingHorizontal: 20,
              justifyContent: 'center',
              borderRadius: radii.card,
              backgroundColor: colors.primary,
            }}
          >
            <Text style={[type.label, { color: '#FFFFFF' }]}>{t('dev.addTestLog')}</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

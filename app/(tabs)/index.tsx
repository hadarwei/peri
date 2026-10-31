import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { CycleStrip } from '../../src/components/CycleStrip';
import { MeadowScene } from '../../src/components/MeadowScene';
import { toLocalDateString } from '../../src/core/dates';
import { getDb } from '../../src/db';
import { countDayLogs, upsertDayLog } from '../../src/db/repos';
import { t } from '../../src/i18n';
import { colors, MIN_TOUCH, radii, type } from '../../src/theme';

export default function TodayScreen() {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  // Re-count every time this tab comes into focus (and on first open).
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        try {
          const n = await countDayLogs(await getDb());
          if (alive) setCount(n);
        } catch (e) {
          if (alive) setError(String(e));
        }
      })();
      return () => {
        alive = false;
      };
    }, []),
  );

  const addTestLog = async () => {
    try {
      setError(null);
      const db = await getDb();
      const mood = 1 + Math.floor(Math.random() * 5);
      const log = await upsertDayLog(db, toLocalDateString(new Date()), { mood });
      setCount(await countDayLogs(db)); // update the number right away from the database
      setSaved(`${log.date} · ${new Date().toLocaleTimeString('he-IL')}`);
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.ground }}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <MeadowScene />
      <View style={{ padding: 16, gap: 16 }}>
        {/* Static sample data until stage 6 computes the real cycle day. */}
        <CycleStrip dayOfCycle={12} />
        {/* Dev-only smoke test of persistence (removed in a later stage). */}
        {__DEV__ && (
          <View style={{ alignItems: 'center', gap: 12 }}>
            <Text style={[type.body, { color: colors.muted }]}>
              {`${t('dev.logCount')}: ${count ?? t('dev.loading')}`}
            </Text>
            <Pressable
              onPress={addTestLog}
              style={({ pressed }) => ({
                minHeight: MIN_TOUCH,
                paddingHorizontal: 20,
                justifyContent: 'center',
                borderRadius: radii.card,
                backgroundColor: colors.primary,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text style={[type.label, { color: '#FFFFFF' }]}>{t('dev.addTestLog')}</Text>
            </Pressable>
            {saved && (
              <Text style={[type.caption, { color: colors.muted }]}>
                {`${t('dev.saved')}: ${saved}`}
              </Text>
            )}
            {error && (
              <Text style={[type.caption, { color: '#B00020' }]}>
                {`${t('dev.dbError')}: ${error}`}
              </Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

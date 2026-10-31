import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

import { useDuck } from '../../src/duck/DuckProvider';
import { CycleStrip } from '../../src/components/CycleStrip';
import { DidYouKnowCard } from '../../src/components/today/DidYouKnowCard';
import { MoodRow } from '../../src/components/today/MoodRow';
import { PredictionCard } from '../../src/components/today/PredictionCard';
import { StreakCard } from '../../src/components/today/StreakCard';
import { FACTS } from '../../src/content/facts';
import { t } from '../../src/i18n';
import { useDuckWalker } from '../../src/components/DuckWalker';
import { MEADOW_HEIGHT, MeadowScene } from '../../src/components/MeadowScene';
import { DUCK_STATES, type DuckState } from '../../src/core/duckState';
import { addDays, parseLocalDate, toLocalDateString } from '../../src/core/dates';
import { getDb } from '../../src/db';
import { saveCheckIn } from '../../src/db/saveCheckIn';
import { countDayLogs, startCycle, upsertDayLog } from '../../src/db/repos';
import { colors, MIN_TOUCH, radii, type } from '../../src/theme';

export default function TodayScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { celebrate, sayHello } = useDuck();
  const [duckState, setDuckState] = useState<DuckState>('normal'); // dev picker for now
  const duckLayers = useDuckWalker(width, MEADOW_HEIGHT, duckState);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  // A friendly cloud when the screen opens (after a short pause so the screen settles first).
  useEffect(() => {
    const timer = setTimeout(sayHello, 600);
    return () => clearTimeout(timer);
  }, [sayHello]);

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

  const quickMood = async (mood: number) => {
    try {
      await saveCheckIn(await getDb(), toLocalDateString(new Date()), { mood }, true);
      setCount(await countDayLogs(await getDb()));
    } catch (e) {
      setError(String(e));
    }
    celebrate();
  };

  const seedCycle = async () => {
    try {
      const db = await getDb();
      const start = toLocalDateString(addDays(parseLocalDate(toLocalDateString(new Date())), -26));
      await startCycle(db, start, 'logged');
      setSaved(`cycle ${start}`);
    } catch (e) {
      setError(String(e));
    }
  };

  const resetCycles = async () => {
    try {
      await (await getDb()).runAsync('DELETE FROM cycles');
      setSaved('cycles deleted');
    } catch (e) {
      setError(String(e));
    }
  };

  const addTestLog = async () => {
    try {
      setError(null);
      const db = await getDb();
      const mood = 1 + Math.floor(Math.random() * 5);
      const log = await upsertDayLog(db, toLocalDateString(new Date()), { mood });
      setCount(await countDayLogs(db)); // update the number right away from the database
      celebrate(); // saving a log makes the duck dance
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
      <MeadowScene behind={duckLayers.behind} front={duckLayers.front} />
      <View style={{ padding: 16, gap: 16 }}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/checkin')}
          style={{
            minHeight: MIN_TOUCH + 8,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: radii.card,
            backgroundColor: colors.primary,
          }}
        >
          <Text style={[type.heading, { color: '#FFFFFF' }]}>{t('checkin.open')}</Text>
        </Pressable>
        {/* Static sample data until stage 6 computes the real cycle (day 12 of 28). */}
        <CycleStrip dayOfCycle={12} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <PredictionCard
            title={t('predictions.nextPeriod')}
            daysExpected={16}
            daysFrom={14}
            daysTo={18}
            accent={colors.period}
          />
          <PredictionCard
            title={t('predictions.ovulation')}
            daysExpected={2}
            daysFrom={1}
            daysTo={4}
            accent={colors.fertile}
          />
        </View>
        {/* A tap on a face saves today's mood (and counts as a check-in) and the duck celebrates. */}
        <MoodRow onPick={quickMood} />
        <StreakCard days={5} />
        <DidYouKnowCard fact={FACTS[0]} />
        {/* Dev-only picker for the duck's look (the real state comes from the cycle in stage 6). */}
        {__DEV__ && (
          <View
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}
          >
            {DUCK_STATES.map((s) => (
              <Pressable
                key={s}
                onPress={() => setDuckState(s)}
                style={{
                  minHeight: MIN_TOUCH,
                  paddingHorizontal: 14,
                  justifyContent: 'center',
                  borderRadius: radii.pill,
                  backgroundColor: s === duckState ? colors.primary : colors.card,
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                }}
              >
                <Text style={[type.label, { color: s === duckState ? '#FFFFFF' : colors.ink }]}>
                  {t(`duckState.${s}`)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
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
            <Pressable
              onPress={seedCycle}
              style={{ minHeight: MIN_TOUCH, justifyContent: 'center' }}
            >
              <Text style={[type.label, { color: colors.primary }]}>{t('dev.seedCycle')}</Text>
            </Pressable>
            <Pressable
              onPress={resetCycles}
              style={{ minHeight: MIN_TOUCH, justifyContent: 'center' }}
            >
              <Text style={[type.label, { color: colors.muted }]}>{t('dev.resetCycles')}</Text>
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

import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

import { useDuck } from '../../src/duck/DuckProvider';
import { Card } from '../../src/components/Card';
import { CycleStrip } from '../../src/components/CycleStrip';
import { DidYouKnowCard } from '../../src/components/today/DidYouKnowCard';
import { MoodRow } from '../../src/components/today/MoodRow';
import { PredictionCard } from '../../src/components/today/PredictionCard';
import { TemperatureChart } from '../../src/components/me/TemperatureChart';
import { StreakCard } from '../../src/components/today/StreakCard';
import { FACTS } from '../../src/content/facts';
import { t } from '../../src/i18n';
import { useDuckWalker } from '../../src/components/DuckWalker';
import { MEADOW_HEIGHT, MeadowScene } from '../../src/components/MeadowScene';
import { DUCK_STATES, type DuckState } from '../../src/core/duckState';
import { addDays, parseLocalDate, toLocalDateString } from '../../src/core/dates';
import { calculateStreak } from '../../src/core/streak';
import { DEFAULT_RANGE_DAYS, todayCycle, type TodayCycle } from '../../src/core/todayCycle';
import { getDb } from '../../src/db';
import { notifyDataChanged, useDataVersion } from '../../src/db/dataVersion';
import { saveCheckIn } from '../../src/db/saveCheckIn';
import { loadTrackingSettings } from '../../src/settings/store';
import {
  countCycles,
  countDayLogs,
  getCheckinDates,
  getLatestCycle,
  recordCheckin,
  startCycle,
  upsertDayLog,
} from '../../src/db/repos';
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
  const [streak, setStreak] = useState(0);
  const [cycle, setCycle] = useState<TodayCycle | null>(null); // null: no cycle recorded yet
  const [showTemperature, setShowTemperature] = useState(false);
  const dataVersion = useDataVersion();

  // A friendly cloud when the screen opens (after a short pause so the screen settles first).
  useEffect(() => {
    const timer = setTimeout(sayHello, 600);
    return () => clearTimeout(timer);
  }, [sayHello]);

  // Opening the Today screen counts as a check-in (it keeps the streak alive).
  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          await recordCheckin(await getDb(), toLocalDateString(new Date()));
          notifyDataChanged();
        } catch {
          // Not being able to record a visit must never get in the user's way.
        }
      })();
    }, []),
  );

  // Re-read what this screen shows whenever something was saved (also after the check-in closes).
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const db = await getDb();
        const [n, dates, latest, tracking] = await Promise.all([
          countDayLogs(db),
          getCheckinDates(db),
          getLatestCycle(db),
          loadTrackingSettings(db),
        ]);
        if (!alive) return;
        setCount(n);
        setShowTemperature(tracking.tempEnabled);
        setCycle(latest ? todayCycle(latest.startDate, toLocalDateString(new Date())) : null);
        setStreak(calculateStreak(dates, toLocalDateString(new Date())));
      } catch (e) {
        if (alive) setError(String(e));
      }
    })();
    return () => {
      alive = false;
    };
  }, [dataVersion]);

  const quickMood = async (mood: number) => {
    try {
      await saveCheckIn(await getDb(), toLocalDateString(new Date()), {
        patch: { mood },
        hasContent: true,
        countsForStreak: true,
      });
      notifyDataChanged();
    } catch (e) {
      setError(String(e));
    }
    celebrate();
  };

  const seedCycle = async () => {
    try {
      const db = await getDb();
      if ((await countCycles(db)) > 0) {
        setSaved(t('dev.seedExists')); // never pile test data on top of existing cycles
        return;
      }
      const today = parseLocalDate(toLocalDateString(new Date()));
      const day = (ago: number) => toLocalDateString(addDays(today, -ago));
      // Three cycles of 28 days; the latest started 26 days ago (so the period is expected soon).
      for (const ago of [82, 54, 26]) await startCycle(db, day(ago), 'logged');
      // A handful of logged days so the calendar shows dots.
      for (const ago of [80, 78, 70, 55, 52, 40, 30, 27, 25, 24, 20, 10, 5, 2, 1]) {
        await upsertDayLog(db, day(ago), { mood: 3 + (ago % 3) });
      }
      setSaved(t('dev.seedCreated'));
      notifyDataChanged();
    } catch (e) {
      setError(String(e));
    }
  };

  const resetCycles = () => {
    // Wipes everything: ask first, so it is never done by accident.
    Alert.alert(t('dev.resetCycles'), t('dev.resetConfirm'), [
      { text: t('editCycle.cancel'), style: 'cancel' },
      {
        text: t('editCycle.confirmDelete'),
        style: 'destructive',
        onPress: async () => {
          try {
            const db = await getDb();
            await db.runAsync('DELETE FROM cycles');
            await db.runAsync('DELETE FROM day_logs');
            setSaved(t('dev.resetDone'));
            notifyDataChanged();
          } catch (e) {
            setError(String(e));
          }
        },
      },
    ]);
  };

  const addTestLog = async () => {
    try {
      setError(null);
      const db = await getDb();
      const mood = 1 + Math.floor(Math.random() * 5);
      const log = await upsertDayLog(db, toLocalDateString(new Date()), { mood });
      notifyDataChanged();
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
        {cycle ? (
          <>
            {/* Stand-in prediction (28 days from the last start) until stage 6. */}
            <CycleStrip dayOfCycle={cycle.dayOfCycle} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <PredictionCard
                title={t('predictions.nextPeriod')}
                daysExpected={cycle.daysToPeriod}
                passedMeans="late"
                rangeDays={DEFAULT_RANGE_DAYS}
                accent={colors.period}
              />
              <PredictionCard
                title={t('predictions.ovulation')}
                daysExpected={cycle.daysToOvulation}
                passedMeans="passed"
                rangeDays={DEFAULT_RANGE_DAYS}
                accent={colors.fertile}
              />
            </View>
          </>
        ) : (
          <Card>
            <Text style={[type.heading, { color: colors.ink }]}>{t('today.noCycle')}</Text>
            <Text style={[type.body, { color: colors.muted }]}>{t('today.noCycleBody')}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/add-cycle')}
              style={{
                minHeight: MIN_TOUCH,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: radii.pill,
                backgroundColor: colors.primary,
              }}
            >
              <Text style={[type.label, { color: '#FFFFFF' }]}>{t('addCycle.open')}</Text>
            </Pressable>
          </Card>
        )}
        {/* A tap on a face saves today's mood (and counts as a check-in) and the duck celebrates. */}
        <MoodRow onPick={quickMood} />
        <StreakCard days={streak} />
        {/* The month's temperature, only for people who track it. */}
        {showTemperature && <TemperatureChart />}
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
              <Text style={[type.label, { color: '#B00020' }]}>{t('dev.resetCycles')}</Text>
            </Pressable>
            {saved && (
              <Text style={[type.label, { color: colors.ink, textAlign: 'center' }]}>{saved}</Text>
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

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Chip } from '../src/components/checkin/Chip';
import { EMPTY_DRAFT, toggleSymptom, type CheckInDraft } from '../src/components/checkin/draft';
import { MoreDetails } from '../src/components/checkin/MoreDetails';
import { Card } from '../src/components/Card';
import { MoodRow } from '../src/components/today/MoodRow';
import { addDays, parseLocalDate, toLocalDateString } from '../src/core/dates';
import { getTodayCards, type TodayCard } from '../src/core/todayCards';
import { topSymptoms } from '../src/core/topSymptoms';
import { getDb } from '../src/db';
import { countCycles, getDayLogsInRange, getFlag } from '../src/db/repos';
import { t } from '../src/i18n';
import { he } from '../src/i18n/he';
import { colors, MIN_TOUCH, radii, spacing, type } from '../src/theme';

interface Loaded {
  cards: TodayCard[];
  symptomChips: string[];
}

/** Loads what the check-in needs from the on-device database. */
async function load(today: string): Promise<Loaded> {
  const db = await getDb();
  const [cycles, temperatureEnabled, temperatureDaily, testsEnabled, pregnancyMode, logs] =
    await Promise.all([
      countCycles(db),
      getFlag(db, 'temperature_enabled'),
      getFlag(db, 'temperature_daily'),
      getFlag(db, 'tests_enabled'),
      getFlag(db, 'pregnancy_mode'),
      getDayLogsInRange(db, toLocalDateString(addDays(parseLocalDate(today), -90)), today),
    ]);
  const cards = getTodayCards({
    today,
    hasHistory: cycles > 0,
    // Predictions arrive in stage 6; until then there is no expected period or fertile window.
    predictedPeriodStart: null,
    periodStartMarked: false,
    fertileWindow: null,
    temperatureEnabled,
    temperatureDaily,
    testsEnabled,
    pregnancyMode,
  });
  return { cards, symptomChips: topSymptoms(logs, 3, he.checkin.defaultSymptoms) };
}

export default function CheckInScreen() {
  const router = useRouter();
  const [today] = useState(() => toLocalDateString(new Date()));
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [draft, setDraft] = useState<CheckInDraft>(EMPTY_DRAFT);
  const patch = (p: Partial<CheckInDraft>) => setDraft((d) => ({ ...d, ...p }));

  useEffect(() => {
    let alive = true;
    load(today).then((result) => {
      if (alive) setLoaded(result);
    });
    return () => {
      alive = false;
    };
  }, [today]);

  const dateTitle = parseLocalDate(today).toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const renderCard = (card: TodayCard) => {
    switch (card) {
      case 'mood':
        return <MoodRow key={card} value={draft.mood} onPick={(mood) => patch({ mood })} />;
      case 'sameAsYesterday':
        return (
          <Pressable
            key={card}
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            style={{
              minHeight: MIN_TOUCH,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: radii.card,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              backgroundColor: colors.card,
              opacity: 0.5, // wired up in the next step
            }}
          >
            <Text style={[type.label, { color: colors.ink }]}>{t('checkin.sameAsYesterday')}</Text>
          </Pressable>
        );
      case 'symptoms':
        return (
          <Card key={card}>
            <Text style={[type.heading, { color: colors.ink }]}>{t('checkin.symptoms')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {loaded?.symptomChips.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  selected={draft.symptoms.includes(s)}
                  onPress={() => patch({ symptoms: toggleSymptom(draft.symptoms, s) })}
                />
              ))}
            </View>
          </Card>
        );
      case 'moreDetails':
        return <MoreDetails key={card} draft={draft} onChange={patch} />;
      default:
        return null; // period start, temperature and LH test cards arrive in later steps
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <View style={{ gap: 2 }}>
          <Text style={[type.title, { color: colors.ink }]}>{t('checkin.title')}</Text>
          <Text style={[type.body, { color: colors.muted }]}>{dateTitle}</Text>
        </View>
        {loaded?.cards.map(renderCard)}
      </ScrollView>
      <View
        style={{
          padding: spacing.lg,
          gap: spacing.sm,
          borderTopWidth: 1,
          borderTopColor: colors.cardBorder,
          backgroundColor: colors.card,
        }}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={{
            minHeight: MIN_TOUCH,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: radii.card,
            backgroundColor: colors.primary,
          }}
        >
          <Text style={[type.label, { color: '#FFFFFF' }]}>{t('checkin.done')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={{ minHeight: MIN_TOUCH, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={[type.label, { color: colors.muted }]}>{t('checkin.skipToday')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

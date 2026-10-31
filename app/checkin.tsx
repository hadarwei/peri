import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Chip } from '../src/components/checkin/Chip';
import {
  EMPTY_DRAFT,
  draftFromLog,
  draftFromYesterday,
  isDraftEmpty,
  toggleSymptom,
  type CheckInDraft,
} from '../src/components/checkin/draft';
import { MoreDetails } from '../src/components/checkin/MoreDetails';
import { Card } from '../src/components/Card';
import { MoodRow } from '../src/components/today/MoodRow';
import { addDays, parseLocalDate, toLocalDateString } from '../src/core/dates';
import { getTodayCards, type TodayCard } from '../src/core/todayCards';
import { topSymptoms } from '../src/core/topSymptoms';
import { getDb } from '../src/db';
import { saveCheckIn } from '../src/db/saveCheckIn';
import { useDuck } from '../src/duck/DuckProvider';
import { countCycles, getDayLog, getDayLogsInRange, getFlag, type DayLog } from '../src/db/repos';
import { t } from '../src/i18n';
import { he } from '../src/i18n/he';
import { colors, MIN_TOUCH, radii, spacing, type } from '../src/theme';

interface Loaded {
  cards: TodayCard[];
  symptomChips: string[];
  todayLog: DayLog | null;
  yesterdayLog: DayLog | null;
}

/** Loads what the check-in needs from the on-device database. */
async function load(today: string): Promise<Loaded> {
  const db = await getDb();
  const yesterday = toLocalDateString(addDays(parseLocalDate(today), -1));
  const [
    cycles,
    temperatureEnabled,
    temperatureDaily,
    testsEnabled,
    pregnancyMode,
    logs,
    todayLog,
    yesterdayLog,
  ] = await Promise.all([
    countCycles(db),
    getFlag(db, 'temperature_enabled'),
    getFlag(db, 'temperature_daily'),
    getFlag(db, 'tests_enabled'),
    getFlag(db, 'pregnancy_mode'),
    getDayLogsInRange(db, toLocalDateString(addDays(parseLocalDate(today), -90)), today),
    getDayLog(db, today),
    getDayLog(db, yesterday),
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
  return {
    cards,
    symptomChips: topSymptoms(logs, 3, he.checkin.defaultSymptoms),
    todayLog,
    yesterdayLog,
  };
}

export default function CheckInScreen() {
  const router = useRouter();
  const { celebrate } = useDuck();
  const [today] = useState(() => toLocalDateString(new Date()));
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [draft, setDraft] = useState<CheckInDraft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const patch = (p: Partial<CheckInDraft>) => setDraft((d) => ({ ...d, ...p }));

  useEffect(() => {
    let alive = true;
    load(today).then((result) => {
      if (!alive) return;
      setLoaded(result);
      if (result.todayLog) setDraft(draftFromLog(result.todayLog)); // reopening shows what was saved
    });
    return () => {
      alive = false;
    };
  }, [today]);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    setFailed(false);
    try {
      await saveCheckIn(
        await getDb(),
        today,
        {
          mood: draft.mood,
          symptoms: draft.symptoms,
          flow: draft.flow,
          pain: draft.pain,
          energy: draft.energy,
          note: draft.note,
        },
        !isDraftEmpty(draft),
      );
      celebrate();
      router.back();
    } catch {
      setFailed(true);
      setSaving(false);
    }
  };

  const dateTitle = parseLocalDate(today).toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const renderCard = (card: TodayCard) => {
    switch (card) {
      case 'mood':
        return <MoodRow key={card} value={draft.mood} onPick={(mood) => patch({ mood })} />;
      case 'sameAsYesterday': {
        const yesterday = loaded?.yesterdayLog ?? null;
        return (
          <Pressable
            key={card}
            accessibilityRole="button"
            accessibilityState={{ disabled: !yesterday }}
            disabled={!yesterday}
            onPress={() => yesterday && setDraft(draftFromYesterday(yesterday))}
            style={{
              minHeight: MIN_TOUCH,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: radii.card,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              backgroundColor: colors.card,
              opacity: yesterday ? 1 : 0.5,
            }}
          >
            <Text style={[type.label, { color: colors.ink }]}>{t('checkin.sameAsYesterday')}</Text>
          </Pressable>
        );
      }
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
        {failed && (
          <Text style={[type.caption, { color: '#B00020', textAlign: 'center' }]}>
            {t('checkin.saveFailed')}
          </Text>
        )}
        <Pressable
          accessibilityRole="button"
          disabled={saving}
          onPress={save}
          style={{
            minHeight: MIN_TOUCH,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: radii.card,
            backgroundColor: colors.primary,
            opacity: saving ? 0.6 : 1,
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

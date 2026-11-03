import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { addDays, parseLocalDate, toLocalDateString } from '../src/core/dates';
import { checkImportDate } from '../src/core/importCycle';
import { getDb } from '../src/db';
import { notifyDataChanged } from '../src/db/dataVersion';
import { setPeriodDays } from '../src/db/periodDays';
import { getCycles, startCycle, updateCycleStart } from '../src/db/repos';
import { Chip } from '../src/components/checkin/Chip';
import { t } from '../src/i18n';
import { he } from '../src/i18n/he';
import { colors, MIN_TOUCH, radii, spacing, type } from '../src/theme';

type Status = 'idle' | 'future' | 'exists' | 'saved' | 'failed';

/** Adds a previous cycle: only its first day is needed. */
export default function AddCycleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; date?: string; periodDays?: string }>();
  const editId = params.id ? Number(params.id) : null; // set when editing an existing cycle
  const today = toLocalDateString(new Date());
  // Start a month back: the most common case is "my last period".
  const [date, setDate] = useState(
    () => params.date ?? toLocalDateString(addDays(parseLocalDate(today), -28)),
  );
  const [status, setStatus] = useState<Status>('idle');
  // Optional details: how long the bleeding lasted, and how heavy it usually was.
  const [periodDays, setPeriodDaysState] = useState<number | null>(
    params.periodDays ? Number(params.periodDays) : null,
  );
  const [flow, setFlow] = useState<1 | 2 | 3>(2);

  const save = async () => {
    try {
      const db = await getDb();
      const cycles = await getCycles(db);
      // When editing, the cycle's own current start date does not count as taken.
      const starts = cycles.filter((c) => c.id !== editId).map((c) => c.startDate);
      const check = checkImportDate(date, today, starts);
      if (check !== 'ok') {
        setStatus(check);
        return;
      }
      if (editId !== null) {
        await updateCycleStart(db, editId, date);
        if (periodDays !== null) await setPeriodDays(db, date, periodDays, flow);
        notifyDataChanged();
        router.back();
        return;
      }
      await startCycle(db, date, 'imported');
      if (periodDays !== null) await setPeriodDays(db, date, periodDays, flow);
      notifyDataChanged();
      setPeriodDaysState(null);
      setStatus('saved');
    } catch {
      setStatus('failed');
    }
  };

  const message: Record<Exclude<Status, 'idle'>, string> = {
    future: t('addCycle.future'),
    exists: t('addCycle.exists'),
    saved: t('addCycle.saved'),
    failed: t('addCycle.failed'),
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.ground }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
    >
      <Text style={[type.title, { color: colors.ink }]}>
        {editId !== null ? t('editCycle.title') : t('addCycle.title')}
      </Text>
      <Text style={[type.body, { color: colors.muted }]}>
        {editId !== null ? t('editCycle.subtitle') : t('addCycle.subtitle')}
      </Text>

      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: radii.card,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          padding: spacing.sm,
          alignItems: 'center',
        }}
      >
        <DateTimePicker
          value={parseLocalDate(date)}
          mode="date"
          display="inline"
          locale="he-IL"
          maximumDate={parseLocalDate(today)}
          onChange={(_, selected) => {
            if (selected) {
              setDate(toLocalDateString(selected));
              setStatus('idle');
            }
          }}
        />
      </View>

      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: radii.card,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          padding: spacing.lg,
          gap: spacing.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm }}>
          <Text style={[type.heading, { color: colors.ink }]}>{t('addCycle.periodLength')}</Text>
          <Text style={[type.caption, { color: colors.muted }]}>{t('addCycle.optional')}</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {[2, 3, 4, 5, 6, 7, 8].map((n) => (
            <Chip
              key={n}
              label={String(n)}
              selected={periodDays === n}
              onPress={() => setPeriodDaysState(periodDays === n ? null : n)}
            />
          ))}
        </View>
        {periodDays !== null && (
          <>
            <Text style={[type.label, { color: colors.muted }]}>{t('addCycle.flowTitle')}</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {he.periodStart.levels.map((label, i) => (
                <Chip
                  key={label}
                  label={label}
                  selected={flow === i + 1}
                  onPress={() => setFlow((i + 1) as 1 | 2 | 3)}
                />
              ))}
            </View>
          </>
        )}
      </View>

      {status !== 'idle' && (
        <Text
          style={[
            type.label,
            { color: status === 'saved' ? colors.ink : '#B00020', textAlign: 'center' },
          ]}
        >
          {message[status]}
        </Text>
      )}

      {status === 'saved' ? (
        <View style={{ gap: spacing.sm }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setStatus('idle')}
            style={{
              minHeight: MIN_TOUCH,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: radii.card,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.cardBorder,
            }}
          >
            <Text style={[type.label, { color: colors.ink }]}>{t('addCycle.another')}</Text>
          </Pressable>
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
            <Text style={[type.label, { color: '#FFFFFF' }]}>{t('addCycle.finish')}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ gap: spacing.sm }}>
          <Pressable
            accessibilityRole="button"
            onPress={save}
            style={{
              minHeight: MIN_TOUCH,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: radii.card,
              backgroundColor: colors.primary,
            }}
          >
            <Text style={[type.label, { color: '#FFFFFF' }]}>{t('addCycle.save')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={{ minHeight: MIN_TOUCH, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={[type.label, { color: colors.muted }]}>
              {editId !== null ? t('editCycle.cancel') : t('addCycle.dontRemember')}
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

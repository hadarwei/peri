import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { addDays, parseLocalDate, toLocalDateString } from '../src/core/dates';
import { checkImportDate } from '../src/core/importCycle';
import { getDb } from '../src/db';
import { notifyDataChanged } from '../src/db/dataVersion';
import { getCycles, startCycle } from '../src/db/repos';
import { t } from '../src/i18n';
import { colors, MIN_TOUCH, radii, spacing, type } from '../src/theme';

type Status = 'idle' | 'future' | 'exists' | 'saved' | 'failed';

/** Adds a previous cycle: only its first day is needed. */
export default function AddCycleScreen() {
  const router = useRouter();
  const today = toLocalDateString(new Date());
  // Start a month back: the most common case is "my last period".
  const [date, setDate] = useState(() => toLocalDateString(addDays(parseLocalDate(today), -28)));
  const [status, setStatus] = useState<Status>('idle');

  const save = async () => {
    try {
      const db = await getDb();
      const starts = (await getCycles(db)).map((c) => c.startDate);
      const check = checkImportDate(date, today, starts);
      if (check !== 'ok') {
        setStatus(check);
        return;
      }
      await startCycle(db, date, 'imported');
      notifyDataChanged();
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
      <Text style={[type.title, { color: colors.ink }]}>{t('addCycle.title')}</Text>
      <Text style={[type.body, { color: colors.muted }]}>{t('addCycle.subtitle')}</Text>

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
            <Text style={[type.label, { color: colors.muted }]}>{t('addCycle.dontRemember')}</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

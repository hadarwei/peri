import { Text } from 'react-native';

import { t, tf } from '../../i18n';
import { colors, type } from '../../theme';
import { Card } from '../Card';

interface Props {
  title: string;
  /** Days from today (zero or negative: today, late or already passed). */
  daysExpected: number;
  /** Shown instead of "late" when the day has passed, e.g. ovulation. */
  passedMeans: 'late' | 'passed';
  rangeDays: number;
  accent: string;
}

/** A prediction with its range, e.g. "בעוד 16 ימים, טווח: 12-20 ימים". */
export function PredictionCard({ title, daysExpected, passedMeans, rangeDays, accent }: Props) {
  const headline =
    daysExpected > 0
      ? tf('predictions.inDays', { days: daysExpected })
      : daysExpected === 0
        ? t('predictions.today')
        : passedMeans === 'late'
          ? tf('predictions.late', { days: -daysExpected })
          : t('predictions.passed');
  return (
    <Card style={{ flex: 1, borderTopWidth: 4, borderTopColor: accent }}>
      <Text style={[type.label, { color: colors.muted }]}>{title}</Text>
      <Text style={[type.heading, { color: colors.ink }]}>{headline}</Text>
      {daysExpected > 0 && (
        <Text style={[type.caption, { color: colors.muted }]}>
          {tf('predictions.range', {
            from: Math.max(1, daysExpected - rangeDays),
            to: daysExpected + rangeDays,
          })}
        </Text>
      )}
    </Card>
  );
}

import { Text } from 'react-native';

import { tf } from '../../i18n';
import { colors, type } from '../../theme';
import { Card } from '../Card';

interface Props {
  title: string;
  daysFrom: number;
  daysTo: number;
  daysExpected: number;
  accent: string;
}

/** A prediction with its range, e.g. "בעוד 16 ימים, טווח: 14-18 ימים". */
export function PredictionCard({ title, daysFrom, daysTo, daysExpected, accent }: Props) {
  return (
    <Card style={{ flex: 1, borderTopWidth: 4, borderTopColor: accent }}>
      <Text style={[type.label, { color: colors.muted }]}>{title}</Text>
      <Text style={[type.heading, { color: colors.ink }]}>
        {tf('predictions.inDays', { days: daysExpected })}
      </Text>
      <Text style={[type.caption, { color: colors.muted }]}>
        {tf('predictions.range', { from: daysFrom, to: daysTo })}
      </Text>
    </Card>
  );
}

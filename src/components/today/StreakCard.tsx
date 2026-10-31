import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { t, tf } from '../../i18n';
import { colors, spacing, type } from '../../theme';
import { Card } from '../Card';

/** Streak: any check-in counts, even opening the app. Static number until stage 3. */
export function StreakCard({ days }: { days: number }) {
  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <Ionicons name="flame" size={32} color="#FF8A3D" />
      <View style={{ flex: 1 }}>
        <Text style={[type.heading, { color: colors.ink }]}>
          {days === 1 ? t('streak.one') : tf('streak.days', { days })}
        </Text>
        <Text style={[type.caption, { color: colors.muted }]}>{t('streak.note')}</Text>
      </View>
    </Card>
  );
}

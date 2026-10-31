import { Pressable, Text, View } from 'react-native';

import { t } from '../../i18n';
import { he } from '../../i18n/he';
import { colors, MIN_TOUCH, radii, spacing, type } from '../../theme';
import { Card } from '../Card';
import { Chip } from './Chip';

interface Props {
  /** The user said yes: the cycle was created, now we ask how heavy the bleeding is. */
  started: boolean;
  flow: number | null; // 1-3 once chosen
  onYes: () => void;
  onNotYet: () => void;
  onFlow: (flow: number) => void;
}

/** "Did your period start?" with a follow-up flow chooser after yes. */
export function PeriodStartCard({ started, flow, onYes, onNotYet, onFlow }: Props) {
  return (
    <Card style={{ borderColor: colors.period, borderWidth: 2 }}>
      {!started ? (
        <>
          <Text style={[type.heading, { color: colors.ink }]}>{t('periodStart.title')}</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Pressable
              accessibilityRole="button"
              onPress={onYes}
              style={{
                flex: 1,
                minHeight: MIN_TOUCH,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: radii.pill,
                backgroundColor: colors.period,
              }}
            >
              <Text style={[type.label, { color: colors.ink }]}>{t('periodStart.yes')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onNotYet}
              style={{
                flex: 1,
                minHeight: MIN_TOUCH,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: radii.pill,
                borderWidth: 1,
                borderColor: colors.cardBorder,
              }}
            >
              <Text style={[type.label, { color: colors.ink }]}>{t('periodStart.notYet')}</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <Text style={[type.heading, { color: colors.ink }]}>{t('periodStart.started')}</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {he.periodStart.levels.map((label, i) => (
              <Chip
                key={label}
                label={label}
                selected={flow === i + 1}
                onPress={() => onFlow(i + 1)}
              />
            ))}
          </View>
        </>
      )}
    </Card>
  );
}

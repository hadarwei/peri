import { Image, Text, View } from 'react-native';

import { duckFrames } from '../assets/duckFrames';
import { phaseForDay, type Phase } from '../core/phase';
import { t, tf } from '../i18n';
import { colors, radii, spacing, type } from '../theme';

interface Props {
  dayOfCycle: number; // 1-based
  cycleLength?: number;
}

const PHASE_COLOR: Record<Phase, string> = {
  period: colors.period,
  follicular: colors.follicular,
  fertile: colors.fertile,
  luteal: colors.luteal,
};

/** Card with one rounded segment per cycle day, colored by phase, today marked by a duck head. */
export function CycleStrip({ dayOfCycle, cycleLength = 28 }: Props) {
  const phase = phaseForDay(dayOfCycle);
  const days = Array.from({ length: cycleLength }, (_, i) => i + 1);

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderColor: colors.cardBorder,
        borderWidth: 1,
        borderRadius: radii.card,
        padding: spacing.lg,
        gap: spacing.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={[type.heading, { color: colors.ink }]}>
          {tf('today.dayOfCycle', { day: dayOfCycle, length: cycleLength })}
        </Text>
        <View
          style={{
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radii.pill,
            backgroundColor: PHASE_COLOR[phase],
          }}
        >
          <Text style={[type.label, { color: colors.ink }]}>{t(`phase.${phase}`)}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 2 }}>
        {days.map((day) => (
          <View key={day} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
            <View style={{ height: 18, justifyContent: 'flex-end' }}>
              {day === dayOfCycle && (
                <Image
                  source={duckFrames.stand}
                  style={{ width: 18, height: 18 }}
                  resizeMode="contain"
                />
              )}
            </View>
            <View
              style={{
                alignSelf: 'stretch',
                height: 22,
                borderRadius: radii.sm / 2,
                backgroundColor: PHASE_COLOR[phaseForDay(day)],
                borderWidth: day === dayOfCycle ? 2 : 0,
                borderColor: colors.ink,
              }}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

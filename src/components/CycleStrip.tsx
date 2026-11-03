import { Image, Text, View } from 'react-native';

import { duckFrames } from '../assets/duckFrames';
import { phaseForCycleDay } from '../core/calendar';
import { t, tf } from '../i18n';
import { colors, radii, spacing, type } from '../theme';
import { REAL_PHASE_COLOR, predictedPhaseColor } from '../theme/calendarColors';

interface Props {
  /** Today's day in the cycle, 1-based. Past 28 the strip stays full and the title says the day. */
  dayOfCycle: number;
  cycleLength?: number;
}

/**
 * One rounded segment per day of the cycle. Days up to today are vivid (they happened), days after
 * today are gray (they are predictions). Today is outlined and carries the duck's head.
 */
export function CycleStrip({ dayOfCycle, cycleLength = 28 }: Props) {
  const phase = phaseForCycleDay(dayOfCycle, cycleLength);
  const days = Array.from({ length: cycleLength }, (_, i) => i + 1);
  const markerDay = Math.min(dayOfCycle, cycleLength);

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
          {dayOfCycle <= cycleLength
            ? tf('today.dayOfCycle', { day: dayOfCycle, length: cycleLength })
            : tf('today.dayLate', { day: dayOfCycle })}
        </Text>
        <View
          style={{
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radii.pill,
            backgroundColor: REAL_PHASE_COLOR[phase],
          }}
        >
          <Text style={[type.label, { color: colors.ink }]}>{t(`phase.${phase}`)}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 2 }}>
        {days.map((day) => {
          const dayPhase = phaseForCycleDay(day, cycleLength);
          const future = day > dayOfCycle;
          return (
            <View key={day} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
              <View style={{ height: 18, justifyContent: 'flex-end' }}>
                {day === markerDay && (
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
                  backgroundColor: future
                    ? predictedPhaseColor(dayPhase)
                    : REAL_PHASE_COLOR[dayPhase],
                  borderWidth: day === markerDay ? 2 : 0,
                  borderColor: colors.ink,
                }}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

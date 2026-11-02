import { Pressable, Text, View } from 'react-native';

import type { GridCell, CycleSpan } from '../../core/calendar';
import { dayInfo } from '../../core/calendar';
import { colors, spacing, type } from '../../theme';

const WEEKDAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']; // Sunday first

interface Props {
  weeks: GridCell[][];
  cycles: readonly CycleSpan[];
  today: string;
  /** Dates that have a saved day log (shown with a dot). */
  loggedDates: ReadonlySet<string>;
  selectedDate: string;
  onSelect: (date: string) => void;
}

/** Month grid: 7 columns, Sunday first (the layout is right to left, so Sunday is on the right). */
export function MonthGrid({ weeks, cycles, today, loggedDates, selectedDate, onSelect }: Props) {
  return (
    <View style={{ gap: spacing.xs }}>
      <View style={{ flexDirection: 'row' }}>
        {WEEKDAYS.map((d) => (
          <Text
            key={d}
            style={[type.caption, { flex: 1, textAlign: 'center', color: colors.muted }]}
          >
            {d}
          </Text>
        ))}
      </View>
      {weeks.map((week) => (
        <View key={week[0].date} style={{ flexDirection: 'row' }}>
          {week.map((cell) => {
            const info = dayInfo(cell.date, cycles, today);
            const isToday = cell.date === today;
            const predicted = info.predicted && !isToday;
            const selected = cell.date === selectedDate;
            return (
              <View key={cell.date} style={{ flex: 1, padding: 2 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={cell.date}
                  accessibilityState={{ selected }}
                  onPress={() => onSelect(cell.date)}
                  style={{
                    aspectRatio: 1,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: info.phase ? colors.tint[info.phase] : 'transparent',
                    opacity: cell.inMonth ? 1 : 0.35,
                    borderWidth: isToday || selected ? 2 : predicted ? 1.5 : 0,
                    borderColor: selected ? colors.ink : isToday ? colors.primary : colors.muted,
                    borderStyle: predicted && !isToday ? 'dashed' : 'solid',
                  }}
                >
                  <Text style={[type.label, { color: colors.ink }]}>
                    {Number(cell.date.slice(8))}
                  </Text>
                  {loggedDates.has(cell.date) && (
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 4,
                        width: 5,
                        height: 5,
                        borderRadius: 3,
                        backgroundColor: colors.primary,
                      }}
                    />
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Card } from '../../src/components/Card';
import { MonthGrid } from '../../src/components/calendar/MonthGrid';
import { monthGrid, shiftMonth, type CycleSpan, type GridCell } from '../../src/core/calendar';
import { toLocalDateString } from '../../src/core/dates';
import type { Phase } from '../../src/core/phase';
import { getDb } from '../../src/db';
import { useDataVersion } from '../../src/db/dataVersion';
import { getCycles, getDayLogsInRange } from '../../src/db/repos';
import { t } from '../../src/i18n';
import { colors, MIN_TOUCH, radii, spacing, type } from '../../src/theme';

const PHASES: Phase[] = ['period', 'follicular', 'fertile', 'luteal'];

function NavButton({
  icon,
  label,
  onPress,
}: {
  icon: 'chevron-forward' | 'chevron-back';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        width: MIN_TOUCH,
        height: MIN_TOUCH,
        borderRadius: radii.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
      }}
    >
      <Ionicons name={icon} size={22} color={colors.ink} />
    </Pressable>
  );
}

export default function CalendarScreen() {
  const [today] = useState(() => toLocalDateString(new Date()));
  const [ym, setYm] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [cycles, setCycles] = useState<CycleSpan[]>([]);
  const [logged, setLogged] = useState<ReadonlySet<string>>(new Set());
  const dataVersion = useDataVersion();

  const weeks: GridCell[][] = monthGrid(ym.year, ym.month);
  const first = weeks[0][0].date;
  const last = weeks[weeks.length - 1][6].date;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const db = await getDb();
        const [allCycles, logs] = await Promise.all([
          getCycles(db),
          getDayLogsInRange(db, first, last),
        ]);
        if (!alive) return;
        setCycles(allCycles.map((c) => ({ startDate: c.startDate, endDate: c.endDate })));
        setLogged(new Set(logs.map((l) => l.date)));
      } catch {
        // The grid simply shows no cycles or dots if the database cannot be read.
      }
    })();
    return () => {
      alive = false;
    };
  }, [first, last, dataVersion]);

  const title = new Date(ym.year, ym.month - 1, 1).toLocaleDateString('he-IL', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.ground }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
    >
      <Card>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          {/* In a right-to-left layout the first button sits on the right and goes back in time. */}
          <NavButton
            icon="chevron-forward"
            label={t('calendar.previousMonth')}
            onPress={() => setYm(shiftMonth(ym.year, ym.month, -1))}
          />
          <Text style={[type.heading, { color: colors.ink }]}>{title}</Text>
          <NavButton
            icon="chevron-back"
            label={t('calendar.nextMonth')}
            onPress={() => setYm(shiftMonth(ym.year, ym.month, 1))}
          />
        </View>
        <MonthGrid weeks={weeks} cycles={cycles} today={today} loggedDates={logged} />
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.md,
            justifyContent: 'center',
          }}
        >
          {PHASES.map((p) => (
            <View key={p} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <View
                style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: colors.tint[p] }}
              />
              <Text style={[type.caption, { color: colors.muted }]}>{t(`phase.${p}`)}</Text>
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}

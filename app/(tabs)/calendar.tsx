import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Card } from '../../src/components/Card';
import { DayDetails } from '../../src/components/calendar/DayDetails';
import { CycleHistory } from '../../src/components/calendar/CycleHistory';
import { MonthGrid, PREDICTED_DASH, PREDICTED_GRAY } from '../../src/components/calendar/MonthGrid';
import {
  dayInfo,
  monthGrid,
  shiftMonth,
  type CycleSpan,
  type GridCell,
} from '../../src/core/calendar';
import { toLocalDateString } from '../../src/core/dates';
import { summarizeCycle, type CycleSummary } from '../../src/core/history';
import type { Phase } from '../../src/core/phase';
import { getDb } from '../../src/db';
import { useDataVersion } from '../../src/db/dataVersion';
import { getCycles, getDayLog, getDayLogsInRange, type DayLog } from '../../src/db/repos';
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
  const router = useRouter();
  const [history, setHistory] = useState<CycleSummary[]>([]);
  const [selected, setSelected] = useState(today);
  const [selectedLog, setSelectedLog] = useState<DayLog | null>(null);

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
        setSelectedLog(await getDayLog(db, selected));
        const earliest = allCycles[0]?.startDate;
        const allLogs = earliest ? await getDayLogsInRange(db, earliest, today) : [];
        if (!alive) return;
        setHistory(
          allCycles
            .map((c) =>
              summarizeCycle({ startDate: c.startDate, endDate: c.endDate }, allLogs, today),
            )
            .reverse(), // newest first
        );
      } catch {
        // The grid simply shows no cycles or dots if the database cannot be read.
      }
    })();
    return () => {
      alive = false;
    };
  }, [first, last, selected, today, dataVersion]);

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
        <MonthGrid
          weeks={weeks}
          cycles={cycles}
          today={today}
          loggedDates={logged}
          selectedDate={selected}
          onSelect={setSelected}
        />
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 4,
                backgroundColor: PREDICTED_GRAY,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: PREDICTED_DASH,
              }}
            />
            <Text style={[type.caption, { color: colors.muted }]}>{t('calendar.predicted')}</Text>
          </View>
        </View>
      </Card>
      <DayDetails
        date={selected}
        today={today}
        info={dayInfo(selected, cycles, today)}
        log={selectedLog}
        onEdit={() => router.push({ pathname: '/checkin', params: { date: selected } })}
      />
      <CycleHistory cycles={history} />
    </ScrollView>
  );
}

import { Text, View } from 'react-native';

import type { CycleSummary } from '../../core/history';
import type { Phase } from '../../core/phase';
import { t, tf } from '../../i18n';
import { colors, spacing, type } from '../../theme';
import { Card } from '../Card';

const PHASE_ORDER: Phase[] = ['period', 'follicular', 'fertile', 'luteal'];
const PHASE_COLOR: Record<Phase, string> = {
  period: colors.period,
  follicular: colors.follicular,
  fertile: colors.fertile,
  luteal: colors.luteal,
};

const short = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' });

function CycleCard({ cycle }: { cycle: CycleSummary }) {
  const range = cycle.endDate
    ? `${short(cycle.startDate)} - ${short(cycle.endDate)}`
    : `${short(cycle.startDate)} - ${t('history.now')}`;
  return (
    <Card>
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}
      >
        <Text style={[type.heading, { color: colors.ink }]}>{range}</Text>
        <Text style={[type.label, { color: colors.muted }]}>
          {cycle.open
            ? tf('history.daysSoFar', { days: cycle.days })
            : tf('history.days', { days: cycle.days })}
        </Text>
      </View>
      <Text style={[type.caption, { color: colors.muted }]}>
        {cycle.periodDays !== null
          ? tf('history.period', { days: cycle.periodDays })
          : t('history.periodUnknown')}
      </Text>
      <View
        style={{ flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', gap: 1 }}
      >
        {PHASE_ORDER.filter((p) => cycle.phaseDays[p] > 0).map((p) => (
          <View key={p} style={{ flex: cycle.phaseDays[p], backgroundColor: PHASE_COLOR[p] }} />
        ))}
      </View>
    </Card>
  );
}

/** One card per cycle, newest first. */
export function CycleHistory({ cycles }: { cycles: CycleSummary[] }) {
  return (
    <View style={{ gap: spacing.md }}>
      <Text style={[type.heading, { color: colors.ink }]}>{t('history.title')}</Text>
      {cycles.length === 0 ? (
        <Card>
          <Text style={[type.body, { color: colors.muted }]}>{t('history.empty')}</Text>
        </Card>
      ) : (
        cycles.map((c) => <CycleCard key={c.startDate} cycle={c} />)
      )}
    </View>
  );
}

import { Pressable, Text, View } from 'react-native';

import type { DayInfo } from '../../core/calendar';
import { MOOD_FACES } from '../../content/moodFaces';
import type { DayLog } from '../../db/repos';
import { t, tf } from '../../i18n';
import { he } from '../../i18n/he';
import { colors, MIN_TOUCH, radii, spacing, type } from '../../theme';
import { Card } from '../Card';

interface Props {
  /** 'YYYY-MM-DD'. */
  date: string;
  today: string;
  info: DayInfo;
  log: DayLog | null;
  onEdit: () => void;
}

const PAIN_LABEL = (pain: number) =>
  he.checkin.painLevels[pain <= 0 ? 0 : pain <= 3 ? 1 : pain <= 6 ? 2 : 3];

/** The selected day: its cycle day and phase, what was logged, and an edit button. */
export function DayDetails({ date, today, info, log, onEdit }: Props) {
  const future = date > today;
  const title = new Date(`${date}T12:00:00`).toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const facts: string[] = [];
  if (log) {
    if (log.flow !== null) facts.push(`${t('checkin.flow')}: ${he.checkin.flowLevels[log.flow]}`);
    if (log.pain !== null) facts.push(`${t('checkin.pain')}: ${PAIN_LABEL(log.pain)}`);
    if (log.energy !== null) facts.push(`${t('checkin.energy')}: ${log.energy}/5`);
  }

  return (
    <Card>
      <Text style={[type.heading, { color: colors.ink }]}>{title}</Text>
      {info.phase && info.cycleDay !== null && (
        <Text style={[type.label, { color: colors.muted }]}>
          {tf('calendar.cycleDay', { day: info.cycleDay })} · {t(`phase.${info.phase}`)}
          {info.predicted ? ` (${t('calendar.predicted')})` : ''}
        </Text>
      )}

      {log ? (
        <View style={{ gap: spacing.sm }}>
          {log.mood !== null && (
            <Text style={[type.body, { color: colors.ink }]}>
              {MOOD_FACES[log.mood - 1]} {he.mood.faces[log.mood - 1]}
            </Text>
          )}
          {log.symptoms.length > 0 && (
            <Text style={[type.body, { color: colors.ink }]}>{log.symptoms.join(', ')}</Text>
          )}
          {facts.length > 0 && (
            <Text style={[type.body, { color: colors.ink }]}>{facts.join(' · ')}</Text>
          )}
          {log.note.trim() !== '' && (
            <Text style={[type.body, { color: colors.muted }]}>{log.note}</Text>
          )}
        </View>
      ) : (
        <Text style={[type.body, { color: colors.muted }]}>
          {future ? t('calendar.futureDay') : t('calendar.nothingLogged')}
        </Text>
      )}

      {!future && (
        <Pressable
          accessibilityRole="button"
          onPress={onEdit}
          style={{
            minHeight: MIN_TOUCH,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: radii.pill,
            backgroundColor: colors.primary,
            marginTop: spacing.xs,
          }}
        >
          <Text style={[type.label, { color: '#FFFFFF' }]}>
            {log ? t('calendar.edit') : t('calendar.add')}
          </Text>
        </Pressable>
      )}
    </Card>
  );
}

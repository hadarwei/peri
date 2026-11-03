import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { t } from '../../i18n';
import { he } from '../../i18n/he';
import { colors, MIN_TOUCH, radii, spacing, type } from '../../theme';
import { Card } from '../Card';
import { Chip } from './Chip';
import { PAIN_VALUES, type CheckInDraft } from './draft';

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={[type.label, { color: colors.muted }]}>{title}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>{children}</View>
    </View>
  );
}

/** Collapsed by default: bleeding, pain, energy and a free note. */
export function MoreDetails({
  draft,
  onChange,
}: {
  draft: CheckInDraft;
  onChange: (patch: Partial<CheckInDraft>) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((v) => !v)}
        style={{ minHeight: MIN_TOUCH, justifyContent: 'center' }}
      >
        <Text style={[type.heading, { color: colors.ink }]}>
          {t('checkin.moreDetails')} {open ? '▴' : '▾'}
        </Text>
      </Pressable>
      {open && (
        <View style={{ gap: spacing.lg }}>
          <Row title={t('checkin.flow')}>
            {he.checkin.flowLevels.map((label, i) => (
              <Chip
                key={label}
                label={label}
                selected={draft.flow === i}
                onPress={() => onChange({ flow: draft.flow === i ? null : i })}
              />
            ))}
          </Row>
          <Row title={t('checkin.pain')}>
            {he.checkin.painLevels.map((label, i) => (
              <Chip
                key={label}
                label={label}
                selected={draft.pain === PAIN_VALUES[i]}
                onPress={() =>
                  onChange({ pain: draft.pain === PAIN_VALUES[i] ? null : PAIN_VALUES[i] })
                }
              />
            ))}
          </Row>
          <Row title={t('checkin.energy')}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Chip
                key={n}
                label={String(n)}
                selected={draft.energy === n}
                onPress={() => onChange({ energy: draft.energy === n ? null : n })}
              />
            ))}
          </Row>
          <View style={{ gap: spacing.sm }}>
            <Text style={[type.label, { color: colors.muted }]}>{t('checkin.note')}</Text>
            <TextInput
              value={draft.note}
              onChangeText={(note) => onChange({ note })}
              placeholder={t('checkin.notePlaceholder')}
              placeholderTextColor={colors.muted}
              multiline
              style={[
                type.body,
                {
                  minHeight: 80,
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                  borderRadius: radii.md,
                  padding: spacing.md,
                  color: colors.ink,
                  textAlign: 'right',
                  textAlignVertical: 'top',
                },
              ]}
            />
          </View>
        </View>
      )}
    </Card>
  );
}

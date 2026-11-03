import { Text, View } from 'react-native';

import type { TrackingInfo } from '../../content/trackingInfo';
import { t } from '../../i18n';
import { colors, radii, spacing, type } from '../../theme';

/** An explanation that opens under a switch: what it gives you, and what it cannot do. */
export function InfoPanel({ info }: { info: TrackingInfo }) {
  return (
    <View
      style={{
        backgroundColor: colors.tint.luteal,
        borderRadius: radii.md,
        padding: spacing.md,
        gap: spacing.sm,
      }}
    >
      <Text style={[type.label, { color: colors.ink }]}>{info.title}</Text>
      {info.benefits.map((line) => (
        <Text key={line} style={[type.body, { color: colors.ink }]}>
          • {line}
        </Text>
      ))}
      <Text style={[type.label, { color: colors.ink, marginTop: spacing.xs }]}>
        {t('me.infoLimits')}
      </Text>
      {info.limits.map((line) => (
        <Text key={line} style={[type.body, { color: colors.ink }]}>
          • {line}
        </Text>
      ))}
      <Text style={[type.caption, { color: colors.muted }]}>
        {info.reviewed ? t('me.infoGeneral') : t('me.infoUnreviewed')}
      </Text>
    </View>
  );
}

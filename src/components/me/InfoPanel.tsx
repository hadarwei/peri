import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { TrackingInfo } from '../../content/trackingInfo';
import { t } from '../../i18n';
import { colors, MIN_TOUCH, radii, spacing, type } from '../../theme';

/**
 * A short explanation under a switch: what it gives you and what it cannot do. A button copies a
 * ready-made question to paste into an AI chat for a deeper explanation (the copy stays on the phone).
 */
export function InfoPanel({ info }: { info: TrackingInfo }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await Clipboard.setStringAsync(info.deeperPrompt);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

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
      {info.limits.map((line) => (
        <Text key={line} style={[type.body, { color: colors.muted }]}>
          – {line}
        </Text>
      ))}
      <Pressable
        accessibilityRole="button"
        onPress={copy}
        style={{
          minHeight: MIN_TOUCH,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: radii.pill,
          borderWidth: 1,
          borderColor: colors.primary,
          backgroundColor: colors.card,
        }}
      >
        <Text style={[type.label, { color: colors.primary }]}>{t('me.copyPrompt')}</Text>
      </Pressable>
      {copied && <Text style={[type.caption, { color: colors.ink }]}>{t('me.copied')}</Text>}
      <Text style={[type.caption, { color: colors.muted }]}>
        {info.reviewed ? t('me.infoGeneral') : t('me.infoUnreviewed')}
      </Text>
    </View>
  );
}

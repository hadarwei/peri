import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native';

import { t } from '../i18n';
import { colors, MIN_TOUCH, radii, spacing, type } from '../theme';

export const MEADOW_HEIGHT = 310;
const MEADOW_RATIO = 1385 / 780; // image height / width (assets/meadow.jpg)

interface Props {
  name?: string;
  /** Over the picture, UNDER the header (taps on the meadow are caught here). */
  behind?: ReactNode;
  /** Over everything, not touchable (the duck is drawn here so it can cross the header text). */
  front?: ReactNode;
}

/** Header with the meadow picture (cover fit, top-aligned), greeting, privacy chip, settings. */
export function MeadowScene({ name, behind, front }: Props) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const greeting = name ? `${t('today.greeting')}, ${name}` : t('today.greeting');

  return (
    <View
      style={{ width, height: MEADOW_HEIGHT, overflow: 'hidden', backgroundColor: colors.ground }}
    >
      {/* Full-width image anchored to the top; the bottom is cropped by the container. */}
      <Image
        source={require('../../assets/meadow.jpg')}
        style={{ position: 'absolute', top: 0, width, height: width * MEADOW_RATIO }}
        resizeMode="cover"
      />
      {behind}
      <View pointerEvents="box-none" style={{ padding: spacing.lg, gap: spacing.sm }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Text style={[type.title, { color: colors.ink }]}>{greeting}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('today.settings')}
            onPress={() => router.navigate('/me')}
            style={{
              width: MIN_TOUCH,
              height: MIN_TOUCH,
              borderRadius: radii.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.85)',
            }}
          >
            <Ionicons name="settings-outline" size={22} color={colors.ink} />
          </Pressable>
        </View>
        <View
          style={{
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radii.pill,
            backgroundColor: 'rgba(255,255,255,0.85)',
          }}
        >
          <Ionicons name="lock-closed-outline" size={14} color={colors.muted} />
          <Text style={[type.caption, { color: colors.muted }]}>{t('today.privacyChip')}</Text>
        </View>
      </View>
      {front}
    </View>
  );
}

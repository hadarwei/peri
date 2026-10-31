import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { colors, radii, spacing } from '../theme';

/** White card with a thin border and 18 px corners, as in the design. */
export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderWidth: 1,
          borderRadius: radii.card,
          padding: spacing.lg,
          gap: spacing.sm,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

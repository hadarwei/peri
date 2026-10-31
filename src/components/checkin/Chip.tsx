import { Pressable, Text } from 'react-native';

import { colors, MIN_TOUCH, radii, type } from '../../theme';

/** A selectable pill with a 44 px touch target. */
export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        minHeight: MIN_TOUCH,
        paddingHorizontal: 16,
        justifyContent: 'center',
        borderRadius: radii.pill,
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.cardBorder,
        backgroundColor: selected ? colors.primary : colors.card,
      }}
    >
      <Text style={[type.label, { color: selected ? '#FFFFFF' : colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { t } from '../../i18n';
import { he } from '../../i18n/he';
import { colors, MIN_TOUCH, radii, spacing, type } from '../../theme';
import { Card } from '../Card';

const FACES = ['😣', '😕', '🙂', '😊', '🤩'];

/** Skippable mood question. Tapping a face reports it; saving comes in the next stage. */
export function MoodRow({
  onPick,
  value,
}: {
  onPick: (mood: number) => void;
  /** When given, the row is controlled by the parent; otherwise it remembers the last tap. */
  value?: number | null;
}) {
  const [tapped, setTapped] = useState<number | null>(null);
  const picked = value !== undefined ? value : tapped;
  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm }}>
        <Text style={[type.heading, { color: colors.ink }]}>{t('mood.title')}</Text>
        <Text style={[type.caption, { color: colors.muted }]}>{t('mood.skip')}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {FACES.map((face, i) => (
          <Pressable
            key={face}
            accessibilityRole="button"
            accessibilityLabel={he.mood.faces[i]}
            onPress={() => {
              setTapped(i + 1);
              onPick(i + 1);
            }}
            style={{
              minWidth: MIN_TOUCH,
              minHeight: MIN_TOUCH + 18,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radii.md,
              backgroundColor: picked === i + 1 ? colors.tint.follicular : 'transparent',
            }}
          >
            <Text style={{ fontSize: 28 }}>{face}</Text>
            <Text style={[type.caption, { color: colors.muted, fontSize: 10 }]}>
              {he.mood.faces[i]}
            </Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

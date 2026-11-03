import { ScrollView } from 'react-native';

import { TemperatureChart } from '../../src/components/me/TemperatureChart';
import { TrackingCard } from '../../src/components/me/TrackingCard';
import { colors, spacing } from '../../src/theme';

export default function MeScreen() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.ground }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
    >
      <TrackingCard />
      <TemperatureChart />
    </ScrollView>
  );
}

import { Pressable, Text, View } from 'react-native';

import { formatTemperature, startingTemperature, stepTemperature } from '../../core/temperature';
import { t } from '../../i18n';
import { colors, MIN_TOUCH, radii, type } from '../../theme';
import { Card } from '../Card';
import { Chip } from './Chip';

interface Props {
  /** The value entered so far, or null if the user has not touched the buttons yet. */
  value: number | null;
  /** Last saved temperature, where the buttons start. */
  lastSaved: number | null;
  unusual: boolean;
  onChange: (celsius: number) => void;
  onUnusual: (unusual: boolean) => void;
}

function StepButton({
  label,
  onPress,
  symbol,
}: {
  label: string;
  onPress: () => void;
  symbol: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        width: 56,
        height: 56,
        borderRadius: radii.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
      }}
    >
      <Text style={{ color: '#FFFFFF', fontSize: 30, lineHeight: 34 }}>{symbol}</Text>
    </Pressable>
  );
}

/** Morning temperature: big value with - and + (0.05 °C), plus a chip for unusual readings. */
export function TemperatureCard({ value, lastSaved, unusual, onChange, onUnusual }: Props) {
  const start = startingTemperature(lastSaved);
  const shown = value ?? start;
  const touched = value !== null;
  // The first press moves from the starting value; nothing is saved until then.
  const step = (direction: 1 | -1) => onChange(stepTemperature(shown, direction));

  return (
    <Card>
      <Text style={[type.heading, { color: colors.ink }]}>{t('temperature.title')}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <StepButton symbol="−" label={t('temperature.lower')} onPress={() => step(-1)} />
        <View style={{ alignItems: 'center' }}>
          <Text
            accessibilityLabel={`${formatTemperature(shown)} ${t('temperature.unit')}`}
            style={[
              type.title,
              { fontSize: 40, lineHeight: 48, color: touched ? colors.ink : colors.muted },
            ]}
          >
            {formatTemperature(shown)}°
          </Text>
          {!touched && (
            <Text style={[type.caption, { color: colors.muted }]}>{t('temperature.hint')}</Text>
          )}
        </View>
        <StepButton symbol="+" label={t('temperature.raise')} onPress={() => step(1)} />
      </View>
      <Text style={[type.caption, { color: colors.muted }]}>
        {t('temperature.beforeGettingUp')}
      </Text>
      <View style={{ minHeight: MIN_TOUCH, justifyContent: 'center', alignItems: 'flex-start' }}>
        <Chip
          label={t('temperature.unusual')}
          selected={unusual}
          onPress={() => onUnusual(!unusual)}
        />
      </View>
      <Text style={[type.caption, { color: colors.muted }]}>{t('temperature.unusualHint')}</Text>
    </Card>
  );
}

import { useEffect, useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';

import { getDb } from '../../db';
import { notifyDataChanged, useDataVersion } from '../../db/dataVersion';
import { TEMPERATURE_INFO, TESTS_INFO, type TrackingInfo } from '../../content/trackingInfo';
import { t } from '../../i18n';
import { loadTrackingSettings, saveTrackingSetting } from '../../settings/store';
import { DEFAULT_SETTINGS, type TrackingSettings } from '../../settings/tracking';
import { colors, MIN_TOUCH, spacing, type } from '../../theme';
import { Card } from '../Card';
import { InfoPanel } from './InfoPanel';

function SwitchRow({
  label,
  value,
  onValueChange,
  info,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** When given, a "why?" link opens this explanation under the row. */
  info?: TrackingInfo;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: spacing.sm }}>
      <View
        style={{
          minHeight: MIN_TOUCH,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.md,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={[type.body, { color: colors.ink }]}>{label}</Text>
          {info && (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              onPress={() => setOpen((v) => !v)}
              style={{ minHeight: MIN_TOUCH, justifyContent: 'center', alignSelf: 'flex-start' }}
            >
              <Text style={[type.label, { color: colors.primary }]}>
                {t('me.why')} {open ? '▴' : '▾'}
              </Text>
            </Pressable>
          )}
        </View>
        <Switch
          accessibilityLabel={label}
          value={value}
          onValueChange={onValueChange}
          trackColor={{ true: colors.primary }}
        />
      </View>
      {info && open && <InfoPanel info={info} />}
    </View>
  );
}

/** What the user chooses to track. Everything is off until switched on. */
export function TrackingCard() {
  const [settings, setSettings] = useState<TrackingSettings>(DEFAULT_SETTINGS);
  const dataVersion = useDataVersion();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const loaded = await loadTrackingSettings(await getDb());
        if (alive) setSettings(loaded);
      } catch {
        // Keep showing the defaults if the database cannot be read.
      }
    })();
    return () => {
      alive = false;
    };
  }, [dataVersion]);

  const change = async <K extends keyof TrackingSettings>(name: K, value: TrackingSettings[K]) => {
    setSettings((s) => ({ ...s, [name]: value })); // show the change right away
    try {
      await saveTrackingSetting(await getDb(), name, value);
      notifyDataChanged();
    } catch {
      // The next reload shows the value that was really saved.
    }
  };

  return (
    <Card>
      <Text style={[type.heading, { color: colors.ink }]}>{t('me.tracking')}</Text>
      <SwitchRow
        label={t('me.tempTracking')}
        value={settings.tempEnabled}
        onValueChange={(v) => change('tempEnabled', v)}
        info={TEMPERATURE_INFO}
      />
      {settings.tempEnabled && (
        <SwitchRow
          label={t('me.tempDaily')}
          value={settings.tempDaily}
          onValueChange={(v) => change('tempDaily', v)}
        />
      )}
      <SwitchRow
        label={t('me.testsTracking')}
        value={settings.testsEnabled}
        onValueChange={(v) => change('testsEnabled', v)}
        info={TESTS_INFO}
      />
    </Card>
  );
}

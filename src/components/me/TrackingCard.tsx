import { useEffect, useState } from 'react';
import { Switch, Text, View } from 'react-native';

import { getDb } from '../../db';
import { notifyDataChanged, useDataVersion } from '../../db/dataVersion';
import { t } from '../../i18n';
import { loadTrackingSettings, saveTrackingSetting } from '../../settings/store';
import { DEFAULT_SETTINGS, type TrackingSettings } from '../../settings/tracking';
import { colors, MIN_TOUCH, spacing, type } from '../../theme';
import { Card } from '../Card';

function SwitchRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View
      style={{
        minHeight: MIN_TOUCH,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
      }}
    >
      <Text style={[type.body, { color: colors.ink, flex: 1 }]}>{label}</Text>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colors.primary }}
      />
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
      />
    </Card>
  );
}

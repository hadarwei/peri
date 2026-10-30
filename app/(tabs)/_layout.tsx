import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { t } from '../../src/i18n';
import { colors, fonts } from '../../src/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.medium },
        headerTitleStyle: { fontFamily: fonts.semibold, color: colors.ink },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.today'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sunny-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t('tabs.calendar'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: t('tabs.me'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}

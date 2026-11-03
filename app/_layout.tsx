import {
  Rubik_400Regular,
  Rubik_500Medium,
  Rubik_600SemiBold,
  Rubik_700Bold,
  useFonts,
} from '@expo-google-fonts/rubik';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';

import { DuckProvider } from '../src/duck/DuckProvider';
import '../src/rtl';

// Keep the splash screen visible until the fonts are ready.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_600SemiBold,
    Rubik_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    // Explicit direction: in Expo Go, forceRTL is not reliably applied, so we set the
    // layout direction ourselves. Children (tab bar, rows) inherit it.
    <View style={{ flex: 1, direction: 'rtl' }}>
      <StatusBar style="dark" />
      <DuckProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="checkin" options={{ presentation: 'modal' }} />
          <Stack.Screen name="add-cycle" options={{ presentation: 'modal' }} />
        </Stack>
      </DuckProvider>
    </View>
  );
}

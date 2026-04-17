import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { Colors } from '@/constants/Colors';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ExercisePickerBusProvider } from '@/contexts/ExercisePickerBus';
import { MeasurementsProvider } from '@/contexts/MeasurementsContext';
import { RestTimerProvider } from '@/contexts/RestTimerContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { WorkoutProvider } from '@/contexts/WorkoutContext';
import { useColorScheme } from '@/hooks/useColorScheme';

function FullScreenLoader() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.neutral.darkBackground,
      }}
    >
      <ActivityIndicator size="large" color={Colors.primary.accentViolet} />
    </View>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.neutral.darkBackground } }}>
        {user ? (
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        )}
        <Stack.Screen
          name="active-workout"
          options={{ presentation: 'modal', headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="exercise-picker"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="workout/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="routine/new"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="routine/[id]"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="routine/preview/[id]"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="exercise/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="measurements"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="settings"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="personal-records"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return <FullScreenLoader />;
  }

  return (
    <AuthProvider>
      <SettingsProvider>
        <WorkoutProvider>
          <MeasurementsProvider>
            <RestTimerProvider>
              <ExercisePickerBusProvider>
                <RootLayoutNav />
              </ExercisePickerBusProvider>
            </RestTimerProvider>
          </MeasurementsProvider>
        </WorkoutProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

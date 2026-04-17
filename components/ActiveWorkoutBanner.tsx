import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';
import { useWorkouts } from '@/contexts/WorkoutContext';

/**
 * Sticky banner shown across the tab screens whenever a workout is in
 * progress. Mirrors Hevy's "resume workout" bar that sits just above the
 * tab bar so you can jump back into logging from anywhere.
 */
export function ActiveWorkoutBanner() {
  const router = useRouter();
  const { activeWorkout } = useWorkouts();
  const [, force] = useState(0);

  // Tick so the elapsed label stays fresh.
  useEffect(() => {
    if (!activeWorkout) return;
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [activeWorkout]);

  if (!activeWorkout) return null;

  const elapsed = Math.max(
    0,
    Math.round((Date.now() - new Date(activeWorkout.startedAt).getTime()) / 1000),
  );

  return (
    <Pressable
      onPress={() => router.push('/active-workout')}
      style={styles.wrapper}
      testID="active-workout-banner"
    >
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <IconSymbol name="flame.fill" size={18} color={Colors.semantic.warning} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText type="caption" style={styles.label}>
            WORKOUT IN PROGRESS
          </ThemedText>
          <ThemedText type="body" style={styles.name} numberOfLines={1}>
            {activeWorkout.name}
          </ThemedText>
        </View>
        <View style={styles.timerBox}>
          <ThemedText type="body" style={styles.timer}>
            {format(elapsed)}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

function format(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h) return `${h}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 82,
    paddingHorizontal: Spacing.md,
    zIndex: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.elevatedBackground,
    borderRadius: 14,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary.accentViolet,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutral.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: Colors.neutral.textSecondary, letterSpacing: 0.6 },
  name: { color: Colors.neutral.textPrimary, fontWeight: '700' },
  timerBox: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.primary.accentViolet,
    borderRadius: 8,
  },
  timer: { color: '#fff', fontWeight: '700', fontVariant: ['tabular-nums'] },
});

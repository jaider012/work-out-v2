import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useWorkouts } from '@/contexts/WorkoutContext';
import { getExerciseById } from '@/data/exercises';

const TAB_BAR_CONTENT_HEIGHT = 62;
const TAB_BAR_MIN_PADDING_BOTTOM = 18;
const BANNER_GAP_ABOVE_TAB_BAR = 8;

export function ActiveWorkoutBanner() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeWorkout, discardActiveWorkout } = useWorkouts();
  const [, force] = useState(0);

  useEffect(() => {
    if (!activeWorkout) return;
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [activeWorkout]);

  const currentExerciseName = useMemo(() => {
    if (!activeWorkout) return null;
    const last = activeWorkout.exercises[activeWorkout.exercises.length - 1];
    if (!last) return null;
    return getExerciseById(last.exerciseId)?.name ?? null;
  }, [activeWorkout]);

  if (!activeWorkout) return null;

  const elapsed = Math.max(
    0,
    Math.round((Date.now() - new Date(activeWorkout.startedAt).getTime()) / 1000),
  );

  const expand = () => router.push('/active-workout');

  const handleDiscard = () => {
    Alert.alert('Discard workout?', 'You will lose all your logged sets.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          discardActiveWorkout();
        },
      },
    ]);
  };

  const tabBarHeight = TAB_BAR_CONTENT_HEIGHT + Math.max(insets.bottom, TAB_BAR_MIN_PADDING_BOTTOM);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        { bottom: tabBarHeight + BANNER_GAP_ABOVE_TAB_BAR },
      ]}
    >
      <Pressable
        onPress={expand}
        style={styles.pill}
        testID="active-workout-banner"
        accessibilityRole="button"
        accessibilityLabel="Resume active workout"
      >
        <View style={styles.sideCircle}>
          <IconSymbol name="chevron.up" size={28} color={Colors.neutral.textPrimary} />
        </View>
        <View style={styles.center}>
          <View style={styles.titleRow}>
            <View style={styles.statusDot} />
            <Text style={styles.titleText} numberOfLines={1}>
              Workout
              <Text style={styles.timerText}>  {format(elapsed)}</Text>
            </Text>
          </View>
          {currentExerciseName ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {currentExerciseName}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={handleDiscard}
          hitSlop={8}
          style={({ pressed }) => [styles.sideCircle, pressed && styles.sideCirclePressed]}
          testID="active-workout-banner-discard"
          accessibilityRole="button"
          accessibilityLabel="Discard workout"
        >
          <IconSymbol name="trash" size={24} color={Colors.semantic.error} />
        </Pressable>
      </Pressable>
    </View>
  );
}

function format(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h) return `${h}h ${pad(m)}min ${pad(s)}s`;
  return `${m}min ${pad(s)}s`;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

const STATUS_DOT_SIZE = 10;
const SIDE_CIRCLE_SIZE = 52;
const PILL_HEIGHT = 68;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    zIndex: 20,
  },
  pill: {
    height: PILL_HEIGHT,
    backgroundColor: Colors.neutral.cardBackground,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  sideCircle: {
    width: SIDE_CIRCLE_SIZE,
    height: SIDE_CIRCLE_SIZE,
    borderRadius: SIDE_CIRCLE_SIZE / 2,
    backgroundColor: Colors.neutral.elevatedBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideCirclePressed: {
    opacity: 0.7,
  },
  center: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: STATUS_DOT_SIZE,
    height: STATUS_DOT_SIZE,
    borderRadius: STATUS_DOT_SIZE / 2,
    backgroundColor: Colors.semantic.success,
  },
  titleText: {
    flexShrink: 1,
    color: Colors.neutral.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  timerText: {
    fontWeight: '500',
  },
  subtitle: {
    color: Colors.neutral.textSecondary,
    fontSize: 14,
    marginTop: 2,
    marginLeft: STATUS_DOT_SIZE + 8,
  },
});

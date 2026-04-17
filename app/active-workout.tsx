import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';
import { useWorkouts } from '@/contexts/WorkoutContext';
import { getExerciseById } from '@/data/exercises';
import { computeWorkoutVolumeKg, totalSets } from '@/utils/workoutStats';

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const {
    activeWorkout,
    finishActiveWorkout,
    discardActiveWorkout,
    removeExerciseFromActive,
    addSetToExercise,
    updateSet,
    removeSet,
    updateActiveWorkout,
  } = useWorkouts();

  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const completedSets = useMemo(
    () =>
      activeWorkout
        ? activeWorkout.exercises.reduce(
            (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
            0,
          )
        : 0,
    [activeWorkout],
  );
  const volume = useMemo(
    () =>
      activeWorkout
        ? computeWorkoutVolumeKg({
            exercises: activeWorkout.exercises.map((ex) => ({
              ...ex,
              sets: ex.sets.filter((s) => s.completed),
            })),
          })
        : 0,
    [activeWorkout],
  );

  if (!activeWorkout) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyState}>
            <IconSymbol name="dumbbell" size={48} color={Colors.neutral.textTertiary} />
            <ThemedText type="h2" style={styles.emptyTitle}>
              No active workout
            </ThemedText>
            <Button title="Close" variant="secondary" onPress={() => router.back()} />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const elapsed = Math.max(
    0,
    Math.round((Date.now() - new Date(activeWorkout.startedAt).getTime()) / 1000),
  );

  const handleFinish = async () => {
    if (completedSets === 0) {
      Alert.alert(
        'Finish workout?',
        'You have not completed any sets. Finish anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Finish', onPress: doFinish },
        ],
      );
      return;
    }
    doFinish();
  };

  const doFinish = async () => {
    const finished = await finishActiveWorkout();
    if (finished) {
      router.replace('/(tabs)');
    } else {
      router.back();
    }
  };

  const handleDiscard = () => {
    Alert.alert('Discard workout?', 'You will lose all your logged sets.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: async () => {
          await discardActiveWorkout();
          router.back();
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <IconSymbol name="chevron.down" size={26} color={Colors.neutral.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <ThemedText type="caption" style={styles.timerLabel}>
              DURATION
            </ThemedText>
            <ThemedText type="h2" style={styles.timer}>
              {formatTimer(elapsed)}
            </ThemedText>
          </View>
          <TouchableOpacity
            testID="active-workout-finish"
            onPress={handleFinish}
            activeOpacity={0.7}
          >
            <ThemedText type="body" style={styles.finishText}>
              Finish
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <ThemedText type="caption" style={styles.statLabel}>
              VOLUME
            </ThemedText>
            <ThemedText type="body" style={styles.statValue}>
              {Math.round(volume)} kg
            </ThemedText>
          </View>
          <View style={styles.statBlock}>
            <ThemedText type="caption" style={styles.statLabel}>
              SETS
            </ThemedText>
            <ThemedText type="body" style={styles.statValue}>
              {completedSets} / {totalSets(activeWorkout)}
            </ThemedText>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TextInput
            testID="active-workout-name"
            value={activeWorkout.name}
            onChangeText={(text) =>
              updateActiveWorkout((workout) => ({ ...workout, name: text }))
            }
            style={styles.nameInput}
            placeholder="Workout name"
            placeholderTextColor={Colors.neutral.textTertiary}
          />

          {activeWorkout.exercises.map((workoutExercise) => {
            const exercise = getExerciseById(workoutExercise.exerciseId);
            return (
              <View key={workoutExercise.id} style={styles.exerciseBlock}>
                <View style={styles.exerciseHeader}>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="h2" style={styles.exerciseName}>
                      {exercise?.name ?? 'Exercise'}
                    </ThemedText>
                    {exercise ? (
                      <ThemedText type="caption" style={styles.exerciseMeta}>
                        {exercise.primaryMuscle} · {exercise.equipment}
                      </ThemedText>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert('Remove exercise?', exercise?.name ?? 'Exercise', [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Remove',
                          style: 'destructive',
                          onPress: () => removeExerciseFromActive(workoutExercise.id),
                        },
                      ])
                    }
                    activeOpacity={0.7}
                  >
                    <IconSymbol name="ellipsis" size={22} color={Colors.neutral.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.setHeaderRow}>
                  <ThemedText type="caption" style={[styles.setHeader, { flex: 0.6 }]}>
                    SET
                  </ThemedText>
                  <ThemedText type="caption" style={[styles.setHeader, { flex: 1.2 }]}>
                    KG
                  </ThemedText>
                  <ThemedText type="caption" style={[styles.setHeader, { flex: 1 }]}>
                    REPS
                  </ThemedText>
                  <ThemedText
                    type="caption"
                    style={[styles.setHeader, { flex: 0.6, textAlign: 'right' }]}
                  >
                    ✓
                  </ThemedText>
                </View>

                {workoutExercise.sets.map((set, index) => (
                  <View
                    key={set.id}
                    style={[
                      styles.setRow,
                      set.completed && { backgroundColor: Colors.neutral.elevatedBackground },
                    ]}
                  >
                    <View style={{ flex: 0.6 }}>
                      <ThemedText type="body" style={styles.setIndex}>
                        {index + 1}
                      </ThemedText>
                    </View>
                    <TextInput
                      testID={`set-weight-${workoutExercise.id}-${index}`}
                      value={set.weight ? String(set.weight) : ''}
                      onChangeText={(text) =>
                        updateSet(workoutExercise.id, set.id, {
                          weight: parseFloat(text.replace(',', '.')) || 0,
                        })
                      }
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={Colors.neutral.textTertiary}
                      style={[styles.setInput, { flex: 1.2 }]}
                    />
                    <TextInput
                      testID={`set-reps-${workoutExercise.id}-${index}`}
                      value={set.reps ? String(set.reps) : ''}
                      onChangeText={(text) =>
                        updateSet(workoutExercise.id, set.id, {
                          reps: parseInt(text, 10) || 0,
                        })
                      }
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={Colors.neutral.textTertiary}
                      style={[styles.setInput, { flex: 1 }]}
                    />
                    <View style={{ flex: 0.6, alignItems: 'flex-end' }}>
                      <TouchableOpacity
                        testID={`set-check-${workoutExercise.id}-${index}`}
                        onPress={() =>
                          updateSet(workoutExercise.id, set.id, { completed: !set.completed })
                        }
                        onLongPress={() => removeSet(workoutExercise.id, set.id)}
                        activeOpacity={0.7}
                        style={[
                          styles.checkbox,
                          set.completed && { backgroundColor: Colors.semantic.success },
                        ]}
                      >
                        {set.completed ? (
                          <IconSymbol name="checkmark" size={16} color="#fff" />
                        ) : null}
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.addSetButton}
                  activeOpacity={0.7}
                  onPress={() => addSetToExercise(workoutExercise.id)}
                >
                  <IconSymbol name="plus" size={18} color={Colors.primary.accentViolet} />
                  <ThemedText type="body" style={styles.addSetText}>
                    Add Set
                  </ThemedText>
                </TouchableOpacity>
              </View>
            );
          })}

          <Button
            testID="active-workout-add-exercise"
            title="Add Exercise"
            variant="primary"
            fullWidth
            onPress={() =>
              router.push({ pathname: '/exercise-picker', params: { mode: 'active' } })
            }
            style={{ marginTop: Spacing.lg }}
          />

          <Button
            testID="active-workout-discard"
            title="Discard Workout"
            variant="destructive"
            fullWidth
            onPress={handleDiscard}
            style={{ marginTop: Spacing.md }}
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function formatTimer(seconds: number) {
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
  container: { flex: 1, backgroundColor: Colors.neutral.darkBackground },
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.border,
    gap: Spacing.sm,
  },
  timerLabel: { color: Colors.neutral.textSecondary },
  timer: { color: Colors.neutral.textPrimary },
  finishText: { color: Colors.primary.accentViolet, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.lg,
  },
  statBlock: { flex: 1 },
  statLabel: { color: Colors.neutral.textSecondary },
  statValue: { color: Colors.neutral.textPrimary, fontWeight: '600' },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  nameInput: {
    color: Colors.neutral.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  exerciseBlock: {
    backgroundColor: Colors.neutral.cardBackground,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  exerciseHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  exerciseName: { color: Colors.primary.accentViolet },
  exerciseMeta: { color: Colors.neutral.textSecondary, marginTop: 2 },
  setHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
  },
  setHeader: {
    color: Colors.neutral.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    marginBottom: 4,
  },
  setIndex: { color: Colors.neutral.textPrimary, fontWeight: '600' },
  setInput: {
    color: Colors.neutral.textPrimary,
    fontSize: 16,
    backgroundColor: Colors.neutral.elevatedBackground,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: Spacing.xs,
    textAlign: 'center',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
    backgroundColor: Colors.neutral.elevatedBackground,
    borderRadius: 8,
  },
  addSetText: { color: Colors.primary.accentViolet, fontWeight: '600' },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  emptyTitle: { color: Colors.neutral.textPrimary },
});

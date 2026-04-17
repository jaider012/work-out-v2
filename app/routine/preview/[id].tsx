import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';
import { useWorkouts } from '@/contexts/WorkoutContext';
import { getExerciseById, MUSCLE_LABELS } from '@/data/exercises';

export default function RoutinePreviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { routines, activeWorkout, startRoutine } = useWorkouts();

  const routine = useMemo(
    () => (id ? routines.find((r) => r.id === id) : undefined),
    [routines, id],
  );

  if (!routine) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.empty}>
            <ThemedText type="h2" style={styles.title}>
              Routine not found
            </ThemedText>
            <Button title="Go back" variant="secondary" onPress={() => router.back()} />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const handleStart = () => {
    if (activeWorkout) {
      router.replace('/active-workout');
      return;
    }
    startRoutine(routine.id);
    router.replace('/active-workout');
  };

  const totalSets = routine.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <IconSymbol name="chevron.down" size={26} color={Colors.neutral.textPrimary} />
          </TouchableOpacity>
          <ThemedText type="h2" style={styles.title} numberOfLines={1}>
            {routine.name}
          </ThemedText>
          <TouchableOpacity
            onPress={() => router.push(`/routine/${routine.id}`)}
            hitSlop={10}
            testID="routine-preview-edit"
          >
            <IconSymbol name="pencil" size={22} color={Colors.neutral.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.statsCard}>
            <Stat label="Exercises" value={String(routine.exercises.length)} />
            <Stat label="Planned sets" value={String(totalSets)} />
          </Card>

          <ThemedText type="caption" style={styles.sectionLabel}>
            EXERCISES
          </ThemedText>
          {routine.exercises.map((ex, idx) => {
            const exercise = getExerciseById(ex.exerciseId);
            return (
              <Card key={ex.id} style={styles.exerciseRow}>
                <View style={styles.exerciseIndex}>
                  <ThemedText type="caption" style={styles.exerciseIndexText}>
                    {idx + 1}
                  </ThemedText>
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText type="body" style={styles.exerciseName}>
                    {exercise?.name ?? ex.exerciseId}
                  </ThemedText>
                  <ThemedText type="caption" style={styles.muted}>
                    {exercise ? MUSCLE_LABELS[exercise.primaryMuscle] : ''} · {ex.sets.length}{' '}
                    sets
                  </ThemedText>
                </View>
              </Card>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            testID="routine-preview-start"
            title={activeWorkout ? 'Resume active workout' : 'Start Workout'}
            variant="primary"
            fullWidth
            onPress={handleStart}
          />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <ThemedText type="caption" style={styles.statLabel}>
        {label}
      </ThemedText>
      <ThemedText type="h2" style={styles.statValue}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.darkBackground },
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.border,
  },
  title: { color: Colors.neutral.textPrimary, flex: 1, textAlign: 'center' },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  statsCard: { flexDirection: 'row', marginBottom: Spacing.lg, gap: Spacing.md },
  statLabel: {
    color: Colors.neutral.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: { color: Colors.primary.accentViolet, fontWeight: '700' },
  sectionLabel: {
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  exerciseIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.neutral.elevatedBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseIndexText: { color: Colors.neutral.textPrimary, fontWeight: '700' },
  exerciseName: { color: Colors.neutral.textPrimary, fontWeight: '600' },
  muted: { color: Colors.neutral.textSecondary, marginTop: 2 },
  footer: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.border,
    backgroundColor: Colors.neutral.darkBackground,
  },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
});

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';
import { useWorkouts } from '@/contexts/WorkoutContext';
import { EQUIPMENT_LABELS, MUSCLE_LABELS, getExerciseById } from '@/data/exercises';
import {
  bestOneRepMax,
  bestSetEver,
  estimateOneRepMax,
  setsForExercise,
} from '@/utils/exerciseHistory';

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workouts } = useWorkouts();
  const exercise = id ? getExerciseById(id) : undefined;

  const sessions = useMemo(() => {
    if (!id) return [] as { startedAt: string; workoutId: string; sets: { weight: number; reps: number }[] }[];
    const acc = new Map<string, { startedAt: string; workoutId: string; sets: { weight: number; reps: number }[] }>();
    for (const workout of workouts) {
      for (const ex of workout.exercises) {
        if (ex.exerciseId !== id) continue;
        const finishedSets = ex.sets.filter((s) => s.completed);
        if (finishedSets.length === 0) continue;
        acc.set(workout.id, {
          startedAt: workout.startedAt,
          workoutId: workout.id,
          sets: finishedSets.map((s) => ({ weight: s.weight, reps: s.reps })),
        });
      }
    }
    return Array.from(acc.values()).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );
  }, [workouts, id]);

  const allSets = id ? setsForExercise(workouts, id) : [];
  const bestSet = id ? bestSetEver(workouts, id) : null;
  const oneRm = id ? bestOneRepMax(workouts, id) : 0;

  if (!exercise) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.empty}>
            <ThemedText type="h2" style={styles.title}>
              Exercise not found
            </ThemedText>
            <TouchableOpacity onPress={() => router.back()}>
              <ThemedText type="body" style={styles.link}>
                Go back
              </ThemedText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={26} color={Colors.neutral.textPrimary} />
          </TouchableOpacity>
          <ThemedText type="h2" style={styles.title} numberOfLines={1}>
            {exercise.name}
          </ThemedText>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedText type="caption" style={styles.meta}>
            {MUSCLE_LABELS[exercise.primaryMuscle]} · {EQUIPMENT_LABELS[exercise.equipment]}
          </ThemedText>

          <Card style={styles.statsCard}>
            <Stat label="Sessions" value={String(sessions.length)} />
            <Stat label="Total sets" value={String(allSets.length)} />
            <Stat label="Best e1RM" value={`${oneRm} kg`} />
          </Card>

          <Card style={styles.bestCard}>
            <ThemedText type="caption" style={styles.cardLabel}>
              HEAVIEST SET
            </ThemedText>
            <ThemedText type="h2" style={styles.bestText}>
              {bestSet ? `${bestSet.weight} kg × ${bestSet.reps}` : 'No data yet'}
            </ThemedText>
            {bestSet ? (
              <ThemedText type="caption" style={styles.meta}>
                {new Date(bestSet.startedAt).toLocaleDateString()}
              </ThemedText>
            ) : null}
          </Card>

          <ThemedText type="caption" style={styles.sectionLabel}>
            HISTORY
          </ThemedText>

          {sessions.length === 0 ? (
            <Card>
              <ThemedText type="caption" style={styles.emptyText}>
                Log this exercise in a workout to see history here.
              </ThemedText>
            </Card>
          ) : (
            sessions.map((session) => (
              <TouchableOpacity
                key={session.workoutId}
                onPress={() => router.push(`/workout/${session.workoutId}`)}
                activeOpacity={0.85}
              >
                <Card style={styles.sessionCard}>
                  <View style={styles.sessionHeader}>
                    <ThemedText type="body" style={styles.sessionDate}>
                      {new Date(session.startedAt).toLocaleDateString()}
                    </ThemedText>
                    <ThemedText type="caption" style={styles.sessionVolume}>
                      e1RM {Math.max(...session.sets.map((s) => estimateOneRepMax(s.weight, s.reps)))} kg
                    </ThemedText>
                  </View>
                  {session.sets.map((set, idx) => (
                    <View key={idx} style={styles.sessionSet}>
                      <ThemedText type="caption" style={styles.sessionSetIndex}>
                        Set {idx + 1}
                      </ThemedText>
                      <ThemedText type="body" style={styles.sessionSetText}>
                        {set.weight} kg × {set.reps}
                      </ThemedText>
                    </View>
                  ))}
                </Card>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBlock}>
      <ThemedText type="caption" style={styles.statLabel}>
        {label}
      </ThemedText>
      <ThemedText type="body" style={styles.statValue}>
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
  meta: { color: Colors.neutral.textSecondary, marginBottom: Spacing.md },
  statsCard: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  statBlock: { flex: 1 },
  statLabel: { color: Colors.neutral.textSecondary, marginBottom: 2 },
  statValue: { color: Colors.neutral.textPrimary, fontWeight: '600' },
  bestCard: { marginBottom: Spacing.lg },
  cardLabel: {
    color: Colors.neutral.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.xs,
  },
  bestText: { color: Colors.semantic.pr, fontWeight: '700' },
  sectionLabel: {
    color: Colors.neutral.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  emptyText: { color: Colors.neutral.textSecondary, textAlign: 'center' },
  sessionCard: { marginBottom: Spacing.sm },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  sessionDate: { color: Colors.neutral.textPrimary, fontWeight: '600' },
  sessionVolume: { color: Colors.semantic.pr },
  sessionSet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  sessionSetIndex: { color: Colors.neutral.textSecondary },
  sessionSetText: { color: Colors.neutral.textPrimary },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  link: { color: Colors.primary.accentViolet },
});

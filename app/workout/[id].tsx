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
import { fromKg, useSettings } from '@/contexts/SettingsContext';
import { useWorkouts } from '@/contexts/WorkoutContext';
import { getExerciseById } from '@/data/exercises';
import { computeWorkoutVolumeKg, formatDuration, totalSets } from '@/utils/workoutStats';

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workouts } = useWorkouts();
  const { weightUnit } = useSettings();

  const workout = useMemo(() => workouts.find((w) => w.id === id), [workouts, id]);

  if (!workout) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.empty}>
            <ThemedText type="h2" style={styles.title}>
              Workout not found
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
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <IconSymbol name="chevron.left" size={26} color={Colors.neutral.textPrimary} />
          </TouchableOpacity>
          <ThemedText type="h2" style={styles.title} numberOfLines={1}>
            {workout.name}
          </ThemedText>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedText type="caption" style={styles.date}>
            {new Date(workout.startedAt).toLocaleString()}
          </ThemedText>

          <Card style={styles.statsCard}>
            <Stat label="Time" value={formatDuration(workout.durationSeconds)} />
            <Stat label="Volume" value={`${Math.round(fromKg(computeWorkoutVolumeKg(workout), weightUnit))} ${weightUnit}`} />
            <Stat label="Sets" value={String(totalSets(workout))} />
          </Card>

          {workout.exercises.map((ex) => {
            const exercise = getExerciseById(ex.exerciseId);
            return (
              <Card key={ex.id} style={styles.exerciseCard}>
                <ThemedText type="body" style={styles.exerciseName}>
                  {exercise?.name ?? 'Exercise'}
                </ThemedText>
                {ex.sets.map((set, idx) => (
                  <View key={set.id} style={styles.setRow}>
                    <ThemedText type="caption" style={styles.setNumber}>
                      Set {idx + 1}
                    </ThemedText>
                    <ThemedText type="body" style={styles.setText}>
                      {fromKg(set.weight, weightUnit)} {weightUnit} × {set.reps}
                    </ThemedText>
                  </View>
                ))}
              </Card>
            );
          })}
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
  date: { color: Colors.neutral.textSecondary, marginBottom: Spacing.md },
  statsCard: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.lg },
  statBlock: { flex: 1 },
  statLabel: { color: Colors.neutral.textSecondary, marginBottom: 2 },
  statValue: { color: Colors.neutral.textPrimary, fontWeight: '600' },
  exerciseCard: { marginBottom: Spacing.md },
  exerciseName: {
    color: Colors.primary.accentViolet,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.border,
  },
  setNumber: { color: Colors.neutral.textSecondary },
  setText: { color: Colors.neutral.textPrimary, fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  link: { color: Colors.primary.accentViolet },
});

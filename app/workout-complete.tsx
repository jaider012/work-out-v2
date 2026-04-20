import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';
import { fromKg, useSettings } from '@/contexts/SettingsContext';
import { useWorkouts } from '@/contexts/WorkoutContext';
import { getExerciseById } from '@/data/exercises';
import { computeWorkoutVolumeKg, formatDuration, totalSets } from '@/utils/workoutStats';

export default function WorkoutCompleteScreen() {
  const router = useRouter();
  const { id, prs } = useLocalSearchParams<{ id: string; prs?: string }>();
  const { workouts } = useWorkouts();
  const { weightUnit } = useSettings();

  const workout = useMemo(
    () => (id ? workouts.find((w) => w.id === id) : undefined),
    [workouts, id],
  );
  const newPRs = prs ? Number(prs) : 0;

  if (!workout) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.empty}>
            <ThemedText type="h2" style={styles.title}>
              Workout not found
            </ThemedText>
            <Button title="Done" variant="primary" onPress={() => router.replace('/(tabs)')} />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const summary = formatSummary(workout, weightUnit);

  const handleShare = async () => {
    try {
      await Share.share({ message: summary });
    } catch {
      /* ignored */
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <IconSymbol name="checkmark.circle.fill" size={64} color={Colors.semantic.success} />
            </View>
            <ThemedText type="hero" style={styles.heroTitle}>
              Great work!
            </ThemedText>
            <ThemedText type="caption" style={styles.heroSubtitle}>
              {workout.name} · {new Date(workout.startedAt).toLocaleDateString()}
            </ThemedText>
            {newPRs > 0 ? (
              <View style={styles.prBanner}>
                <IconSymbol name="flag.fill" size={18} color={Colors.semantic.pr} />
                <ThemedText type="body" style={styles.prText}>
                  {newPRs} new personal record{newPRs === 1 ? '' : 's'} 🎉
                </ThemedText>
              </View>
            ) : null}
          </View>

          <Card style={styles.statsCard}>
            <Stat label="Time" value={formatDuration(workout.durationSeconds)} />
            <Stat
              label="Volume"
              value={`${Math.round(fromKg(computeWorkoutVolumeKg(workout), weightUnit))} ${weightUnit}`}
            />
            <Stat label="Sets" value={String(totalSets(workout))} />
          </Card>

          <ThemedText type="eyebrow" style={styles.sectionLabel}>
            EXERCISES
          </ThemedText>
          {workout.exercises.map((ex) => {
            const exercise = getExerciseById(ex.exerciseId);
            const best = ex.sets.reduce(
              (b, s) => (s.weight * s.reps > b.weight * b.reps ? s : b),
              ex.sets[0],
            );
            return (
              <Card key={ex.id} style={styles.exerciseRow}>
                <View style={{ flex: 1 }}>
                  <ThemedText type="body" style={styles.exerciseName}>
                    {exercise?.name ?? ex.exerciseId}
                  </ThemedText>
                  <ThemedText type="caption" style={styles.muted}>
                    {ex.sets.length} sets · best {fromKg(best?.weight ?? 0, weightUnit)} {weightUnit} × {best?.reps ?? 0}
                  </ThemedText>
                </View>
              </Card>
            );
          })}

          <View style={styles.actions}>
            <Button
              testID="workout-complete-share"
              title="Share workout"
              variant="secondary"
              fullWidth
              onPress={handleShare}
            />
            <Button
              testID="workout-complete-done"
              title="Done"
              variant="primary"
              fullWidth
              onPress={() => router.replace('/(tabs)')}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <ThemedText type="caption" style={styles.statLabel}>
        {label}
      </ThemedText>
      <ThemedText type="h2" style={styles.statValue}>
        {value}
      </ThemedText>
    </View>
  );
}

function formatSummary(
  workout: { name: string; exercises: { exerciseId: string; sets: { weight: number; reps: number }[] }[] },
  unit: 'kg' | 'lbs',
) {
  const lines = [`💪 ${workout.name}`];
  for (const ex of workout.exercises) {
    const name = getExerciseById(ex.exerciseId)?.name ?? ex.exerciseId;
    const setsText = ex.sets.map((s) => `${fromKg(s.weight, unit)}${unit} × ${s.reps}`).join(', ');
    lines.push(`• ${name}: ${setsText}`);
  }
  return lines.join('\n');
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.darkBackground },
  safeArea: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  hero: { alignItems: 'center', gap: Spacing.sm, marginVertical: Spacing.xl },
  heroIcon: { marginBottom: Spacing.xs },
  heroTitle: { color: Colors.neutral.textPrimary },
  heroSubtitle: { color: Colors.neutral.textSecondary },
  title: { color: Colors.neutral.textPrimary },
  prBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: 'rgba(255,176,32,0.15)',
    borderRadius: 999,
    marginTop: Spacing.sm,
  },
  prText: { color: Colors.semantic.pr, fontWeight: '700' },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  statLabel: {
    color: Colors.neutral.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: { color: Colors.primary.accentViolet, fontWeight: '700' },
  sectionLabel: {
    marginBottom: Spacing.sm,
  },
  exerciseRow: { marginBottom: Spacing.sm },
  exerciseName: { color: Colors.neutral.textPrimary, fontWeight: '600' },
  muted: { color: Colors.neutral.textSecondary, marginTop: 2 },
  actions: { gap: Spacing.sm, marginTop: Spacing.lg },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
});

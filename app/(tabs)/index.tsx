import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { fromKg, useSettings } from '@/contexts/SettingsContext';
import { useWorkouts } from '@/contexts/WorkoutContext';
import { getExerciseById } from '@/data/exercises';
import { computeWorkoutVolumeKg } from '@/utils/workoutStats';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { workouts, activeWorkout, startEmptyWorkout } = useWorkouts();
  const { weightUnit } = useSettings();

  const recent = useMemo(() => workouts.slice(0, 5), [workouts]);

  const handleStart = () => {
    if (!activeWorkout) startEmptyWorkout();
    router.push('/active-workout');
  };

  const greeting = user?.email?.split('@')[0] ?? 'Athlete';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <ThemedText type="caption" style={styles.greeting}>
                Welcome back
              </ThemedText>
              <ThemedText type="h1" style={styles.title}>
                {greeting}
              </ThemedText>
            </View>
            <View style={styles.avatar}>
              <IconSymbol name="person.fill" size={24} color={Colors.neutral.textPrimary} />
            </View>
          </View>

          {activeWorkout ? (
            <Card style={styles.activeCard}>
              <View style={styles.activeHeader}>
                <IconSymbol name="flame.fill" size={20} color={Colors.semantic.warning} />
                <ThemedText type="body" style={styles.activeLabel}>
                  Workout in progress
                </ThemedText>
              </View>
              <ThemedText type="h2" style={styles.activeName}>
                {activeWorkout.name}
              </ThemedText>
              <Button
                testID="home-resume-workout"
                title="Resume Workout"
                onPress={() => router.push('/active-workout')}
                variant="primary"
                fullWidth
                style={{ marginTop: Spacing.md }}
              />
            </Card>
          ) : (
            <Card style={styles.startCard}>
              <ThemedText type="h2" style={styles.startTitle}>
                Ready to train?
              </ThemedText>
              <ThemedText type="caption" style={styles.startSubtitle}>
                Start a quick session or pick a routine.
              </ThemedText>
              <Button
                testID="home-start-empty-workout"
                title="Start Empty Workout"
                onPress={handleStart}
                variant="primary"
                fullWidth
                style={{ marginTop: Spacing.md }}
              />
            </Card>
          )}

          <View style={styles.section}>
            <ThemedText type="caption" style={styles.sectionTitle}>
              YOUR FEED
            </ThemedText>
            {recent.length === 0 ? (
              <Card>
                <ThemedText type="body" style={styles.emptyTitle}>
                  No workouts yet
                </ThemedText>
                <ThemedText type="caption" style={styles.emptySubtitle}>
                  Finish your first workout to see it here.
                </ThemedText>
              </Card>
            ) : (
              recent.map((workout) => (
                <Card key={workout.id} style={styles.feedCard}>
                  <View style={styles.feedHeader}>
                    <View style={styles.feedAvatar}>
                      <IconSymbol name="person.fill" size={18} color={Colors.neutral.textPrimary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText type="body" style={styles.feedUser}>
                        {greeting}
                      </ThemedText>
                      <ThemedText type="small" style={styles.feedDate}>
                        {formatRelative(workout.startedAt)}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText type="h2" style={styles.feedTitle}>
                    {workout.name}
                  </ThemedText>
                  <View style={styles.feedStats}>
                    <Stat label="Time" value={formatDuration(workout.durationSeconds ?? 0)} />
                    <Stat label="Volume" value={`${Math.round(fromKg(computeWorkoutVolumeKg(workout), weightUnit))} ${weightUnit}`} />
                    <Stat label="Sets" value={String(totalSets(workout))} />
                  </View>
                  <View style={styles.feedExerciseList}>
                    {workout.exercises.slice(0, 4).map((ex) => {
                      const exercise = getExerciseById(ex.exerciseId);
                      const best = bestSet(ex.sets);
                      return (
                        <View key={ex.id} style={styles.feedExerciseRow}>
                          <ThemedText type="body" style={styles.feedExerciseName} numberOfLines={1}>
                            {ex.sets.length}× {exercise?.name ?? 'Exercise'}
                          </ThemedText>
                          {best ? (
                            <ThemedText type="caption" style={styles.feedExerciseBest}>
                              {fromKg(best.weight, weightUnit)} {weightUnit} × {best.reps}
                            </ThemedText>
                          ) : null}
                        </View>
                      );
                    })}
                    {workout.exercises.length > 4 ? (
                      <ThemedText type="caption" style={styles.feedExerciseBest}>
                        +{workout.exercises.length - 4} more
                      </ThemedText>
                    ) : null}
                  </View>
                </Card>
              ))
            )}
          </View>
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

function totalSets(workout: { exercises: { sets: unknown[] }[] }) {
  return workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
}

function bestSet(sets: { weight: number; reps: number }[]) {
  if (!sets.length) return null;
  return sets.reduce((best, set) =>
    set.weight * set.reps > best.weight * best.reps ? set : best,
  );
}

function formatDuration(seconds: number) {
  if (!seconds) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatRelative(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.darkBackground },
  safeArea: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl + Spacing.xl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: { color: Colors.neutral.textSecondary, marginBottom: 4 },
  title: { color: Colors.neutral.textPrimary },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.neutral.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startCard: { marginBottom: Spacing.lg },
  startTitle: { color: Colors.neutral.textPrimary, marginBottom: Spacing.xs },
  startSubtitle: { color: Colors.neutral.textSecondary },
  activeCard: { marginBottom: Spacing.lg, borderColor: Colors.primary.accentViolet, borderWidth: 1 },
  activeHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xs },
  activeLabel: { color: Colors.semantic.warning },
  activeName: { color: Colors.neutral.textPrimary },
  section: { marginTop: Spacing.md },
  sectionTitle: {
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  emptyTitle: { color: Colors.neutral.textPrimary, marginBottom: 4 },
  emptySubtitle: { color: Colors.neutral.textSecondary },
  feedCard: { marginBottom: Spacing.md },
  feedHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  feedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.neutral.elevatedBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedUser: { color: Colors.neutral.textPrimary },
  feedDate: { color: Colors.neutral.textTertiary },
  feedTitle: { color: Colors.neutral.textPrimary, marginBottom: Spacing.sm },
  feedStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.neutral.border,
  },
  statBlock: { flex: 1 },
  statLabel: { color: Colors.neutral.textSecondary, marginBottom: 2 },
  statValue: { color: Colors.neutral.textPrimary, fontWeight: '600' },
  feedExerciseList: { gap: 6 },
  feedExerciseRow: { flexDirection: 'row', justifyContent: 'space-between' },
  feedExerciseName: { color: Colors.neutral.textPrimary, flex: 1, marginRight: Spacing.sm },
  feedExerciseBest: { color: Colors.neutral.textSecondary },
});

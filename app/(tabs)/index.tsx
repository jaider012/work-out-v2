import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
import { computeStreak } from '@/utils/streak';
import { computeWorkoutVolumeKg } from '@/utils/workoutStats';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { workouts, activeWorkout, startEmptyWorkout, routines, startRoutine } = useWorkouts();
  const { weightUnit } = useSettings();

  const recent = useMemo(() => workouts.slice(0, 5), [workouts]);
  const streak = useMemo(() => computeStreak(workouts), [workouts]);
  const weekActivity = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6); // last 7 days including today
    return Array.from({ length: 7 }, (_, idx) => {
      const day = new Date(start);
      day.setDate(start.getDate() + idx);
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      const count = workouts.filter((w) => {
        const t = new Date(w.startedAt).getTime();
        return t >= day.getTime() && t < next.getTime();
      }).length;
      const isToday =
        day.getDate() === now.getDate() &&
        day.getMonth() === now.getMonth() &&
        day.getFullYear() === now.getFullYear();
      return { day, count, isToday };
    });
  }, [workouts]);

  const handleStart = () => {
    if (!activeWorkout) startEmptyWorkout();
    router.push('/active-workout');
  };

  const handleStartRoutine = (routineId: string) => {
    if (activeWorkout) {
      router.push('/active-workout');
      return;
    }
    startRoutine(routineId);
    router.push('/active-workout');
  };

  const quickRoutines = useMemo(() => routines.slice(0, 3), [routines]);

  const greeting = user?.email?.split('@')[0] ?? 'Athlete';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <ThemedText type="caption" style={styles.greeting}>
                Welcome back
              </ThemedText>
              <ThemedText type="h1" style={styles.title}>
                {greeting}
              </ThemedText>
            </View>
            {streak > 0 ? (
              <View style={styles.streakChip} testID="home-streak">
                <IconSymbol name="flame.fill" size={16} color={Colors.semantic.warning} />
                <ThemedText type="caption" style={styles.streakText}>
                  {streak}d
                </ThemedText>
              </View>
            ) : null}
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

          {quickRoutines.length > 0 ? (
            <View style={styles.section}>
              <ThemedText type="caption" style={styles.sectionTitle}>
                JUMP BACK IN
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: Spacing.sm }}
              >
                {quickRoutines.map((routine) => (
                  <Pressable
                    key={routine.id}
                    onPress={() => handleStartRoutine(routine.id)}
                    style={styles.quickRoutineCard}
                    testID={`home-routine-${routine.id}`}
                  >
                    <IconSymbol name="play.fill" size={18} color={Colors.primary.accentViolet} />
                    <ThemedText type="body" style={styles.quickRoutineName} numberOfLines={1}>
                      {routine.name}
                    </ThemedText>
                    <ThemedText type="caption" style={styles.quickRoutineMeta}>
                      {routine.exercises.length} exercises
                    </ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <View style={styles.activityStrip}>
            {weekActivity.map((entry, idx) => (
              <View key={idx} style={styles.activityCol}>
                <View
                  style={[
                    styles.activityDot,
                    entry.count > 0 && { backgroundColor: Colors.primary.accentViolet },
                    entry.isToday && { borderWidth: 1, borderColor: Colors.neutral.textPrimary },
                  ]}
                />
                <ThemedText type="small" style={styles.activityLabel}>
                  {entry.day
                    .toLocaleDateString(undefined, { weekday: 'short' })
                    .slice(0, 1)
                    .toUpperCase()}
                </ThemedText>
              </View>
            ))}
          </View>

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
    marginLeft: Spacing.sm,
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.neutral.cardBackground,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  streakText: { color: Colors.neutral.textPrimary, fontWeight: '700' },
  activityStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  activityCol: { alignItems: 'center', gap: Spacing.xs },
  activityDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.neutral.elevatedBackground,
  },
  activityLabel: { color: Colors.neutral.textSecondary },
  quickRoutineCard: {
    width: 180,
    backgroundColor: Colors.neutral.cardBackground,
    borderRadius: 12,
    padding: Spacing.md,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
  },
  quickRoutineName: { color: Colors.neutral.textPrimary, fontWeight: '600' },
  quickRoutineMeta: { color: Colors.neutral.textSecondary },
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

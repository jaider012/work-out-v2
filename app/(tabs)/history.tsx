import { useRouter } from 'expo-router';
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

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HistoryScreen() {
  const router = useRouter();
  const { workouts } = useWorkouts();
  const { weightUnit } = useSettings();

  const weekActivity = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // Monday
    return Array.from({ length: 7 }, (_, idx) => {
      const day = new Date(start);
      day.setDate(start.getDate() + idx);
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      const count = workouts.filter((w) => {
        const t = new Date(w.startedAt).getTime();
        return t >= day.getTime() && t < next.getTime();
      }).length;
      return { label: DAYS[idx], count, isToday: sameDay(day, now) };
    });
  }, [workouts]);

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof workouts>();
    for (const workout of workouts) {
      const date = new Date(workout.startedAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const list = groups.get(key) ?? [];
      list.push(workout);
      groups.set(key, list);
    }
    return Array.from(groups.entries());
  }, [workouts]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <ThemedText type="h1" style={styles.title}>
            History
          </ThemedText>
          <IconSymbol name="calendar" size={24} color={Colors.neutral.textPrimary} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.weekCard}>
            <ThemedText type="caption" style={styles.weekLabel}>
              THIS WEEK
            </ThemedText>
            <View style={styles.weekRow}>
              {weekActivity.map((day, idx) => (
                <View key={`${day.label}-${idx}`} style={styles.dayCol}>
                  <ThemedText type="small" style={styles.dayLabel}>
                    {day.label}
                  </ThemedText>
                  <View
                    style={[
                      styles.dayDot,
                      day.count > 0 && { backgroundColor: Colors.primary.accentViolet },
                      day.isToday && { borderWidth: 2, borderColor: Colors.neutral.textPrimary },
                    ]}
                  />
                </View>
              ))}
            </View>
          </Card>

          {workouts.length === 0 ? (
            <Card style={styles.emptyCard}>
              <IconSymbol name="dumbbell" size={36} color={Colors.neutral.textTertiary} />
              <ThemedText type="body" style={styles.emptyTitle}>
                No workouts logged yet
              </ThemedText>
              <ThemedText type="caption" style={styles.emptySubtitle}>
                Finish your first workout to see your history here.
              </ThemedText>
            </Card>
          ) : (
            grouped.map(([key, list]) => {
              const [year, month] = key.split('-').map(Number);
              const monthLabel = new Date(year, month).toLocaleString(undefined, {
                month: 'long',
                year: 'numeric',
              });
              return (
                <View key={key} style={styles.section}>
                  <ThemedText type="caption" style={styles.sectionLabel}>
                    {monthLabel.toUpperCase()}
                  </ThemedText>
                  {list.map((workout) => (
                    <TouchableOpacity
                      key={workout.id}
                      activeOpacity={0.8}
                      onPress={() => router.push(`/workout/${workout.id}`)}
                    >
                      <Card style={styles.workoutCard}>
                        <View style={styles.workoutHeader}>
                          <ThemedText type="body" style={styles.workoutName}>
                            {workout.name}
                          </ThemedText>
                          <ThemedText type="caption" style={styles.workoutDate}>
                            {new Date(workout.startedAt).toLocaleDateString()}
                          </ThemedText>
                        </View>
                        <View style={styles.workoutStats}>
                          <Stat label="Time" value={formatDuration(workout.durationSeconds)} />
                          <Stat label="Volume" value={`${Math.round(fromKg(computeWorkoutVolumeKg(workout), weightUnit))} ${weightUnit}`} />
                          <Stat label="Sets" value={String(totalSets(workout))} />
                        </View>
                        <ThemedText type="caption" style={styles.workoutPreview} numberOfLines={2}>
                          {workout.exercises
                            .map((ex) => getExerciseById(ex.exerciseId)?.name ?? '')
                            .filter(Boolean)
                            .slice(0, 4)
                            .join(' · ')}
                        </ThemedText>
                      </Card>
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })
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

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.darkBackground },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  title: { color: Colors.neutral.textPrimary },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl + Spacing.xl },
  weekCard: { marginBottom: Spacing.lg },
  weekLabel: {
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', flex: 1 },
  dayLabel: { color: Colors.neutral.textSecondary, marginBottom: Spacing.xs },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.neutral.elevatedBackground,
  },
  emptyCard: { alignItems: 'center', padding: Spacing.xl, gap: Spacing.sm },
  emptyTitle: { color: Colors.neutral.textPrimary, marginTop: Spacing.sm },
  emptySubtitle: { color: Colors.neutral.textSecondary, textAlign: 'center' },
  section: { marginBottom: Spacing.lg },
  sectionLabel: {
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  workoutCard: { marginBottom: Spacing.sm },
  workoutHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  workoutName: { color: Colors.neutral.textPrimary, fontWeight: '600' },
  workoutDate: { color: Colors.neutral.textSecondary },
  workoutStats: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.neutral.border,
    marginBottom: Spacing.sm,
  },
  statBlock: { flex: 1 },
  statLabel: { color: Colors.neutral.textSecondary, marginBottom: 2 },
  statValue: { color: Colors.neutral.textPrimary, fontWeight: '600' },
  workoutPreview: { color: Colors.neutral.textSecondary },
});

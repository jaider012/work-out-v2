import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MonthCalendar } from '@/components/MonthCalendar';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';
import { fromKg, useSettings } from '@/contexts/SettingsContext';
import { useWorkouts } from '@/contexts/WorkoutContext';
import { getExerciseById } from '@/data/exercises';
import { workoutsByDay } from '@/utils/streak';
import { computeWorkoutVolumeKg, formatDuration, totalSets } from '@/utils/workoutStats';

export default function HistoryScreen() {
  const router = useRouter();
  const { workouts, deleteWorkout } = useWorkouts();
  const { weightUnit } = useSettings();

  const handleLongPress = (workoutId: string, name: string) => {
    Alert.alert(name, 'Workout actions', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open', onPress: () => router.push(`/workout/${workoutId}`) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Delete workout?', `"${name}" will be removed from history.`, [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => deleteWorkout(workoutId),
            },
          ]),
      },
    ]);
  };

  const [month, setMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const dayMap = useMemo(() => workoutsByDay(workouts), [workouts]);

  const visibleWorkouts = useMemo(() => {
    if (selectedDay) {
      return workouts.filter((w) => {
        const d = new Date(w.startedAt);
        return (
          d.getFullYear() === selectedDay.getFullYear() &&
          d.getMonth() === selectedDay.getMonth() &&
          d.getDate() === selectedDay.getDate()
        );
      });
    }
    return workouts.filter((w) => {
      const d = new Date(w.startedAt);
      return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth();
    });
  }, [workouts, month, selectedDay]);

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof workouts>();
    for (const workout of visibleWorkouts) {
      const date = new Date(workout.startedAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const list = groups.get(key) ?? [];
      list.push(workout);
      groups.set(key, list);
    }
    return Array.from(groups.entries());
  }, [visibleWorkouts]);

  const handlePrev = () => {
    setMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
    setSelectedDay(null);
  };
  const handleNext = () => {
    setMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
    setSelectedDay(null);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <ThemedText type="h1" style={styles.title}>
            History
          </ThemedText>
          <ThemedText type="caption" style={styles.muted}>
            {workouts.length} workouts
          </ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.calendarCard}>
            <MonthCalendar
              month={month}
              workoutsByDay={dayMap}
              onPrev={handlePrev}
              onNext={handleNext}
              onSelectDay={(day) =>
                setSelectedDay((current) =>
                  current && current.getTime() === day.getTime() ? null : day,
                )
              }
              selectedDay={selectedDay}
            />
          </Card>

          {visibleWorkouts.length === 0 ? (
            <Card style={styles.emptyCard}>
              <ThemedText type="body" style={styles.emptyTitle}>
                {selectedDay ? 'No workout on this day' : 'No workouts this month'}
              </ThemedText>
              <ThemedText type="caption" style={styles.muted}>
                {selectedDay
                  ? 'Tap another day in the calendar.'
                  : 'Train to see them appear here.'}
              </ThemedText>
            </Card>
          ) : (
            grouped.map(([key, list]) => {
              const [year, monthIdx] = key.split('-').map(Number);
              const monthLabel = new Date(year, monthIdx).toLocaleString(undefined, {
                month: 'long',
                year: 'numeric',
              });
              return (
                <View key={key} style={styles.section}>
                  <ThemedText type="eyebrow" style={styles.sectionLabel}>
                    {monthLabel.toUpperCase()}
                  </ThemedText>
                  {list.map((workout) => (
                    <TouchableOpacity
                      key={workout.id}
                      activeOpacity={0.8}
                      onPress={() => router.push(`/workout/${workout.id}`)}
                      onLongPress={() => handleLongPress(workout.id, workout.name)}
                      delayLongPress={300}
                    >
                      <Card style={styles.workoutCard}>
                        <View style={styles.workoutHeader}>
                          <ThemedText type="body" style={styles.workoutName}>
                            {workout.name}
                          </ThemedText>
                          <ThemedText type="caption" style={styles.muted}>
                            {new Date(workout.startedAt).toLocaleDateString()}
                          </ThemedText>
                        </View>
                        <View style={styles.workoutStats}>
                          <Stat label="Time" value={formatDuration(workout.durationSeconds)} />
                          <Stat
                            label="Volume"
                            value={`${Math.round(fromKg(computeWorkoutVolumeKg(workout), weightUnit))} ${weightUnit}`}
                          />
                          <Stat label="Sets" value={String(totalSets(workout))} />
                        </View>
                        <ThemedText type="caption" style={styles.muted} numberOfLines={2}>
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
  muted: { color: Colors.neutral.textSecondary },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl + Spacing.xl },
  calendarCard: { marginBottom: Spacing.lg, paddingVertical: Spacing.md },
  emptyCard: { alignItems: 'center', padding: Spacing.xl, gap: Spacing.sm },
  emptyTitle: { color: Colors.neutral.textPrimary },
  section: { marginBottom: Spacing.lg },
  sectionLabel: {
    marginBottom: Spacing.sm,
  },
  workoutCard: { marginBottom: Spacing.sm },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  workoutName: { color: Colors.neutral.textPrimary, fontWeight: '600' },
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
});

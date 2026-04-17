import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';
import { useWorkouts } from '@/contexts/WorkoutContext';
import { DISCOVER_ROUTINES } from '@/data/discoverRoutines';
import { getExerciseById } from '@/data/exercises';

export default function WorkoutScreen() {
  const router = useRouter();
  const {
    routines,
    folders,
    activeWorkout,
    startEmptyWorkout,
    startRoutine,
    duplicateRoutine,
    deleteRoutine,
    saveRoutine,
  } = useWorkouts();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');

  const onRoutineLongPress = (routineId: string, name: string) => {
    Alert.alert(name, 'Routine actions', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Edit', onPress: () => router.push(`/routine/${routineId}`) },
      {
        text: 'Duplicate',
        onPress: async () => {
          await duplicateRoutine(routineId);
        },
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Delete routine?', `"${name}" will be removed.`, [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => deleteRoutine(routineId),
            },
          ]);
        },
      },
    ]);
  };

  const filteredRoutines = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return routines;
    return routines.filter((r) => {
      if (r.name.toLowerCase().includes(term)) return true;
      return r.exercises.some((ex) => {
        const name = getExerciseById(ex.exerciseId)?.name ?? '';
        return name.toLowerCase().includes(term);
      });
    });
  }, [routines, search]);

  const grouped = useMemo(() => {
    const map = new Map<string | undefined, typeof routines>();
    for (const r of filteredRoutines) {
      const list = map.get(r.folderId) ?? [];
      list.push(r);
      map.set(r.folderId, list);
    }
    return map;
  }, [filteredRoutines]);

  const handleStartEmpty = () => {
    if (!activeWorkout) startEmptyWorkout();
    router.push('/active-workout');
  };

  const handleStartRoutine = (routineId: string) => {
    startRoutine(routineId);
    router.push('/active-workout');
  };

  const toggleFolder = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <ThemedText type="h1" style={styles.title}>
            Workout
          </ThemedText>
          <TouchableOpacity activeOpacity={0.7} onPress={() => {}}>
            <IconSymbol name="plus" size={26} color={Colors.neutral.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.quickStartCard}>
            <View style={styles.quickStartHeader}>
              <View style={styles.quickStartIcon}>
                <IconSymbol name="plus" size={26} color={Colors.primary.accentViolet} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="h2" style={styles.quickStartTitle}>
                  Quick Start
                </ThemedText>
                <ThemedText type="caption" style={styles.quickStartSubtitle}>
                  {activeWorkout ? 'Resume your workout' : 'Start an empty workout'}
                </ThemedText>
              </View>
            </View>
            <Button
              testID="workout-quick-start"
              title={activeWorkout ? 'Resume Workout' : 'Start Empty Workout'}
              onPress={handleStartEmpty}
              variant="primary"
              fullWidth
            />
          </Card>

          <View style={styles.sectionHeaderRow}>
            <ThemedText type="caption" style={styles.sectionLabel}>
              ROUTINES
            </ThemedText>
            <TouchableOpacity
              testID="workout-new-routine"
              activeOpacity={0.7}
              onPress={() => router.push('/routine/new')}
            >
              <ThemedText type="caption" style={styles.actionText}>
                + New Routine
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <IconSymbol name="magnifyingglass" size={16} color={Colors.neutral.textSecondary} />
            <TextInput
              testID="workout-search"
              value={search}
              onChangeText={setSearch}
              placeholder="Search routines or exercises"
              placeholderTextColor={Colors.neutral.textTertiary}
              style={styles.searchInput}
            />
          </View>

          {filteredRoutines.length === 0 ? (
            <Card style={styles.emptyCard}>
              <IconSymbol name="folder.fill" size={32} color={Colors.neutral.textTertiary} />
              <ThemedText type="body" style={styles.emptyTitle}>
                {search ? 'No routines match your search' : 'No routines yet'}
              </ThemedText>
              <ThemedText type="caption" style={styles.routinePreview}>
                {search
                  ? 'Try a different exercise or routine name.'
                  : 'Create one above or copy a Discover routine below.'}
              </ThemedText>
            </Card>
          ) : null}

          {folders.map((folder) => {
            const folderRoutines = grouped.get(folder.id) ?? [];
            const isCollapsed = collapsed[folder.id];
            return (
              <View key={folder.id} style={styles.folder}>
                <TouchableOpacity
                  style={styles.folderHeader}
                  activeOpacity={0.7}
                  onPress={() => toggleFolder(folder.id)}
                >
                  <IconSymbol
                    name={isCollapsed ? 'chevron.right' : 'chevron.down'}
                    size={16}
                    color={Colors.neutral.textSecondary}
                  />
                  <IconSymbol name="folder.fill" size={18} color={Colors.primary.accentViolet} />
                  <ThemedText type="body" style={styles.folderName}>
                    {folder.name}
                  </ThemedText>
                  <ThemedText type="caption" style={styles.folderCount}>
                    {folderRoutines.length}
                  </ThemedText>
                </TouchableOpacity>
                {!isCollapsed &&
                  folderRoutines.map((routine) => (
                    <RoutineRow
                      key={routine.id}
                      name={routine.name}
                      exerciseNames={routine.exercises
                        .map((ex) => getExerciseById(ex.exerciseId)?.name ?? 'Exercise')
                        .filter(Boolean)}
                      onStart={() => handleStartRoutine(routine.id)}
                      onPress={() => router.push(`/routine/preview/${routine.id}`)}
                      onLongPress={() => onRoutineLongPress(routine.id, routine.name)}
                    />
                  ))}
              </View>
            );
          })}

          <View style={styles.sectionHeaderRow}>
            <ThemedText type="caption" style={styles.sectionLabel}>
              DISCOVER
            </ThemedText>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.discoverRow}
            style={{ marginBottom: Spacing.lg }}
          >
            {DISCOVER_ROUTINES.map((discover) => (
              <View key={discover.id} style={styles.discoverCard}>
                <ThemedText type="body" style={styles.discoverTitle}>
                  {discover.name}
                </ThemedText>
                <ThemedText type="caption" style={styles.discoverDescription} numberOfLines={3}>
                  {discover.description}
                </ThemedText>
                <ThemedText type="caption" style={styles.discoverMeta}>
                  {discover.exercises.length} exercises
                </ThemedText>
                <Button
                  title="Copy to my routines"
                  variant="secondary"
                  size="small"
                  testID={`discover-copy-${discover.id}`}
                  onPress={async () => {
                    const copy = {
                      ...discover,
                      id: `routine-${Date.now()}-${Math.random()}`,
                      name: discover.name,
                      exercises: discover.exercises.map((ex, idx) => ({
                        id: `${discover.id}-copy-${idx}`,
                        exerciseId: ex.exerciseId,
                        sets: ex.sets.map((s, setIdx) => ({
                          ...s,
                          id: `${discover.id}-copy-${idx}-set-${setIdx}`,
                        })),
                      })),
                    };
                    await saveRoutine(copy);
                    Alert.alert('Copied', `"${copy.name}" added to your routines.`);
                  }}
                />
              </View>
            ))}
          </ScrollView>

          {(grouped.get(undefined) ?? []).length > 0 ? (
            <View style={styles.folder}>
              <ThemedText type="caption" style={styles.folderName}>
                Other
              </ThemedText>
              {(grouped.get(undefined) ?? []).map((routine) => (
                <RoutineRow
                  key={routine.id}
                  name={routine.name}
                  exerciseNames={routine.exercises
                    .map((ex) => getExerciseById(ex.exerciseId)?.name ?? 'Exercise')
                    .filter(Boolean)}
                  onStart={() => handleStartRoutine(routine.id)}
                  onPress={() => router.push(`/routine/preview/${routine.id}`)}
                  onLongPress={() => onRoutineLongPress(routine.id, routine.name)}
                />
              ))}
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function RoutineRow({
  name,
  exerciseNames,
  onStart,
  onPress,
  onLongPress,
}: {
  name: string;
  exerciseNames: string[];
  onStart: () => void;
  onPress?: () => void;
  onLongPress?: () => void;
}) {
  const preview = exerciseNames.slice(0, 3).join(', ');
  const remaining = Math.max(0, exerciseNames.length - 3);
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={300}
    >
      <Card style={styles.routineCard}>
        <View style={styles.routineRow}>
          <View style={{ flex: 1, marginRight: Spacing.sm }}>
            <ThemedText type="body" style={styles.routineName}>
              {name}
            </ThemedText>
            <ThemedText type="caption" style={styles.routinePreview} numberOfLines={2}>
              {preview}
              {remaining > 0 ? `, +${remaining} more` : ''}
            </ThemedText>
          </View>
          <Button
            testID={`routine-start-${name.toLowerCase().replace(/\s+/g, '-')}`}
            title="Start"
            onPress={onStart}
            variant="primary"
            size="small"
          />
        </View>
      </Card>
    </TouchableOpacity>
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
  quickStartCard: { marginBottom: Spacing.lg },
  quickStartHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  quickStartIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.neutral.elevatedBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStartTitle: { color: Colors.neutral.textPrimary },
  quickStartSubtitle: { color: Colors.neutral.textSecondary },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    color: Colors.neutral.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  actionText: { color: Colors.primary.accentViolet, fontWeight: '600' },
  folder: { marginBottom: Spacing.lg },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  folderName: { color: Colors.neutral.textPrimary, flex: 1 },
  folderCount: { color: Colors.neutral.textSecondary },
  routineCard: { marginBottom: Spacing.sm },
  routineRow: { flexDirection: 'row', alignItems: 'center' },
  routineName: { color: Colors.neutral.textPrimary, fontWeight: '600' },
  routinePreview: { color: Colors.neutral.textSecondary, marginTop: 2 },
  discoverRow: { gap: Spacing.sm, paddingBottom: 4 },
  discoverCard: {
    width: 240,
    marginRight: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 14,
    backgroundColor: Colors.neutral.cardBackground,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    gap: Spacing.xs,
  },
  discoverTitle: { color: Colors.neutral.textPrimary, fontWeight: '700' },
  discoverDescription: { color: Colors.neutral.textSecondary, minHeight: 48 },
  discoverMeta: { color: Colors.neutral.textTertiary, marginBottom: Spacing.xs },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.cardBackground,
    borderRadius: 10,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  searchInput: { flex: 1, color: Colors.neutral.textPrimary, paddingVertical: Spacing.sm },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  emptyTitle: { color: Colors.neutral.textPrimary },
});

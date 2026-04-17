import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
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
import { useExercisePickerBus } from '@/contexts/ExercisePickerBus';
import { useWorkouts } from '@/contexts/WorkoutContext';
import { EQUIPMENT_LABELS, EXERCISES, MUSCLE_LABELS } from '@/data/exercises';
import type { Equipment, Exercise, MuscleGroup } from '@/types/workout';

const MUSCLE_FILTERS: ('all' | MuscleGroup)[] = [
  'all',
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'quads',
  'hamstrings',
  'glutes',
  'abs',
  'cardio',
];

const EQUIPMENT_FILTERS: ('all' | Equipment)[] = [
  'all',
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bodyweight',
];

export default function ExercisePickerScreen() {
  const router = useRouter();
  const { addExercisesToActive } = useWorkouts();
  const pickerBus = useExercisePickerBus();
  const params = useLocalSearchParams<{ mode?: string }>();

  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<'all' | MuscleGroup>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<'all' | Equipment>('all');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return EXERCISES.filter((exercise) => {
      const matchesSearch = !term || exercise.name.toLowerCase().includes(term);
      const matchesMuscle = muscleFilter === 'all' || exercise.primaryMuscle === muscleFilter;
      const matchesEquipment =
        equipmentFilter === 'all' || exercise.equipment === equipmentFilter;
      return matchesSearch && matchesMuscle && matchesEquipment;
    });
  }, [search, muscleFilter, equipmentFilter]);

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
    );
  };

  const handleAdd = () => {
    if (selected.length === 0) return;
    if (params.mode === 'active') {
      addExercisesToActive(selected);
    } else if (params.mode === 'routine') {
      pickerBus.publish(selected);
    }
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <ThemedText type="body" style={styles.cancel}>
              Cancel
            </ThemedText>
          </TouchableOpacity>
          <ThemedText type="h2" style={styles.title}>
            Add Exercise
          </ThemedText>
          <TouchableOpacity
            testID="exercise-picker-add"
            onPress={handleAdd}
            activeOpacity={0.7}
            disabled={selected.length === 0}
          >
            <ThemedText
              type="body"
              style={[
                styles.add,
                selected.length === 0 && { color: Colors.neutral.textTertiary },
              ]}
            >
              Add ({selected.length})
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <IconSymbol name="magnifyingglass" size={18} color={Colors.neutral.textSecondary} />
          <TextInput
            testID="exercise-picker-search"
            value={search}
            onChangeText={setSearch}
            placeholder="Search exercises"
            placeholderTextColor={Colors.neutral.textTertiary}
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={MUSCLE_FILTERS}
          horizontal
          keyExtractor={(item) => `muscle-${item}`}
          contentContainerStyle={styles.filterRow}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const isActive = item === muscleFilter;
            return (
              <TouchableOpacity
                onPress={() => setMuscleFilter(item)}
                activeOpacity={0.7}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                testID={`filter-muscle-${item}`}
              >
                <ThemedText
                  type="caption"
                  style={[
                    styles.filterText,
                    isActive && { color: Colors.neutral.textPrimary, fontWeight: '700' },
                  ]}
                >
                  {item === 'all' ? 'All' : MUSCLE_LABELS[item]}
                </ThemedText>
              </TouchableOpacity>
            );
          }}
        />

        <FlatList
          data={EQUIPMENT_FILTERS}
          horizontal
          keyExtractor={(item) => `equipment-${item}`}
          contentContainerStyle={styles.filterRow}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const isActive = item === equipmentFilter;
            return (
              <TouchableOpacity
                onPress={() => setEquipmentFilter(item)}
                activeOpacity={0.7}
                style={[
                  styles.filterChip,
                  isActive && styles.filterChipActive,
                  { borderWidth: 1, borderColor: Colors.neutral.border },
                ]}
                testID={`filter-equipment-${item}`}
              >
                <ThemedText
                  type="caption"
                  style={[
                    styles.filterText,
                    isActive && { color: Colors.neutral.textPrimary, fontWeight: '700' },
                  ]}
                >
                  {item === 'all' ? 'Any equipment' : EQUIPMENT_LABELS[item]}
                </ThemedText>
              </TouchableOpacity>
            );
          }}
        />

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item }) => (
            <ExerciseRow
              exercise={item}
              selected={selected.includes(item.id)}
              onPress={() => toggle(item.id)}
            />
          )}
          ListEmptyComponent={
            <ThemedText type="caption" style={styles.empty}>
              No exercises match your filters.
            </ThemedText>
          }
        />

        {selected.length > 0 ? (
          <View style={styles.footer}>
            <Button title={`Add ${selected.length} exercise${selected.length === 1 ? '' : 's'}`} onPress={handleAdd} variant="primary" fullWidth />
          </View>
        ) : null}
      </SafeAreaView>
    </ThemedView>
  );
}

function ExerciseRow({
  exercise,
  selected,
  onPress,
}: {
  exercise: Exercise;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      testID={`exercise-row-${exercise.id}`}
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.exerciseRow}
    >
      <View
        style={[
          styles.exerciseIcon,
          selected && { backgroundColor: Colors.primary.accentViolet },
        ]}
      >
        <ThemedText type="body" style={styles.exerciseInitial}>
          {exercise.name.charAt(0)}
        </ThemedText>
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText type="body" style={styles.exerciseName}>
          {exercise.name}
        </ThemedText>
        <ThemedText type="caption" style={styles.exerciseMeta}>
          {MUSCLE_LABELS[exercise.primaryMuscle]} · {EQUIPMENT_LABELS[exercise.equipment]}
        </ThemedText>
      </View>
      {selected ? (
        <IconSymbol name="checkmark.circle.fill" size={22} color={Colors.primary.accentViolet} />
      ) : (
        <IconSymbol name="plus.circle.fill" size={22} color={Colors.neutral.textTertiary} />
      )}
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
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.border,
  },
  title: { color: Colors.neutral.textPrimary },
  cancel: { color: Colors.neutral.textSecondary },
  add: { color: Colors.primary.accentViolet, fontWeight: '700' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.neutral.cardBackground,
    borderRadius: 10,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    color: Colors.neutral.textPrimary,
    paddingVertical: Spacing.sm,
  },
  filterRow: { paddingHorizontal: Spacing.md, gap: Spacing.xs, paddingBottom: Spacing.sm },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.neutral.cardBackground,
    marginRight: Spacing.xs,
  },
  filterChipActive: { backgroundColor: Colors.primary.accentViolet },
  filterText: { color: Colors.neutral.textSecondary },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 120 },
  divider: { height: 1, backgroundColor: Colors.neutral.border },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral.elevatedBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseInitial: { color: Colors.neutral.textPrimary, fontWeight: '700' },
  exerciseName: { color: Colors.neutral.textPrimary, fontWeight: '600' },
  exerciseMeta: { color: Colors.neutral.textSecondary, marginTop: 2 },
  empty: { color: Colors.neutral.textSecondary, textAlign: 'center', marginTop: Spacing.lg },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: Colors.neutral.darkBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.border,
  },
});

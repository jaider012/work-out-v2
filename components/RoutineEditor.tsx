import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
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
import { getExerciseById } from '@/data/exercises';
import type { Routine, WorkoutExercise } from '@/types/workout';

let counter = 0;
const newId = (prefix: string) => `${prefix}-${Date.now()}-${++counter}`;

interface RoutineEditorProps {
  routineId?: string;
}

export function RoutineEditor({ routineId }: RoutineEditorProps) {
  const router = useRouter();
  const { routines, folders, saveRoutine, deleteRoutine, createFolder } = useWorkouts();
  const pickerBus = useExercisePickerBus();

  const existing = useMemo(
    () => (routineId ? routines.find((r) => r.id === routineId) : undefined),
    [routines, routineId],
  );

  const [name, setName] = useState(existing?.name ?? '');
  const [folderId, setFolderId] = useState<string | undefined>(existing?.folderId);
  const [exercises, setExercises] = useState<WorkoutExercise[]>(existing?.exercises ?? []);
  const [folderSheetOpen, setFolderSheetOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Listen for exercises picked from the picker (subscribe + cleanup).
  useEffect(() => {
    const unsubscribe = pickerBus.subscribe((ids) => {
      setExercises((prev) => [
        ...prev,
        ...ids.map<WorkoutExercise>((exerciseId) => ({
          id: newId('we'),
          exerciseId,
          sets: [
            { id: newId('set'), weight: 0, reps: 0, completed: false, type: 'normal' },
          ],
        })),
      ]);
    });
    return unsubscribe;
  }, [pickerBus]);

  const handleAddExercises = () => {
    router.push({ pathname: '/exercise-picker', params: { mode: 'routine' } });
  };

  const removeExercise = (id: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  };

  const moveExercise = (id: string, direction: 'up' | 'down') => {
    setExercises((prev) => {
      const idx = prev.findIndex((ex) => ex.id === id);
      if (idx === -1) return prev;
      const target = direction === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const addSet = (id: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === id
          ? {
              ...ex,
              sets: [
                ...ex.sets,
                { id: newId('set'), weight: 0, reps: 0, completed: false, type: 'normal' },
              ],
            }
          : ex,
      ),
    );
  };

  const removeSet = (id: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === id ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) } : ex,
      ),
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Give your routine a name.');
      return;
    }
    if (exercises.length === 0) {
      Alert.alert('Add exercises', 'Add at least one exercise to save the routine.');
      return;
    }
    const routine: Routine = {
      id: existing?.id ?? newId('routine'),
      name: name.trim(),
      folderId,
      updatedAt: new Date().toISOString(),
      exercises,
    };
    await saveRoutine(routine);
    router.back();
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert('Delete routine?', `"${existing.name}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteRoutine(existing.id);
          router.back();
        },
      },
    ]);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setFolderSheetOpen(false);
      return;
    }
    const folder = await createFolder(newFolderName.trim());
    setFolderId(folder.id);
    setNewFolderName('');
    setFolderSheetOpen(false);
  };

  const folderName = folders.find((f) => f.id === folderId)?.name ?? 'No folder';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <ThemedText type="body" style={styles.cancel}>
              Cancel
            </ThemedText>
          </TouchableOpacity>
          <ThemedText type="h2" style={styles.title}>
            {existing ? 'Edit Routine' : 'New Routine'}
          </ThemedText>
          <TouchableOpacity onPress={handleSave} activeOpacity={0.7} testID="routine-save">
            <ThemedText type="body" style={styles.save}>
              Save
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TextInput
            testID="routine-name"
            value={name}
            onChangeText={setName}
            placeholder="Routine name"
            placeholderTextColor={Colors.neutral.textTertiary}
            style={styles.nameInput}
          />

          <Pressable style={styles.folderRow} onPress={() => setFolderSheetOpen(true)}>
            <IconSymbol name="folder.fill" size={18} color={Colors.primary.accentViolet} />
            <ThemedText type="body" style={styles.folderText}>
              {folderName}
            </ThemedText>
            <IconSymbol name="chevron.right" size={16} color={Colors.neutral.textSecondary} />
          </Pressable>

          {exercises.length === 0 ? (
            <ThemedText type="caption" style={styles.empty}>
              No exercises yet. Tap “Add exercises” to get started.
            </ThemedText>
          ) : (
            exercises.map((ex, exerciseIndex) => {
              const exercise = getExerciseById(ex.exerciseId);
              const isFirst = exerciseIndex === 0;
              const isLast = exerciseIndex === exercises.length - 1;
              return (
                <View key={ex.id} style={styles.exerciseBlock}>
                  <View style={styles.exerciseHeader}>
                    <View style={{ flex: 1 }}>
                      <ThemedText type="body" style={styles.exerciseName}>
                        {exercise?.name ?? 'Exercise'}
                      </ThemedText>
                      {exercise ? (
                        <ThemedText type="caption" style={styles.exerciseMeta}>
                          {exercise.primaryMuscle} · {exercise.equipment}
                        </ThemedText>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      onPress={() => moveExercise(ex.id, 'up')}
                      hitSlop={6}
                      disabled={isFirst}
                      style={{ opacity: isFirst ? 0.3 : 1 }}
                      testID={`routine-move-up-${ex.id}`}
                    >
                      <IconSymbol name="chevron.up" size={18} color={Colors.neutral.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => moveExercise(ex.id, 'down')}
                      hitSlop={6}
                      disabled={isLast}
                      style={{ opacity: isLast ? 0.3 : 1, marginLeft: Spacing.sm }}
                      testID={`routine-move-down-${ex.id}`}
                    >
                      <IconSymbol name="chevron.down" size={18} color={Colors.neutral.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeExercise(ex.id)}
                      hitSlop={10}
                      style={{ marginLeft: Spacing.sm }}
                    >
                      <IconSymbol name="trash" size={18} color={Colors.semantic.error} />
                    </TouchableOpacity>
                  </View>
                  {ex.sets.map((set, idx) => (
                    <View key={set.id} style={styles.setRow}>
                      <ThemedText type="body" style={styles.setIndex}>
                        Set {idx + 1}
                      </ThemedText>
                      <TouchableOpacity onPress={() => removeSet(ex.id, set.id)} hitSlop={10}>
                        <ThemedText type="caption" style={{ color: Colors.semantic.error }}>
                          Remove
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.addSet}
                    onPress={() => addSet(ex.id)}
                    activeOpacity={0.7}
                    testID={`routine-add-set-${ex.id}`}
                  >
                    <IconSymbol name="plus" size={16} color={Colors.primary.accentViolet} />
                    <ThemedText type="caption" style={styles.addSetText}>
                      Add Set
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              );
            })
          )}

          <Button
            testID="routine-add-exercise"
            title="Add exercises"
            variant="primary"
            fullWidth
            onPress={handleAddExercises}
            style={{ marginTop: Spacing.lg }}
          />

          {existing ? (
            <Button
              testID="routine-delete"
              title="Delete routine"
              variant="destructive"
              fullWidth
              onPress={handleDelete}
              style={{ marginTop: Spacing.md }}
            />
          ) : null}
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={folderSheetOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFolderSheetOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setFolderSheetOpen(false)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <ThemedText type="h2" style={styles.sheetTitle}>
              Folder
            </ThemedText>
            <Pressable
              onPress={() => {
                setFolderId(undefined);
                setFolderSheetOpen(false);
              }}
              style={styles.folderOption}
            >
              <ThemedText type="body" style={styles.folderOptionText}>
                No folder
              </ThemedText>
            </Pressable>
            {folders.map((folder) => (
              <Pressable
                key={folder.id}
                onPress={() => {
                  setFolderId(folder.id);
                  setFolderSheetOpen(false);
                }}
                style={styles.folderOption}
              >
                <ThemedText type="body" style={styles.folderOptionText}>
                  {folder.name}
                </ThemedText>
              </Pressable>
            ))}
            <View style={styles.newFolderRow}>
              <TextInput
                value={newFolderName}
                onChangeText={setNewFolderName}
                placeholder="New folder"
                placeholderTextColor={Colors.neutral.textTertiary}
                style={styles.newFolderInput}
              />
              <Button title="Create" onPress={handleCreateFolder} variant="primary" size="small" />
            </View>
          </View>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.darkBackground },
  safeArea: { flex: 1 },
  topBar: {
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
  save: { color: Colors.primary.accentViolet, fontWeight: '700' },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  nameInput: {
    color: Colors.neutral.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.neutral.cardBackground,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.lg,
  },
  folderText: { color: Colors.neutral.textPrimary, flex: 1 },
  empty: { color: Colors.neutral.textSecondary, textAlign: 'center', marginVertical: Spacing.lg },
  exerciseBlock: {
    backgroundColor: Colors.neutral.cardBackground,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  exerciseName: { color: Colors.primary.accentViolet, fontWeight: '600' },
  exerciseMeta: { color: Colors.neutral.textSecondary, marginTop: 2 },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  setIndex: { color: Colors.neutral.textPrimary },
  addSet: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral.elevatedBackground,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    marginTop: Spacing.xs,
  },
  addSetText: { color: Colors.primary.accentViolet },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.neutral.cardBackground,
    padding: Spacing.lg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: Spacing.sm,
  },
  sheetTitle: { color: Colors.neutral.textPrimary, marginBottom: Spacing.sm },
  folderOption: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.border,
  },
  folderOptionText: { color: Colors.neutral.textPrimary },
  newFolderRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', marginTop: Spacing.sm },
  newFolderInput: {
    flex: 1,
    color: Colors.neutral.textPrimary,
    backgroundColor: Colors.neutral.elevatedBackground,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
});

import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
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

import { RestTimerOverlay } from '@/components/RestTimerOverlay';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';
import { DEFAULT_REST_SECONDS, useWorkouts } from '@/contexts/WorkoutContext';
import { useRestTimer } from '@/contexts/RestTimerContext';
import { fromKg, toKg, useSettings } from '@/contexts/SettingsContext';
import { getExerciseById } from '@/data/exercises';
import { previousSession, estimateOneRepMax, bestOneRepMax } from '@/utils/exerciseHistory';
import { computeWorkoutVolumeKg, totalSets } from '@/utils/workoutStats';

const REST_PRESETS = [60, 90, 120, 180, 240];
const SET_TYPE_ORDER = ['normal', 'warmup', 'failure', 'drop'] as const;
type SetType = (typeof SET_TYPE_ORDER)[number];

function nextSetType(type: SetType): SetType {
  const idx = SET_TYPE_ORDER.indexOf(type);
  return SET_TYPE_ORDER[(idx + 1) % SET_TYPE_ORDER.length];
}

function setTypeLabel(type: SetType, index: number) {
  switch (type) {
    case 'warmup':
      return 'W';
    case 'failure':
      return 'F';
    case 'drop':
      return 'D';
    default:
      return String(index + 1);
  }
}

function setTypeBadgeStyle(type: SetType) {
  switch (type) {
    case 'warmup':
      return { backgroundColor: '#3A4A7A', borderColor: '#7C9CFF' };
    case 'failure':
      return { backgroundColor: '#5C2A2A', borderColor: '#FF7070' };
    case 'drop':
      return { backgroundColor: '#4A3A7A', borderColor: '#A07CFF' };
    default:
      return { backgroundColor: 'transparent', borderColor: 'transparent' };
  }
}

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const {
    activeWorkout,
    workouts,
    finishActiveWorkout,
    discardActiveWorkout,
    removeExerciseFromActive,
    addSetToExercise,
    updateSet,
    removeSet,
    updateActiveWorkout,
    setExerciseRest,
    setExerciseNotes,
    moveExercise,
    saveActiveAsRoutine,
  } = useWorkouts();
  const restTimer = useRestTimer();
  const { weightUnit } = useSettings();

  const [, force] = useState(0);
  const [restSheetFor, setRestSheetFor] = useState<string | null>(null);
  const [saveSheetOpen, setSaveSheetOpen] = useState(false);
  const [saveRoutineName, setSaveRoutineName] = useState('');

  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const lastWorkoutAgo = useMemo(() => {
    const last = workouts[0];
    if (!last) return null;
    const diffMs = Date.now() - new Date(last.startedAt).getTime();
    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  }, [workouts]);

  const completedSets = useMemo(
    () =>
      activeWorkout
        ? activeWorkout.exercises.reduce(
            (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
            0,
          )
        : 0,
    [activeWorkout],
  );
  const volume = useMemo(
    () =>
      activeWorkout
        ? computeWorkoutVolumeKg({
            exercises: activeWorkout.exercises.map((ex) => ({
              ...ex,
              sets: ex.sets.filter((s) => s.completed),
            })),
          })
        : 0,
    [activeWorkout],
  );

  if (!activeWorkout) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyState}>
            <IconSymbol name="dumbbell" size={48} color={Colors.neutral.textTertiary} />
            <ThemedText type="h2" style={styles.emptyTitle}>
              No active workout
            </ThemedText>
            <Button title="Close" variant="secondary" onPress={() => router.back()} />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const elapsed = Math.max(
    0,
    Math.round((Date.now() - new Date(activeWorkout.startedAt).getTime()) / 1000),
  );

  const handleSetCheck = (
    workoutExerciseId: string,
    setId: string,
    nextCompleted: boolean,
    restSeconds: number | undefined,
  ) => {
    updateSet(workoutExerciseId, setId, { completed: nextCompleted });
    if (nextCompleted) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      restTimer.start(restSeconds ?? DEFAULT_REST_SECONDS);
    }
  };

  const handleFinish = async () => {
    if (completedSets === 0) {
      Alert.alert(
        'Finish workout?',
        'You have not completed any sets. Finish anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Finish', onPress: doFinish },
        ],
      );
      return;
    }
    doFinish();
  };

  const doFinish = async () => {
    const result = await finishActiveWorkout();
    restTimer.stop();
    if (result?.newPRs.length) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      Alert.alert(
        '🏆 New personal record!',
        `You set ${result.newPRs.length} new PR${result.newPRs.length === 1 ? '' : 's'} this workout.`,
      );
    }
    if (result) {
      router.replace('/(tabs)');
    } else {
      router.back();
    }
  };

  const handleDiscard = () => {
    Alert.alert('Discard workout?', 'You will lose all your logged sets.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: async () => {
          await discardActiveWorkout();
          restTimer.stop();
          router.back();
        },
      },
    ]);
  };

  const handleSaveAsRoutine = async () => {
    const name = saveRoutineName.trim() || activeWorkout.name;
    const routine = await saveActiveAsRoutine(name);
    setSaveSheetOpen(false);
    setSaveRoutineName('');
    if (routine) {
      Alert.alert('Saved', `Routine "${routine.name}" saved.`);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <IconSymbol name="chevron.down" size={26} color={Colors.neutral.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <ThemedText type="caption" style={styles.timerLabel}>
              DURATION
            </ThemedText>
            <ThemedText type="h2" style={styles.timer}>
              {formatTimer(elapsed)}
            </ThemedText>
          </View>
          <TouchableOpacity
            testID="active-workout-finish"
            onPress={handleFinish}
            activeOpacity={0.7}
          >
            <ThemedText type="body" style={styles.finishText}>
              Finish
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <ThemedText type="caption" style={styles.statLabel}>
              VOLUME
            </ThemedText>
            <ThemedText type="body" style={styles.statValue}>
              {Math.round(fromKg(volume, weightUnit))} {weightUnit}
            </ThemedText>
          </View>
          <View style={styles.statBlock}>
            <ThemedText type="caption" style={styles.statLabel}>
              SETS
            </ThemedText>
            <ThemedText type="body" style={styles.statValue}>
              {completedSets} / {totalSets(activeWorkout)}
            </ThemedText>
          </View>
          <Pressable onPress={() => setSaveSheetOpen(true)} hitSlop={12}>
            <View style={styles.statBlock}>
              <ThemedText type="caption" style={styles.statLabel}>
                LAST
              </ThemedText>
              <ThemedText type="body" style={styles.statValue}>
                {lastWorkoutAgo ?? '—'}
              </ThemedText>
            </View>
            <View style={styles.statBlock}>
              <ThemedText type="caption" style={styles.statLabel}>
                ROUTINE
              </ThemedText>
              <ThemedText type="body" style={[styles.statValue, { color: Colors.primary.accentViolet }]}>
                Save as
              </ThemedText>
            </View>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TextInput
            testID="active-workout-name"
            value={activeWorkout.name}
            onChangeText={(text) =>
              updateActiveWorkout((workout) => ({ ...workout, name: text }))
            }
            style={styles.nameInput}
            placeholder="Workout name"
            placeholderTextColor={Colors.neutral.textTertiary}
          />

          {activeWorkout.exercises.map((workoutExercise, exerciseIndex) => {
            const exercise = getExerciseById(workoutExercise.exerciseId);
            const previous = previousSession(workouts, workoutExercise.exerciseId);
            const previousBest1Rm = bestOneRepMax(workouts, workoutExercise.exerciseId);
            const restSeconds = workoutExercise.restSeconds ?? DEFAULT_REST_SECONDS;
            const isFirst = exerciseIndex === 0;
            const isLast = exerciseIndex === activeWorkout.exercises.length - 1;
            return (
              <View key={workoutExercise.id} style={styles.exerciseBlock}>
                <View style={styles.exerciseHeader}>
                  <Pressable
                    style={{ flex: 1 }}
                    onPress={() =>
                      exercise ? router.push(`/exercise/${exercise.id}`) : null
                    }
                  >
                    <ThemedText type="h2" style={styles.exerciseName}>
                      {exercise?.name ?? 'Exercise'}
                    </ThemedText>
                    {exercise ? (
                      <ThemedText type="caption" style={styles.exerciseMeta}>
                        {exercise.primaryMuscle} · {exercise.equipment}
                      </ThemedText>
                    ) : null}
                  </Pressable>
                  <Pressable
                    onPress={() => setRestSheetFor(workoutExercise.id)}
                    hitSlop={8}
                    style={styles.restPill}
                  >
                    <IconSymbol name="clock" size={14} color={Colors.neutral.textPrimary} />
                    <ThemedText type="caption" style={styles.restPillText}>
                      {formatRest(restSeconds)}
                    </ThemedText>
                  </Pressable>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(exercise?.name ?? 'Exercise', undefined, [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: isFirst ? 'Move down' : 'Move up',
                          onPress: () =>
                            moveExercise(workoutExercise.id, isFirst ? 'down' : 'up'),
                        },
                        ...(isLast
                          ? []
                          : [{
                              text: 'Move down',
                              onPress: () => moveExercise(workoutExercise.id, 'down'),
                            }]),
                        {
                          text: 'Remove',
                          style: 'destructive',
                          onPress: () => removeExerciseFromActive(workoutExercise.id),
                        },
                      ])
                    }
                    activeOpacity={0.7}
                    style={{ marginLeft: Spacing.sm }}
                    testID={`exercise-actions-${workoutExercise.id}`}
                  >
                    <IconSymbol name="ellipsis" size={22} color={Colors.neutral.textSecondary} />
                  </TouchableOpacity>
                </View>

                <TextInput
                  testID={`exercise-notes-${workoutExercise.id}`}
                  value={workoutExercise.notes ?? ''}
                  onChangeText={(text) => setExerciseNotes(workoutExercise.id, text)}
                  placeholder="Add notes…"
                  placeholderTextColor={Colors.neutral.textTertiary}
                  style={styles.notesInput}
                  multiline
                />

                <View style={styles.setHeaderRow}>
                  <ThemedText type="caption" style={[styles.setHeader, { flex: 0.6 }]}>
                    SET
                  </ThemedText>
                  <ThemedText type="caption" style={[styles.setHeader, { flex: 1.4 }]}>
                    PREVIOUS
                  </ThemedText>
                  <ThemedText type="caption" style={[styles.setHeader, { flex: 1.1 }]}>
                    {weightUnit.toUpperCase()}
                  </ThemedText>
                  <ThemedText type="caption" style={[styles.setHeader, { flex: 0.9 }]}>
                    REPS
                  </ThemedText>
                  <ThemedText
                    type="caption"
                    style={[styles.setHeader, { flex: 0.6, textAlign: 'right' }]}
                  >
                    ✓
                  </ThemedText>
                </View>

                {workoutExercise.sets.map((set, index) => {
                  const prev = previous[index];
                  const oneRm = estimateOneRepMax(set.weight, set.reps);
                  const isPR =
                    set.completed && oneRm > 0 && oneRm > previousBest1Rm;
                  return (
                    <View
                      key={set.id}
                      style={[
                        styles.setRow,
                        set.completed && { backgroundColor: Colors.neutral.elevatedBackground },
                      ]}
                    >
                      <View style={{ flex: 0.6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <TouchableOpacity
                          onPress={() =>
                            updateSet(workoutExercise.id, set.id, {
                              type: nextSetType(set.type ?? 'normal'),
                            })
                          }
                          hitSlop={6}
                          style={[styles.setTypeBadge, setTypeBadgeStyle(set.type ?? 'normal')]}
                          testID={`set-type-${workoutExercise.id}-${index}`}
                        >
                          <ThemedText type="caption" style={styles.setTypeBadgeText}>
                            {setTypeLabel(set.type ?? 'normal', index)}
                          </ThemedText>
                        </TouchableOpacity>
                        {isPR ? (
                          <ThemedText type="caption" style={styles.prBadge} testID={`set-pr-${workoutExercise.id}-${index}`}>
                            PR
                          </ThemedText>
                        ) : null}
                      </View>
                      <ThemedText type="caption" style={[styles.previousText, { flex: 1.4 }]}>
                        {prev ? `${fromKg(prev.weight, weightUnit)} ${weightUnit} × ${prev.reps}` : '—'}
                      </ThemedText>
                      <TextInput
                        testID={`set-weight-${workoutExercise.id}-${index}`}
                        value={set.weight ? String(fromKg(set.weight, weightUnit)) : ''}
                        onChangeText={(text) => {
                          const parsed = parseFloat(text.replace(',', '.')) || 0;
                          updateSet(workoutExercise.id, set.id, {
                            weight: toKg(parsed, weightUnit),
                          });
                        }}
                        keyboardType="decimal-pad"
                        placeholder={prev ? String(fromKg(prev.weight, weightUnit)) : '0'}
                        placeholderTextColor={Colors.neutral.textTertiary}
                        style={[styles.setInput, { flex: 1.1 }]}
                      />
                      <TextInput
                        testID={`set-reps-${workoutExercise.id}-${index}`}
                        value={set.reps ? String(set.reps) : ''}
                        onChangeText={(text) =>
                          updateSet(workoutExercise.id, set.id, {
                            reps: parseInt(text, 10) || 0,
                          })
                        }
                        keyboardType="number-pad"
                        placeholder={prev ? String(prev.reps) : '0'}
                        placeholderTextColor={Colors.neutral.textTertiary}
                        style={[styles.setInput, { flex: 0.9 }]}
                      />
                      <View style={{ flex: 0.6, alignItems: 'flex-end' }}>
                        <TouchableOpacity
                          testID={`set-check-${workoutExercise.id}-${index}`}
                          onPress={() =>
                            handleSetCheck(
                              workoutExercise.id,
                              set.id,
                              !set.completed,
                              workoutExercise.restSeconds,
                            )
                          }
                          onLongPress={() => removeSet(workoutExercise.id, set.id)}
                          activeOpacity={0.7}
                          style={[
                            styles.checkbox,
                            set.completed && { backgroundColor: Colors.semantic.success },
                          ]}
                        >
                          {set.completed ? (
                            <IconSymbol name="checkmark" size={16} color="#fff" />
                          ) : null}
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}

                <TouchableOpacity
                  style={styles.addSetButton}
                  activeOpacity={0.7}
                  onPress={() => addSetToExercise(workoutExercise.id)}
                  testID={`add-set-${workoutExercise.id}`}
                >
                  <IconSymbol name="plus" size={18} color={Colors.primary.accentViolet} />
                  <ThemedText type="body" style={styles.addSetText}>
                    Add Set
                  </ThemedText>
                </TouchableOpacity>
              </View>
            );
          })}

          <Button
            testID="active-workout-add-exercise"
            title="Add Exercise"
            variant="primary"
            fullWidth
            onPress={() =>
              router.push({ pathname: '/exercise-picker', params: { mode: 'active' } })
            }
            style={{ marginTop: Spacing.lg }}
          />

          <Button
            testID="active-workout-discard"
            title="Discard Workout"
            variant="destructive"
            fullWidth
            onPress={handleDiscard}
            style={{ marginTop: Spacing.md }}
          />
        </ScrollView>
      </SafeAreaView>

      <RestTimerOverlay />

      {/* Rest seconds picker */}
      <Modal
        visible={restSheetFor !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setRestSheetFor(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setRestSheetFor(null)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <ThemedText type="h2" style={styles.sheetTitle}>
              Rest timer
            </ThemedText>
            <View style={styles.restGrid}>
              {REST_PRESETS.map((seconds) => (
                <Pressable
                  key={seconds}
                  onPress={() => {
                    if (restSheetFor) setExerciseRest(restSheetFor, seconds);
                    setRestSheetFor(null);
                  }}
                  style={styles.restOption}
                  testID={`rest-option-${seconds}`}
                >
                  <ThemedText type="body" style={styles.restOptionText}>
                    {formatRest(seconds)}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={() => {
                if (restSheetFor) setExerciseRest(restSheetFor, undefined);
                setRestSheetFor(null);
              }}
              style={[styles.restOption, { backgroundColor: 'transparent' }]}
            >
              <ThemedText type="caption" style={{ color: Colors.semantic.error }}>
                Disable rest timer
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Save as routine sheet */}
      <Modal
        visible={saveSheetOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSaveSheetOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSaveSheetOpen(false)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <ThemedText type="h2" style={styles.sheetTitle}>
              Save as routine
            </ThemedText>
            <TextInput
              testID="save-routine-name"
              value={saveRoutineName}
              onChangeText={setSaveRoutineName}
              placeholder={activeWorkout.name}
              placeholderTextColor={Colors.neutral.textTertiary}
              style={styles.sheetInput}
            />
            <Button
              testID="save-routine-confirm"
              title="Save"
              onPress={handleSaveAsRoutine}
              variant="primary"
              fullWidth
            />
          </View>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

function formatTimer(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h) return `${h}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatRest(seconds: number) {
  if (!seconds) return 'Off';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) return `${m}m`;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.darkBackground },
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.border,
    gap: Spacing.sm,
  },
  timerLabel: { color: Colors.neutral.textSecondary },
  timer: { color: Colors.neutral.textPrimary },
  finishText: { color: Colors.primary.accentViolet, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.lg,
  },
  statBlock: { flex: 1 },
  statLabel: { color: Colors.neutral.textSecondary },
  statValue: { color: Colors.neutral.textPrimary, fontWeight: '600' },
  content: { padding: Spacing.md, paddingBottom: 140 },
  nameInput: {
    color: Colors.neutral.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  exerciseBlock: {
    backgroundColor: Colors.neutral.cardBackground,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  exerciseHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  exerciseName: { color: Colors.primary.accentViolet },
  exerciseMeta: { color: Colors.neutral.textSecondary, marginTop: 2 },
  notesInput: {
    color: Colors.neutral.textPrimary,
    backgroundColor: Colors.neutral.elevatedBackground,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
    minHeight: 36,
  },
  restPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.neutral.elevatedBackground,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  restPillText: { color: Colors.neutral.textPrimary },
  setHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
  },
  setHeader: {
    color: Colors.neutral.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    marginBottom: 4,
  },
  setIndex: { color: Colors.neutral.textPrimary, fontWeight: '600' },
  setTypeBadge: {
    minWidth: 26,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  setTypeBadgeText: { color: Colors.neutral.textPrimary, fontWeight: '700' },
  previousText: { color: Colors.neutral.textTertiary },
  prBadge: {
    color: Colors.semantic.pr,
    fontWeight: '700',
    fontSize: 10,
    backgroundColor: 'rgba(255,176,32,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  setInput: {
    color: Colors.neutral.textPrimary,
    fontSize: 16,
    backgroundColor: Colors.neutral.elevatedBackground,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: Spacing.xs,
    textAlign: 'center',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
    backgroundColor: Colors.neutral.elevatedBackground,
    borderRadius: 8,
  },
  addSetText: { color: Colors.primary.accentViolet, fontWeight: '600' },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  emptyTitle: { color: Colors.neutral.textPrimary },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.neutral.cardBackground,
    padding: Spacing.lg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: Spacing.md,
  },
  sheetTitle: { color: Colors.neutral.textPrimary },
  sheetInput: {
    color: Colors.neutral.textPrimary,
    fontSize: 18,
    backgroundColor: Colors.neutral.elevatedBackground,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  restGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  restOption: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.neutral.elevatedBackground,
    borderRadius: 999,
  },
  restOptionText: { color: Colors.neutral.textPrimary },
});

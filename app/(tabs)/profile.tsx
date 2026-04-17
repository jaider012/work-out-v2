import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkouts } from '@/contexts/WorkoutContext';
import { EXERCISES, MUSCLE_LABELS } from '@/data/exercises';
import { bestOneRepMax } from '@/utils/exerciseHistory';
import {
  computeWorkoutVolumeKg,
  muscleVolumeMap,
  totalSets,
  workoutsInLastDays,
} from '@/utils/workoutStats';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { workouts, personalRecords } = useWorkouts();
  const [exercisesSheetOpen, setExercisesSheetOpen] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');

  const lastWeek = useMemo(() => workoutsInLastDays(workouts, 7), [workouts]);

  const stats = useMemo(() => {
    const totalVolume = workouts.reduce((sum, w) => sum + computeWorkoutVolumeKg(w), 0);
    return {
      workoutsAllTime: workouts.length,
      workoutsThisWeek: lastWeek.length,
      totalVolume,
      totalSets: workouts.reduce((sum, w) => sum + totalSets(w), 0),
      personalRecords: personalRecords.length,
    };
  }, [workouts, lastWeek, personalRecords]);

  const topExercises = useMemo(() => {
    const map = new Map<string, number>();
    for (const w of workouts) {
      for (const ex of w.exercises) {
        for (const s of ex.sets) {
          map.set(ex.exerciseId, (map.get(ex.exerciseId) ?? 0) + s.weight * s.reps);
        }
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([id, volume]) => ({ id, volume, oneRm: bestOneRepMax(workouts, id) }));
  }, [workouts]);

  const filteredExercises = useMemo(() => {
    const term = exerciseSearch.trim().toLowerCase();
    if (!term) return EXERCISES;
    return EXERCISES.filter((e) => e.name.toLowerCase().includes(term));
  }, [exerciseSearch]);

  const muscleMap = useMemo(() => muscleVolumeMap(lastWeek), [lastWeek]);
  const muscleEntries = useMemo(() => {
    const total = Object.values(muscleMap).reduce((sum, v) => sum + v, 0);
    return Object.entries(muscleMap)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([muscle, volume]) => ({
        muscle,
        volume,
        ratio: total ? volume / total : 0,
      }));
  }, [muscleMap]);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/(auth)/welcome');
          } catch {
            Alert.alert('Error', 'Failed to log out. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <IconSymbol name="person.fill" size={32} color={Colors.neutral.textPrimary} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <ThemedText type="h2" style={styles.userName} numberOfLines={1}>
                {user?.email?.split('@')[0] ?? 'Athlete'}
              </ThemedText>
              <ThemedText type="caption" style={styles.userEmail} numberOfLines={1}>
                {user?.email ?? ''}
              </ThemedText>
            </View>
          </View>

          <Card style={styles.statsCard}>
            <View style={styles.statsGrid}>
              <Stat title="Workouts" value={String(stats.workoutsAllTime)} />
              <Stat title="This week" value={String(stats.workoutsThisWeek)} />
              <Stat title="Sets" value={String(stats.totalSets)} />
              <Stat title="PRs" value={String(stats.personalRecords)} />
            </View>
          </Card>

          <Section title="MUSCLE DISTRIBUTION (7D)">
            {muscleEntries.length === 0 ? (
              <Card>
                <ThemedText type="caption" style={styles.muted}>
                  Log a workout to see which muscles you have trained.
                </ThemedText>
              </Card>
            ) : (
              <Card>
                {muscleEntries.map((entry) => (
                  <View key={entry.muscle} style={styles.muscleRow}>
                    <ThemedText type="body" style={styles.muscleName}>
                      {MUSCLE_LABELS[entry.muscle] ?? entry.muscle}
                    </ThemedText>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${Math.max(8, Math.round(entry.ratio * 100))}%` },
                        ]}
                      />
                    </View>
                    <ThemedText type="caption" style={styles.muscleVolume}>
                      {Math.round(entry.volume)} kg
                    </ThemedText>
                  </View>
                ))}
              </Card>
            )}
          </Section>

          <Section title="MAIN EXERCISES">
            {topExercises.length === 0 ? (
              <Card>
                <ThemedText type="caption" style={styles.muted}>
                  Log a workout to see your most-trained exercises here.
                </ThemedText>
              </Card>
            ) : (
              <Card style={styles.menuCard}>
                {topExercises.map((entry) => {
                  const exercise = EXERCISES.find((e) => e.id === entry.id);
                  return (
                    <TouchableOpacity
                      key={entry.id}
                      activeOpacity={0.7}
                      style={styles.row}
                      onPress={() => router.push(`/exercise/${entry.id}`)}
                    >
                      <IconSymbol
                        name="figure.strengthtraining.traditional"
                        size={20}
                        color={Colors.primary.accentViolet}
                      />
                      <View style={{ flex: 1 }}>
                        <ThemedText type="body" style={styles.rowLabel}>
                          {exercise?.name ?? entry.id}
                        </ThemedText>
                        <ThemedText type="caption" style={styles.muted}>
                          {Math.round(entry.volume)} kg total · e1RM {entry.oneRm} kg
                        </ThemedText>
                      </View>
                      <IconSymbol name="chevron.right" size={18} color={Colors.neutral.textTertiary} />
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.row}
                  onPress={() => setExercisesSheetOpen(true)}
                  testID="profile-browse-exercises"
                >
                  <IconSymbol name="magnifyingglass" size={20} color={Colors.neutral.textPrimary} />
                  <ThemedText type="body" style={styles.rowLabel}>
                    Browse all exercises
                  </ThemedText>
                  <IconSymbol name="chevron.right" size={18} color={Colors.neutral.textTertiary} />
                </TouchableOpacity>
              </Card>
            )}
          </Section>

          <Section title="ACCOUNT">
            <Card style={styles.menuCard}>
              <Row icon="person.crop.circle" label="Edit Profile" onPress={() => {}} />
              <Row icon="bell.fill" label="Notifications" onPress={() => {}} />
              <Row icon="gearshape.fill" label="App Settings" onPress={() => {}} />
            </Card>
          </Section>

          <Section title="SUPPORT">
            <Card style={styles.menuCard}>
              <Row icon="questionmark.circle" label="Help & FAQ" onPress={() => {}} />
              <Row icon="star.fill" label="Rate the App" onPress={() => {}} />
              <Row icon="note.text" label="Send Feedback" onPress={() => {}} />
            </Card>
          </Section>

          <Card style={styles.menuCard}>
            <Row
              icon="arrow.right"
              label="Log Out"
              destructive
              onPress={handleLogout}
            />
          </Card>
        </ScrollView>

        <Modal
          visible={exercisesSheetOpen}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setExercisesSheetOpen(false)}
        >
          <ThemedView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={styles.modalTop}>
                <Pressable onPress={() => setExercisesSheetOpen(false)}>
                  <ThemedText type="body" style={{ color: Colors.neutral.textSecondary }}>
                    Close
                  </ThemedText>
                </Pressable>
                <ThemedText type="h2" style={{ color: Colors.neutral.textPrimary }}>
                  Exercises
                </ThemedText>
                <View style={{ width: 50 }} />
              </View>
              <View style={styles.modalSearch}>
                <IconSymbol name="magnifyingglass" size={18} color={Colors.neutral.textSecondary} />
                <TextInput
                  value={exerciseSearch}
                  onChangeText={setExerciseSearch}
                  placeholder="Search exercises"
                  placeholderTextColor={Colors.neutral.textTertiary}
                  style={styles.modalSearchInput}
                />
              </View>
              <FlatList
                data={filteredExercises}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: Spacing.md }}
                ItemSeparatorComponent={() => (
                  <View style={{ height: 1, backgroundColor: Colors.neutral.border }} />
                )}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.row}
                    onPress={() => {
                      setExercisesSheetOpen(false);
                      router.push(`/exercise/${item.id}`);
                    }}
                  >
                    <IconSymbol
                      name="figure.strengthtraining.traditional"
                      size={20}
                      color={Colors.neutral.textPrimary}
                    />
                    <View style={{ flex: 1 }}>
                      <ThemedText type="body" style={styles.rowLabel}>
                        {item.name}
                      </ThemedText>
                      <ThemedText type="caption" style={styles.muted}>
                        {MUSCLE_LABELS[item.primaryMuscle]}
                      </ThemedText>
                    </View>
                    <IconSymbol name="chevron.right" size={18} color={Colors.neutral.textTertiary} />
                  </TouchableOpacity>
                )}
              />
            </SafeAreaView>
          </ThemedView>
        </Modal>
      </SafeAreaView>
    </ThemedView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="caption" style={styles.sectionLabel}>
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.statBlock}>
      <ThemedText type="h2" style={styles.statValue}>
        {value}
      </ThemedText>
      <ThemedText type="caption" style={styles.statLabel}>
        {title}
      </ThemedText>
    </View>
  );
}

function Row({
  icon,
  label,
  destructive,
  onPress,
}: {
  icon: 'person.crop.circle' | 'bell.fill' | 'gearshape.fill' | 'questionmark.circle' | 'star.fill' | 'note.text' | 'arrow.right';
  label: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <IconSymbol
        name={icon}
        size={20}
        color={destructive ? Colors.semantic.error : Colors.neutral.textPrimary}
      />
      <ThemedText
        type="body"
        style={[styles.rowLabel, destructive && { color: Colors.semantic.error }]}
      >
        {label}
      </ThemedText>
      <IconSymbol name="chevron.right" size={18} color={Colors.neutral.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.darkBackground },
  safeArea: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl + Spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.neutral.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: { color: Colors.neutral.textPrimary },
  userEmail: { color: Colors.neutral.textSecondary, marginTop: 4 },
  statsCard: { marginBottom: Spacing.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  statBlock: { width: '50%', alignItems: 'flex-start', marginBottom: Spacing.sm },
  statValue: { color: Colors.primary.accentViolet, fontWeight: '700' },
  statLabel: { color: Colors.neutral.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  section: { marginBottom: Spacing.lg },
  sectionLabel: {
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  muted: { color: Colors.neutral.textSecondary },
  muscleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  muscleName: { color: Colors.neutral.textPrimary, width: 96 },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.neutral.elevatedBackground,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: Spacing.sm,
  },
  barFill: { height: '100%', backgroundColor: Colors.primary.accentViolet, borderRadius: 4 },
  muscleVolume: { color: Colors.neutral.textSecondary, width: 80, textAlign: 'right' },
  menuCard: { padding: 0, marginBottom: Spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.border,
    gap: Spacing.md,
  },
  rowLabel: { color: Colors.neutral.textPrimary, flex: 1 },
  modalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.border,
  },
  modalSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.neutral.cardBackground,
    borderRadius: 10,
    gap: Spacing.xs,
  },
  modalSearchInput: { flex: 1, color: Colors.neutral.textPrimary, paddingVertical: Spacing.sm },
});

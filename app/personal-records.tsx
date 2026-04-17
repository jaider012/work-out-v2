import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
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
import { bestOneRepMax, bestSetEver } from '@/utils/exerciseHistory';

export default function PersonalRecordsScreen() {
  const router = useRouter();
  const { workouts } = useWorkouts();
  const { weightUnit } = useSettings();

  const rows = useMemo(() => {
    const ids = new Set<string>();
    for (const w of workouts) {
      for (const ex of w.exercises) {
        ids.add(ex.exerciseId);
      }
    }
    return Array.from(ids)
      .map((id) => {
        const best = bestSetEver(workouts, id);
        const one = bestOneRepMax(workouts, id);
        return { id, best, oneRm: one };
      })
      .filter((row) => row.best && row.oneRm > 0)
      .sort((a, b) => b.oneRm - a.oneRm);
  }, [workouts]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <IconSymbol name="chevron.left" size={26} color={Colors.neutral.textPrimary} />
          </TouchableOpacity>
          <ThemedText type="h2" style={styles.title}>
            Personal Records
          </ThemedText>
          <View style={{ width: 26 }} />
        </View>

        {rows.length === 0 ? (
          <View style={styles.empty}>
            <IconSymbol name="flag.fill" size={40} color={Colors.neutral.textTertiary} />
            <ThemedText type="body" style={styles.muted}>
              No personal records yet.
            </ThemedText>
            <ThemedText type="caption" style={styles.muted}>
              Log a workout to start tracking PRs.
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(row) => row.id}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
            renderItem={({ item }) => {
              const exercise = getExerciseById(item.id);
              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push(`/exercise/${item.id}`)}
                >
                  <Card>
                    <View style={styles.row}>
                      <View style={styles.rowIcon}>
                        <IconSymbol
                          name="flag.fill"
                          size={18}
                          color={Colors.semantic.pr}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText type="body" style={styles.name}>
                          {exercise?.name ?? item.id}
                        </ThemedText>
                        <ThemedText type="caption" style={styles.muted}>
                          {item.best
                            ? `${fromKg(item.best.weight, weightUnit)} ${weightUnit} × ${item.best.reps}`
                            : '—'}
                          {' · '}
                          e1RM {fromKg(item.oneRm, weightUnit)} {weightUnit}
                        </ThemedText>
                      </View>
                      <IconSymbol
                        name="chevron.right"
                        size={18}
                        color={Colors.neutral.textTertiary}
                      />
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.darkBackground },
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.border,
  },
  title: { color: Colors.neutral.textPrimary, flex: 1, textAlign: 'center' },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,176,32,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: Colors.neutral.textPrimary, fontWeight: '600' },
  muted: { color: Colors.neutral.textSecondary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
});

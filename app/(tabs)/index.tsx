import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WorkoutScreen() {
  const [activeWorkout, setActiveWorkout] = useState(false);
  
  // Mock workout stats
  const workoutStats = {
    duration: '00:00',
    volume: '0 kg',
    series: '0',
  };

  const handleStartWorkout = () => {
    setActiveWorkout(true);
  };

  const handleAddExercise = () => {
    // TODO: Navigate to exercise selection
    console.log('Add exercise');
  };

  const handleConfigure = () => {
    // TODO: Navigate to workout configuration
    console.log('Configure workout');
  };

  const handleDiscard = () => {
    setActiveWorkout(false);
  };

  if (!activeWorkout) {
    // Empty state - no active workout
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header with stats */}
          <View style={styles.header}>
            <ThemedText type="h1" style={styles.headerTitle}>
              Workout
            </ThemedText>
          </View>

          {/* Stats Display */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText type="caption" style={styles.statLabel}>
                DURATION
              </ThemedText>
              <ThemedText type="h2" style={styles.statValue}>
                {workoutStats.duration}
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="caption" style={styles.statLabel}>
                VOLUME
              </ThemedText>
              <ThemedText type="h2" style={styles.statValue}>
                {workoutStats.volume}
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="caption" style={styles.statLabel}>
                SERIES
              </ThemedText>
              <ThemedText type="h2" style={styles.statValue}>
                {workoutStats.series}
              </ThemedText>
            </View>
          </View>

          {/* Center Content */}
          <View style={styles.centerContent}>
            <View style={styles.iconContainer}>
              <ThemedText style={styles.dumbbellIcon}>🏋️</ThemedText>
            </View>
            <ThemedText type="body" style={styles.emptyMessage}>
              No active workout
            </ThemedText>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <Button
              title="Start Empty Workout"
              onPress={handleStartWorkout}
              variant="primary"
              fullWidth
              style={styles.primaryButton}
            />
            
            <View style={styles.secondaryActions}>
              <Button
                title="Configure"
                onPress={handleConfigure}
                variant="secondary"
                style={styles.secondaryButton}
              />
              <Button
                title="Templates"
                onPress={() => console.log('Templates')}
                variant="secondary"
                style={styles.secondaryButton}
              />
            </View>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // Active workout state
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="h2" style={styles.workoutTitle}>
            Current Workout
          </ThemedText>
          <Button
            title="Finish"
            onPress={() => setActiveWorkout(false)}
            variant="primary"
            size="small"
          />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.workoutCard}>
            <ThemedText type="body" style={styles.emptyWorkoutText}>
              No exercises added yet
            </ThemedText>
            <Button
              title="Add Exercise"
              onPress={handleAddExercise}
              variant="primary"
              fullWidth
              style={styles.addExerciseButton}
            />
          </Card>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <Button
            title="Discard Workout"
            onPress={handleDiscard}
            variant="destructive"
            size="small"
          />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.darkBackground,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    color: Colors.neutral.textPrimary,
  },
  workoutTitle: {
    color: Colors.neutral.textPrimary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    color: Colors.primary.accentBlue,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  dumbbellIcon: {
    fontSize: 80,
    opacity: 0.3,
  },
  emptyMessage: {
    color: Colors.neutral.textSecondary,
    textAlign: 'center',
  },
  actionContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  primaryButton: {
    marginBottom: Spacing.md,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  secondaryButton: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  workoutCard: {
    marginBottom: Spacing.md,
  },
  emptyWorkoutText: {
    color: Colors.neutral.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  addExerciseButton: {
    // Full width button
  },
  bottomActions: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    alignItems: 'center',
  },
});

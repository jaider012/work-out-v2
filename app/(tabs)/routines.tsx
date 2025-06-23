import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { WorkoutCard } from '@/components/WorkoutCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RoutineGroup {
  id: string;
  name: string;
  routines: Routine[];
  expanded: boolean;
}

interface Routine {
  id: string;
  name: string;
  exercises: string[];
}

export default function RoutinesScreen() {
  const [routineGroups, setRoutineGroups] = useState<RoutineGroup[]>([
    {
      id: '1',
      name: 'Upper Body',
      expanded: true,
      routines: [
        {
          id: '1',
          name: 'Push Day',
          exercises: ['Bench Press', 'Overhead Press', 'Tricep Dips', 'Push-ups'],
        },
        {
          id: '2',
          name: 'Pull Day',
          exercises: ['Pull-ups', 'Rows', 'Lat Pulldown', 'Bicep Curls'],
        },
      ],
    },
    {
      id: '2',
      name: 'Lower Body',
      expanded: false,
      routines: [
        {
          id: '3',
          name: 'Leg Day',
          exercises: ['Squats', 'Deadlifts', 'Lunges', 'Calf Raises'],
        },
      ],
    },
  ]);

  const toggleGroup = (groupId: string) => {
    setRoutineGroups(groups =>
      groups.map(group =>
        group.id === groupId
          ? { ...group, expanded: !group.expanded }
          : group
      )
    );
  };

  const handleStartRoutine = (routine: Routine) => {
    console.log('Starting routine:', routine.name);
    // TODO: Navigate to workout session with this routine
  };

  const handleCreateRoutine = () => {
    console.log('Create new routine');
    // TODO: Navigate to routine creation
  };

  const handleStartEmptyWorkout = () => {
    console.log('Start empty workout');
    // TODO: Navigate to empty workout session
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="h1" style={styles.headerTitle}>
            Routines
          </ThemedText>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Quick Start Section */}
          <View style={styles.quickStartSection}>
            <Card style={styles.quickStartCard}>
              <View style={styles.quickStartContent}>
                <View style={styles.quickStartIcon}>
                  <ThemedText style={styles.plusIcon}>➕</ThemedText>
                </View>
                <ThemedText type="h2" style={styles.quickStartTitle}>
                  Quick Start
                </ThemedText>
                <ThemedText type="caption" style={styles.quickStartSubtitle}>
                  Start an empty workout
                </ThemedText>
              </View>
              <Button
                title="Start Empty Workout"
                onPress={handleStartEmptyWorkout}
                variant="primary"
                fullWidth
              />
            </Card>
          </View>

          {/* Routine Groups */}
          <View style={styles.routineGroupsSection}>
            {routineGroups.map(group => (
              <View key={group.id} style={styles.routineGroup}>
                {/* Group Header */}
                <TouchableOpacity
                  style={styles.groupHeader}
                  onPress={() => toggleGroup(group.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.groupHeaderContent}>
                    <ThemedText style={styles.chevron}>
                      {group.expanded ? '▼' : '▶'}
                    </ThemedText>
                    <ThemedText type="h2" style={styles.groupTitle}>
                      {group.name}
                    </ThemedText>
                    <ThemedText type="caption" style={styles.groupCount}>
                      ({group.routines.length})
                    </ThemedText>
                  </View>
                </TouchableOpacity>

                {/* Group Content */}
                {group.expanded && (
                  <View style={styles.groupContent}>
                    {group.routines.map(routine => (
                      <WorkoutCard
                        key={routine.id}
                        title={routine.name}
                        exercises={routine.exercises}
                        onStart={() => handleStartRoutine(routine)}
                        onPress={() => console.log('Edit routine:', routine.name)}
                      />
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Create New Routine */}
          <View style={styles.createSection}>
            <Button
              title="Create New Routine"
              onPress={handleCreateRoutine}
              variant="outline"
              fullWidth
              style={styles.createButton}
            />
          </View>
        </ScrollView>
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    color: Colors.neutral.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  quickStartSection: {
    marginBottom: Spacing.xl,
  },
  quickStartCard: {
    alignItems: 'center',
  },
  quickStartContent: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  quickStartIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.neutral.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  plusIcon: {
    fontSize: 24,
    opacity: 0.7,
  },
  quickStartTitle: {
    color: Colors.neutral.textPrimary,
    marginBottom: Spacing.xs,
  },
  quickStartSubtitle: {
    color: Colors.neutral.textSecondary,
    textAlign: 'center',
  },
  routineGroupsSection: {
    marginBottom: Spacing.xl,
  },
  routineGroup: {
    marginBottom: Spacing.lg,
  },
  groupHeader: {
    marginBottom: Spacing.md,
  },
  groupHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    fontSize: 12,
    color: Colors.neutral.textSecondary,
    marginRight: Spacing.sm,
    width: 16,
  },
  groupTitle: {
    color: Colors.neutral.textPrimary,
    flex: 1,
  },
  groupCount: {
    color: Colors.neutral.textSecondary,
  },
  groupContent: {
    // Routine cards will have their own margins
  },
  createSection: {
    paddingBottom: Spacing.xl,
  },
  createButton: {
    // Outline button styling
  },
}); 
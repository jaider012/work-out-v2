import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProgressScreen() {
  // Mock progress data
  const weeklyStats = {
    workouts: 4,
    totalTime: '3h 45m',
    totalVolume: '2,450 kg',
    avgDuration: '56m',
  };

  const monthlyGoals = {
    workouts: { current: 12, target: 16 },
    volume: { current: 8500, target: 10000 },
    duration: { current: 720, target: 900 }, // minutes
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="h1" style={styles.headerTitle}>
            Progress
          </ThemedText>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Weekly Summary */}
          <View style={styles.section}>
            <ThemedText type="h2" style={styles.sectionTitle}>
              This Week
            </ThemedText>
            <Card style={styles.statsCard}>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <ThemedText type="h2" style={styles.statValue}>
                    {weeklyStats.workouts}
                  </ThemedText>
                  <ThemedText type="caption" style={styles.statLabel}>
                    WORKOUTS
                  </ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText type="h2" style={styles.statValue}>
                    {weeklyStats.totalTime}
                  </ThemedText>
                  <ThemedText type="caption" style={styles.statLabel}>
                    TOTAL TIME
                  </ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText type="h2" style={styles.statValue}>
                    {weeklyStats.totalVolume}
                  </ThemedText>
                  <ThemedText type="caption" style={styles.statLabel}>
                    VOLUME
                  </ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText type="h2" style={styles.statValue}>
                    {weeklyStats.avgDuration}
                  </ThemedText>
                  <ThemedText type="caption" style={styles.statLabel}>
                    AVG DURATION
                  </ThemedText>
                </View>
              </View>
            </Card>
          </View>

          {/* Monthly Goals */}
          <View style={styles.section}>
            <ThemedText type="h2" style={styles.sectionTitle}>
              Monthly Goals
            </ThemedText>
            
            {/* Workouts Goal */}
            <Card style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <ThemedText type="body" style={styles.goalTitle}>
                  Workouts
                </ThemedText>
                <ThemedText type="body" style={styles.goalProgress}>
                  {monthlyGoals.workouts.current}/{monthlyGoals.workouts.target}
                </ThemedText>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { 
                        width: `${getProgressPercentage(
                          monthlyGoals.workouts.current,
                          monthlyGoals.workouts.target
                        )}%`
                      }
                    ]}
                  />
                </View>
              </View>
            </Card>

            {/* Volume Goal */}
            <Card style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <ThemedText type="body" style={styles.goalTitle}>
                  Volume
                </ThemedText>
                <ThemedText type="body" style={styles.goalProgress}>
                  {monthlyGoals.volume.current.toLocaleString()} kg / {monthlyGoals.volume.target.toLocaleString()} kg
                </ThemedText>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { 
                        width: `${getProgressPercentage(
                          monthlyGoals.volume.current,
                          monthlyGoals.volume.target
                        )}%`
                      }
                    ]}
                  />
                </View>
              </View>
            </Card>

            {/* Duration Goal */}
            <Card style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <ThemedText type="body" style={styles.goalTitle}>
                  Total Time
                </ThemedText>
                <ThemedText type="body" style={styles.goalProgress}>
                  {Math.floor(monthlyGoals.duration.current / 60)}h {monthlyGoals.duration.current % 60}m / {Math.floor(monthlyGoals.duration.target / 60)}h {monthlyGoals.duration.target % 60}m
                </ThemedText>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { 
                        width: `${getProgressPercentage(
                          monthlyGoals.duration.current,
                          monthlyGoals.duration.target
                        )}%`
                      }
                    ]}
                  />
                </View>
              </View>
            </Card>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <ThemedText type="h2" style={styles.sectionTitle}>
              Recent Activity
            </ThemedText>
            <Card style={styles.activityCard}>
              <ThemedText type="body" style={styles.emptyMessage}>
                No recent workouts to display
              </ThemedText>
              <ThemedText type="caption" style={styles.emptySubMessage}>
                Complete your first workout to see your progress here
              </ThemedText>
            </Card>
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.neutral.textPrimary,
    marginBottom: Spacing.md,
  },
  statsCard: {
    // Card styling from component
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statValue: {
    color: Colors.primary.accentBlue,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    color: Colors.neutral.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalCard: {
    marginBottom: Spacing.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  goalTitle: {
    color: Colors.neutral.textPrimary,
  },
  goalProgress: {
    color: Colors.neutral.textSecondary,
    fontSize: 14,
  },
  progressBarContainer: {
    // Container for progress bar
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.neutral.cardBackground,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary.accentBlue,
    borderRadius: 4,
  },
  activityCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyMessage: {
    color: Colors.neutral.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  emptySubMessage: {
    color: Colors.neutral.textTertiary,
    textAlign: 'center',
  },
}); 
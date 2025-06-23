import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface WorkoutCardProps {
  title: string;
  exercises: string[];
  onStart: () => void;
  onPress?: () => void;
}

export function WorkoutCard({ 
  title, 
  exercises, 
  onStart, 
  onPress 
}: WorkoutCardProps) {
  const exercisePreview = exercises.slice(0, 3).join(', ');
  const remainingCount = exercises.length - 3;
  
  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper onPress={onPress} activeOpacity={0.7}>
      <Card variant="elevated" style={styles.card}>
        <View style={styles.header}>
          <ThemedText type="h2" style={styles.title}>
            {title}
          </ThemedText>
        </View>
        
        <View style={styles.content}>
          <ThemedText type="caption" style={styles.exercisePreview}>
            {exercisePreview}
            {remainingCount > 0 && ` +${remainingCount} more`}
          </ThemedText>
        </View>
        
        <View style={styles.footer}>
          <Button
            title="Start Workout"
            onPress={onStart}
            variant="primary"
            fullWidth
          />
        </View>
      </Card>
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  title: {
    color: Colors.neutral.textPrimary,
  },
  content: {
    marginBottom: Spacing.md,
  },
  exercisePreview: {
    color: Colors.neutral.textSecondary,
    lineHeight: 20,
  },
  footer: {
    // Button takes full width
  },
}); 
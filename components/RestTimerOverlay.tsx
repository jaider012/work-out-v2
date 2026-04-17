import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';
import { useRestTimer } from '@/contexts/RestTimerContext';

export function RestTimerOverlay() {
  const { remaining, total, active, add, stop } = useRestTimer();

  if (!active) return null;

  const progress = total > 0 ? Math.min(1, remaining / total) : 0;

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <View style={styles.bar}>
        <View style={styles.row}>
          <Pressable
            onPress={() => add(-15)}
            hitSlop={8}
            style={styles.iconButton}
            testID="rest-timer-minus"
          >
            <IconSymbol name="minus" size={18} color={Colors.neutral.textPrimary} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <ThemedText type="caption" style={styles.label}>
              REST
            </ThemedText>
            <ThemedText type="h2" style={styles.time}>
              {format(remaining)}
            </ThemedText>
          </View>
          <Pressable
            onPress={() => add(15)}
            hitSlop={8}
            style={styles.iconButton}
            testID="rest-timer-plus"
          >
            <IconSymbol name="plus" size={18} color={Colors.neutral.textPrimary} />
          </Pressable>
          <Pressable
            onPress={stop}
            hitSlop={8}
            style={[styles.iconButton, { marginLeft: Spacing.sm }]}
            testID="rest-timer-stop"
          >
            <IconSymbol name="xmark" size={18} color={Colors.neutral.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
    </View>
  );
}

function format(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.md,
    right: Spacing.md,
  },
  bar: {
    backgroundColor: Colors.neutral.elevatedBackground,
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary.accentViolet,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { color: Colors.neutral.textSecondary },
  time: { color: Colors.neutral.textPrimary, fontVariant: ['tabular-nums'] },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutral.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    height: 4,
    backgroundColor: Colors.neutral.cardBackground,
    borderRadius: 2,
    marginTop: Spacing.xs,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primary.accentViolet,
    borderRadius: 2,
  },
});

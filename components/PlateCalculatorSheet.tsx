import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';
import { fromKg, useSettings } from '@/contexts/SettingsContext';
import { calculatePlates } from '@/utils/plateCalculator';

interface PlateCalculatorSheetProps {
  visible: boolean;
  targetKg: number;
  onClose: () => void;
}

export function PlateCalculatorSheet({ visible, targetKg, onClose }: PlateCalculatorSheetProps) {
  const { weightUnit } = useSettings();
  // Compute the breakdown in the user's preferred unit so plate labels stay
  // in the same system they see on the set rows.
  const targetInUnit = fromKg(targetKg, weightUnit);
  const breakdown = calculatePlates(targetInUnit, weightUnit);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <ThemedText type="h2" style={styles.title}>
            Plate calculator
          </ThemedText>
          <ThemedText type="caption" style={styles.muted}>
            Target: {targetInUnit} {weightUnit} · Bar: {breakdown.bar} {weightUnit}
          </ThemedText>

          {breakdown.perSide.length === 0 ? (
            <ThemedText type="body" style={styles.bodyText}>
              No plates needed — use the bar only.
            </ThemedText>
          ) : (
            <View style={styles.plateList}>
              <ThemedText type="caption" style={styles.muted}>
                PER SIDE
              </ThemedText>
              {breakdown.perSide.map((plate) => (
                <View key={plate.size} style={styles.plateRow}>
                  <View style={[styles.plateChip, plateColor(plate.size, weightUnit)]}>
                    <ThemedText type="caption" style={styles.plateChipText}>
                      {plate.size}
                    </ThemedText>
                  </View>
                  <ThemedText type="body" style={styles.bodyText}>
                    × {plate.count}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}

          {breakdown.remainder > 0 ? (
            <ThemedText type="caption" style={styles.warning}>
              Could not load {breakdown.remainder} {weightUnit} — grab smaller plates.
            </ThemedText>
          ) : null}
        </View>
      </Pressable>
    </Modal>
  );
}

function plateColor(size: number, unit: 'kg' | 'lbs') {
  if (unit === 'lbs') {
    switch (size) {
      case 45:
        return { backgroundColor: '#1565C0' };
      case 35:
        return { backgroundColor: '#F9A825' };
      case 25:
        return { backgroundColor: '#2E7D32' };
      case 10:
        return { backgroundColor: '#C62828' };
      case 5:
        return { backgroundColor: '#6A1B9A' };
      case 2.5:
      case 1.25:
        return { backgroundColor: '#546E7A' };
      default:
        return { backgroundColor: Colors.neutral.elevatedBackground };
    }
  }
  switch (size) {
    case 25:
      return { backgroundColor: '#C62828' };
    case 20:
      return { backgroundColor: '#1565C0' };
    case 15:
      return { backgroundColor: '#F9A825' };
    case 10:
      return { backgroundColor: '#2E7D32' };
    case 5:
      return { backgroundColor: '#6A1B9A' };
    case 2.5:
    case 1.25:
      return { backgroundColor: '#546E7A' };
    default:
      return { backgroundColor: Colors.neutral.elevatedBackground };
  }
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.neutral.cardBackground,
    padding: Spacing.lg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: Spacing.sm,
  },
  title: { color: Colors.neutral.textPrimary },
  muted: { color: Colors.neutral.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  bodyText: { color: Colors.neutral.textPrimary },
  plateList: { gap: Spacing.xs, marginTop: Spacing.xs },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  plateChip: {
    minWidth: 52,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateChipText: { color: '#fff', fontWeight: '800' },
  warning: { color: Colors.semantic.warning },
});

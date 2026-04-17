import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';
import { useSettings } from '@/contexts/SettingsContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { weightUnit, setWeightUnit } = useSettings();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.down" size={26} color={Colors.neutral.textPrimary} />
          </TouchableOpacity>
          <ThemedText type="h2" style={styles.title}>
            Settings
          </ThemedText>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedText type="caption" style={styles.sectionLabel}>
            UNITS
          </ThemedText>
          <Card style={styles.card}>
            <View style={styles.toggleRow}>
              <ThemedText type="body" style={styles.label}>
                Weight unit
              </ThemedText>
              <View style={styles.segmented}>
                {(['kg', 'lbs'] as const).map((unit) => {
                  const active = unit === weightUnit;
                  return (
                    <TouchableOpacity
                      key={unit}
                      onPress={() => setWeightUnit(unit)}
                      style={[styles.segment, active && styles.segmentActive]}
                      activeOpacity={0.7}
                      testID={`settings-unit-${unit}`}
                    >
                      <ThemedText
                        type="body"
                        style={[styles.segmentText, active && styles.segmentTextActive]}
                      >
                        {unit.toUpperCase()}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </Card>

          <ThemedText type="caption" style={styles.sectionLabel}>
            ABOUT
          </ThemedText>
          <Card style={styles.card}>
            <View style={styles.row}>
              <ThemedText type="body" style={styles.label}>
                Version
              </ThemedText>
              <ThemedText type="body" style={styles.value}>
                1.0.0
              </ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText type="body" style={styles.label}>
                Storage
              </ThemedText>
              <ThemedText type="body" style={styles.value}>
                On-device (AsyncStorage)
              </ThemedText>
            </View>
          </Card>
        </ScrollView>
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
  title: { color: Colors.neutral.textPrimary },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  sectionLabel: {
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  card: { marginBottom: Spacing.md },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: Colors.neutral.textPrimary },
  value: { color: Colors.neutral.textSecondary },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.elevatedBackground,
    borderRadius: 999,
    padding: 2,
  },
  segment: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: 999 },
  segmentActive: { backgroundColor: Colors.primary.accentViolet },
  segmentText: { color: Colors.neutral.textSecondary, fontWeight: '600' },
  segmentTextActive: { color: '#fff' },
});

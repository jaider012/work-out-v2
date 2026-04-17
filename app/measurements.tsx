import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Sparkline } from '@/components/Sparkline';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';
import { useMeasurements } from '@/contexts/MeasurementsContext';
import { formatWeight, fromKg, toKg, useSettings } from '@/contexts/SettingsContext';

export default function MeasurementsScreen() {
  const router = useRouter();
  const { measurements, addMeasurement, removeMeasurement } = useMeasurements();
  const { weightUnit } = useSettings();

  const [input, setInput] = useState('');

  const sortedAsc = useMemo(
    () =>
      [...measurements].sort(
        (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime(),
      ),
    [measurements],
  );

  const sparklineValues = sortedAsc.map((m) => fromKg(m.weightKg, weightUnit));
  const latest = measurements[0];
  const previous = measurements[1];
  const delta = latest && previous ? latest.weightKg - previous.weightKg : null;

  const handleAdd = async () => {
    const value = parseFloat(input.replace(',', '.'));
    if (!value || value < 20 || value > 500) {
      Alert.alert('Invalid weight', 'Enter a number between 20 and 500.');
      return;
    }
    await addMeasurement(toKg(value, weightUnit));
    setInput('');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.down" size={26} color={Colors.neutral.textPrimary} />
          </TouchableOpacity>
          <ThemedText type="h2" style={styles.title}>
            Body Measurements
          </ThemedText>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.summaryCard}>
            <ThemedText type="caption" style={styles.label}>
              CURRENT
            </ThemedText>
            <ThemedText type="hero" style={styles.weight}>
              {latest ? formatWeight(latest.weightKg, weightUnit) : '—'}
            </ThemedText>
            {delta !== null ? (
              <ThemedText type="caption" style={styles.delta}>
                {delta > 0 ? '▲' : '▼'} {formatWeight(Math.abs(delta), weightUnit)} since last
              </ThemedText>
            ) : null}
            {sparklineValues.length > 1 ? (
              <View style={{ marginTop: Spacing.md }}>
                <Sparkline values={sparklineValues} width={300} height={70} />
              </View>
            ) : null}
          </Card>

          <Card style={styles.inputCard}>
            <ThemedText type="caption" style={styles.label}>
              LOG WEIGHT ({weightUnit.toUpperCase()})
            </ThemedText>
            <View style={styles.inputRow}>
              <TextInput
                testID="measurements-input"
                value={input}
                onChangeText={setInput}
                placeholder={latest ? String(fromKg(latest.weightKg, weightUnit)) : '0'}
                placeholderTextColor={Colors.neutral.textTertiary}
                keyboardType="decimal-pad"
                style={styles.input}
              />
              <Button
                testID="measurements-save"
                title="Save"
                onPress={handleAdd}
                variant="primary"
              />
            </View>
          </Card>

          <ThemedText type="caption" style={styles.sectionLabel}>
            HISTORY
          </ThemedText>

          {measurements.length === 0 ? (
            <Card>
              <ThemedText type="caption" style={styles.muted}>
                No body weight logged yet.
              </ThemedText>
            </Card>
          ) : (
            measurements.map((m) => (
              <Card key={m.id} style={styles.historyRow}>
                <View style={{ flex: 1 }}>
                  <ThemedText type="body" style={styles.historyWeight}>
                    {formatWeight(m.weightKg, weightUnit)}
                  </ThemedText>
                  <ThemedText type="caption" style={styles.muted}>
                    {new Date(m.loggedAt).toLocaleDateString()}
                  </ThemedText>
                </View>
                <TouchableOpacity onPress={() => removeMeasurement(m.id)} hitSlop={10}>
                  <IconSymbol name="trash" size={18} color={Colors.semantic.error} />
                </TouchableOpacity>
              </Card>
            ))
          )}
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
  summaryCard: { marginBottom: Spacing.md, alignItems: 'flex-start' },
  label: { color: Colors.neutral.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6 },
  weight: { color: Colors.neutral.textPrimary, marginTop: Spacing.xs },
  delta: { color: Colors.semantic.success, marginTop: 4 },
  inputCard: { marginBottom: Spacing.lg },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  input: {
    flex: 1,
    color: Colors.neutral.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    backgroundColor: Colors.neutral.elevatedBackground,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  sectionLabel: {
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  muted: { color: Colors.neutral.textSecondary },
  historyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  historyWeight: { color: Colors.neutral.textPrimary, fontWeight: '600' },
});

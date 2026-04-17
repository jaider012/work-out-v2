import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';
import { useMeasurements } from '@/contexts/MeasurementsContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useWorkouts } from '@/contexts/WorkoutContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { weightUnit, setWeightUnit } = useSettings();
  const { workouts, routines, folders, importData } = useWorkouts();
  const { measurements } = useMeasurements();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    setImporting(true);
    try {
      const pick = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      if (pick.canceled || !pick.assets?.length) return;
      const asset = pick.assets[0];
      const file = new File(asset.uri);
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      await importData({
        workouts: parsed.workouts,
        routines: parsed.routines,
        folders: parsed.folders,
      });
      Alert.alert('Import complete', 'Your data has been restored.');
    } catch (error) {
      console.warn('Import failed', error);
      Alert.alert('Import failed', 'Make sure you selected a workout-v2 export file.');
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        weightUnit,
        workouts,
        routines,
        folders,
        measurements,
      };
      const json = JSON.stringify(payload, null, 2);
      if (Platform.OS === 'web') {
        Alert.alert('Export', json.slice(0, 200) + '…');
        return;
      }
      const file = new File(Paths.cache, `workout-v2-export-${Date.now()}.json`);
      if (!file.exists) file.create();
      file.write(json);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Export workout data',
        });
      } else {
        Alert.alert('Export saved', `Saved to ${file.uri}`);
      }
    } catch (error) {
      console.warn('Export failed', error);
      Alert.alert('Export failed', 'Please try again.');
    } finally {
      setExporting(false);
    }
  };

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
            DATA
          </ThemedText>
          <Card style={styles.card}>
            <Button
              testID="settings-export"
              title={exporting ? 'Exporting…' : 'Export data (JSON)'}
              variant="secondary"
              fullWidth
              onPress={handleExport}
              disabled={exporting || importing}
            />
            <View style={{ height: Spacing.sm }} />
            <Button
              testID="settings-import"
              title={importing ? 'Importing…' : 'Import data (JSON)'}
              variant="outline"
              fullWidth
              onPress={handleImport}
              disabled={importing || exporting}
            />
            <ThemedText type="caption" style={[styles.value, { marginTop: Spacing.sm }]}>
              {workouts.length} workouts · {routines.length} routines · {measurements.length}{' '}
              measurements
            </ThemedText>
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

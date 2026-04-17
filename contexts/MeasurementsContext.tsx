import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { BodyMeasurement } from '@/types/workout';

const STORAGE_KEY = '@workout-v2/measurements';

interface MeasurementsState {
  loading: boolean;
  measurements: BodyMeasurement[];
  addMeasurement: (weightKg: number, notes?: string) => Promise<BodyMeasurement>;
  removeMeasurement: (id: string) => Promise<void>;
}

const MeasurementsContext = createContext<MeasurementsState | undefined>(undefined);

let counter = 0;
const newId = () => `measurement-${Date.now()}-${++counter}`;

export function MeasurementsProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && raw) setMeasurements(JSON.parse(raw));
      } catch {
        /* noop */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(measurements)).catch(() => {});
  }, [loading, measurements]);

  const addMeasurement = useCallback(async (weightKg: number, notes?: string) => {
    const measurement: BodyMeasurement = {
      id: newId(),
      loggedAt: new Date().toISOString(),
      weightKg,
      notes,
    };
    setMeasurements((prev) =>
      [measurement, ...prev].sort(
        (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
      ),
    );
    return measurement;
  }, []);

  const removeMeasurement = useCallback(async (id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const value = useMemo(
    () => ({ loading, measurements, addMeasurement, removeMeasurement }),
    [loading, measurements, addMeasurement, removeMeasurement],
  );

  return <MeasurementsContext.Provider value={value}>{children}</MeasurementsContext.Provider>;
}

export function useMeasurements() {
  const ctx = useContext(MeasurementsContext);
  if (!ctx) throw new Error('useMeasurements must be used within a MeasurementsProvider');
  return ctx;
}

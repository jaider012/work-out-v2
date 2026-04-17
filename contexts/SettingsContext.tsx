import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type WeightUnit = 'kg' | 'lbs';

interface SettingsState {
  loading: boolean;
  weightUnit: WeightUnit;
  setWeightUnit: (unit: WeightUnit) => void;
}

const STORAGE_KEY = '@workout-v2/settings';
const KG_TO_LBS = 2.20462;

const SettingsContext = createContext<SettingsState | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [weightUnit, setWeightUnitState] = useState<WeightUnit>('kg');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (cancelled) return;
        if (raw) {
          const parsed = JSON.parse(raw) as { weightUnit?: WeightUnit };
          if (parsed.weightUnit === 'kg' || parsed.weightUnit === 'lbs') {
            setWeightUnitState(parsed.weightUnit);
          }
        }
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
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ weightUnit })).catch(() => {});
  }, [loading, weightUnit]);

  const setWeightUnit = useCallback((unit: WeightUnit) => {
    setWeightUnitState(unit);
  }, []);

  const value = useMemo(
    () => ({ loading, weightUnit, setWeightUnit }),
    [loading, weightUnit, setWeightUnit],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}

/** Convert a weight stored as kg into the user's preferred display unit. */
export function fromKg(kg: number, unit: WeightUnit) {
  if (unit === 'lbs') return Math.round(kg * KG_TO_LBS * 10) / 10;
  return Math.round(kg * 10) / 10;
}

/** Convert a weight typed in the user's display unit back to kg for storage. */
export function toKg(value: number, unit: WeightUnit) {
  if (unit === 'lbs') return Math.round((value / KG_TO_LBS) * 100) / 100;
  return value;
}

export function formatWeight(kg: number, unit: WeightUnit) {
  return `${fromKg(kg, unit)} ${unit}`;
}

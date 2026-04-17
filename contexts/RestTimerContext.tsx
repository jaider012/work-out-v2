import * as Haptics from 'expo-haptics';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface RestTimerState {
  remaining: number;
  total: number;
  active: boolean;
  start: (seconds: number) => void;
  add: (seconds: number) => void;
  stop: () => void;
}

const RestTimerContext = createContext<RestTimerState | undefined>(undefined);

export function RestTimerProvider({ children }: { children: React.ReactNode }) {
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completionFiredRef = useRef(false);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRemaining(0);
    setTotal(0);
    completionFiredRef.current = false;
  }, []);

  const start = useCallback((seconds: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    completionFiredRef.current = false;
    setTotal(seconds);
    setRemaining(seconds);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          if (!completionFiredRef.current) {
            completionFiredRef.current = true;
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const add = useCallback((seconds: number) => {
    setRemaining((prev) => Math.max(0, prev + seconds));
    setTotal((prev) => Math.max(0, prev + seconds));
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const value = useMemo<RestTimerState>(
    () => ({
      remaining,
      total,
      active: remaining > 0,
      start,
      add,
      stop,
    }),
    [remaining, total, start, add, stop],
  );

  return <RestTimerContext.Provider value={value}>{children}</RestTimerContext.Provider>;
}

export function useRestTimer() {
  const context = useContext(RestTimerContext);
  if (!context) {
    throw new Error('useRestTimer must be used within a RestTimerProvider');
  }
  return context;
}

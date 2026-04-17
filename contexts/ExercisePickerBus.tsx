import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

type Listener = (ids: string[]) => void;

interface PickerBus {
  /** Optional consumer-defined sink. Used by exercise-picker after Add is tapped. */
  publish: (ids: string[]) => void;
  /** Subscribe to receive selections; returns an unsubscribe function. */
  subscribe: (listener: Listener) => () => void;
  /** Last published selection (cleared after consumption via consume()). */
  pending: string[] | null;
  consume: () => string[] | null;
}

const ExercisePickerBusContext = createContext<PickerBus | undefined>(undefined);

export function ExercisePickerBusProvider({ children }: { children: React.ReactNode }) {
  const listeners = useRef<Set<Listener>>(new Set());
  const [pending, setPending] = useState<string[] | null>(null);

  const subscribe = useCallback((listener: Listener) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  const publish = useCallback((ids: string[]) => {
    setPending(ids);
    listeners.current.forEach((l) => {
      try {
        l(ids);
      } catch {
        /* noop */
      }
    });
  }, []);

  const consume = useCallback(() => {
    const value = pending;
    setPending(null);
    return value;
  }, [pending]);

  const value = useMemo<PickerBus>(
    () => ({ publish, subscribe, pending, consume }),
    [publish, subscribe, pending, consume],
  );

  return (
    <ExercisePickerBusContext.Provider value={value}>{children}</ExercisePickerBusContext.Provider>
  );
}

export function useExercisePickerBus() {
  const ctx = useContext(ExercisePickerBusContext);
  if (!ctx) throw new Error('useExercisePickerBus must be used within ExercisePickerBusProvider');
  return ctx;
}

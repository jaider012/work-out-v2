import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { SAMPLE_FOLDERS, SAMPLE_ROUTINES } from '@/data/sampleRoutines';
import type {
  Routine,
  RoutineFolder,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from '@/types/workout';

const STORAGE_KEYS = {
  workouts: '@workout-v2/workouts',
  routines: '@workout-v2/routines',
  folders: '@workout-v2/folders',
  active: '@workout-v2/active-workout',
};

type WorkoutContextValue = {
  loading: boolean;
  workouts: Workout[];
  routines: Routine[];
  folders: RoutineFolder[];
  activeWorkout: Workout | null;

  // active workout actions
  startEmptyWorkout: () => Workout;
  startRoutine: (routineId: string) => Workout | null;
  finishActiveWorkout: () => Promise<Workout | null>;
  discardActiveWorkout: () => Promise<void>;
  updateActiveWorkout: (updater: (workout: Workout) => Workout) => void;
  addExercisesToActive: (exerciseIds: string[]) => void;
  removeExerciseFromActive: (workoutExerciseId: string) => void;
  addSetToExercise: (workoutExerciseId: string) => void;
  updateSet: (workoutExerciseId: string, setId: string, patch: Partial<WorkoutSet>) => void;
  removeSet: (workoutExerciseId: string, setId: string) => void;

  // routines
  saveRoutine: (routine: Routine) => Promise<void>;
  deleteRoutine: (routineId: string) => Promise<void>;
};

const WorkoutContext = createContext<WorkoutContextValue | undefined>(undefined);

let setIdCounter = 0;
const newId = (prefix: string) => `${prefix}-${Date.now()}-${++setIdCounter}`;

const createEmptySet = (): WorkoutSet => ({
  id: newId('set'),
  weight: 0,
  reps: 0,
  completed: false,
  type: 'normal',
});

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [folders, setFolders] = useState<RoutineFolder[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

  // Hydrate from AsyncStorage on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [workoutsRaw, routinesRaw, foldersRaw, activeRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.workouts),
          AsyncStorage.getItem(STORAGE_KEYS.routines),
          AsyncStorage.getItem(STORAGE_KEYS.folders),
          AsyncStorage.getItem(STORAGE_KEYS.active),
        ]);
        if (cancelled) return;
        setWorkouts(workoutsRaw ? JSON.parse(workoutsRaw) : []);
        setRoutines(routinesRaw ? JSON.parse(routinesRaw) : SAMPLE_ROUTINES);
        setFolders(foldersRaw ? JSON.parse(foldersRaw) : SAMPLE_FOLDERS);
        setActiveWorkout(activeRaw ? JSON.parse(activeRaw) : null);
      } catch (error) {
        console.warn('Failed to hydrate workout state', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist on change (after hydration so we don't overwrite with defaults).
  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem(STORAGE_KEYS.workouts, JSON.stringify(workouts)).catch(() => {});
  }, [loading, workouts]);

  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem(STORAGE_KEYS.routines, JSON.stringify(routines)).catch(() => {});
  }, [loading, routines]);

  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem(STORAGE_KEYS.folders, JSON.stringify(folders)).catch(() => {});
  }, [loading, folders]);

  useEffect(() => {
    if (loading) return;
    if (activeWorkout) {
      AsyncStorage.setItem(STORAGE_KEYS.active, JSON.stringify(activeWorkout)).catch(() => {});
    } else {
      AsyncStorage.removeItem(STORAGE_KEYS.active).catch(() => {});
    }
  }, [loading, activeWorkout]);

  const startEmptyWorkout = useCallback((): Workout => {
    const workout: Workout = {
      id: newId('workout'),
      name: 'Workout',
      startedAt: new Date().toISOString(),
      exercises: [],
    };
    setActiveWorkout(workout);
    return workout;
  }, []);

  const startRoutine = useCallback(
    (routineId: string): Workout | null => {
      const routine = routines.find((r) => r.id === routineId);
      if (!routine) return null;
      const workout: Workout = {
        id: newId('workout'),
        name: routine.name,
        startedAt: new Date().toISOString(),
        exercises: routine.exercises.map((ex) => ({
          id: newId('we'),
          exerciseId: ex.exerciseId,
          notes: ex.notes,
          restSeconds: ex.restSeconds,
          sets: ex.sets.length
            ? ex.sets.map(() => createEmptySet())
            : [createEmptySet()],
        })),
      };
      setActiveWorkout(workout);
      return workout;
    },
    [routines],
  );

  const finishActiveWorkout = useCallback(async (): Promise<Workout | null> => {
    if (!activeWorkout) return null;
    const finishedAt = new Date().toISOString();
    const durationSeconds = Math.max(
      0,
      Math.round(
        (new Date(finishedAt).getTime() - new Date(activeWorkout.startedAt).getTime()) / 1000,
      ),
    );
    const finished: Workout = {
      ...activeWorkout,
      finishedAt,
      durationSeconds,
      exercises: activeWorkout.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets.filter((set) => set.completed),
      })),
    };
    setWorkouts((prev) => [finished, ...prev]);
    setActiveWorkout(null);
    return finished;
  }, [activeWorkout]);

  const discardActiveWorkout = useCallback(async () => {
    setActiveWorkout(null);
  }, []);

  const updateActiveWorkout = useCallback((updater: (workout: Workout) => Workout) => {
    setActiveWorkout((current) => (current ? updater(current) : current));
  }, []);

  const addExercisesToActive = useCallback((exerciseIds: string[]) => {
    setActiveWorkout((current) => {
      if (!current) return current;
      const additions: WorkoutExercise[] = exerciseIds.map((exerciseId) => ({
        id: newId('we'),
        exerciseId,
        sets: [createEmptySet()],
      }));
      return { ...current, exercises: [...current.exercises, ...additions] };
    });
  }, []);

  const removeExerciseFromActive = useCallback((workoutExerciseId: string) => {
    setActiveWorkout((current) => {
      if (!current) return current;
      return {
        ...current,
        exercises: current.exercises.filter((ex) => ex.id !== workoutExerciseId),
      };
    });
  }, []);

  const addSetToExercise = useCallback((workoutExerciseId: string) => {
    setActiveWorkout((current) => {
      if (!current) return current;
      return {
        ...current,
        exercises: current.exercises.map((ex) =>
          ex.id === workoutExerciseId
            ? { ...ex, sets: [...ex.sets, createEmptySet()] }
            : ex,
        ),
      };
    });
  }, []);

  const updateSet = useCallback(
    (workoutExerciseId: string, setId: string, patch: Partial<WorkoutSet>) => {
      setActiveWorkout((current) => {
        if (!current) return current;
        return {
          ...current,
          exercises: current.exercises.map((ex) =>
            ex.id === workoutExerciseId
              ? {
                  ...ex,
                  sets: ex.sets.map((set) =>
                    set.id === setId ? { ...set, ...patch } : set,
                  ),
                }
              : ex,
          ),
        };
      });
    },
    [],
  );

  const removeSet = useCallback((workoutExerciseId: string, setId: string) => {
    setActiveWorkout((current) => {
      if (!current) return current;
      return {
        ...current,
        exercises: current.exercises.map((ex) =>
          ex.id === workoutExerciseId
            ? { ...ex, sets: ex.sets.filter((set) => set.id !== setId) }
            : ex,
        ),
      };
    });
  }, []);

  const saveRoutine = useCallback(async (routine: Routine) => {
    setRoutines((prev) => {
      const exists = prev.some((r) => r.id === routine.id);
      const updated = { ...routine, updatedAt: new Date().toISOString() };
      return exists ? prev.map((r) => (r.id === routine.id ? updated : r)) : [updated, ...prev];
    });
  }, []);

  const deleteRoutine = useCallback(async (routineId: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== routineId));
  }, []);

  const value = useMemo<WorkoutContextValue>(
    () => ({
      loading,
      workouts,
      routines,
      folders,
      activeWorkout,
      startEmptyWorkout,
      startRoutine,
      finishActiveWorkout,
      discardActiveWorkout,
      updateActiveWorkout,
      addExercisesToActive,
      removeExerciseFromActive,
      addSetToExercise,
      updateSet,
      removeSet,
      saveRoutine,
      deleteRoutine,
    }),
    [
      loading,
      workouts,
      routines,
      folders,
      activeWorkout,
      startEmptyWorkout,
      startRoutine,
      finishActiveWorkout,
      discardActiveWorkout,
      updateActiveWorkout,
      addExercisesToActive,
      removeExerciseFromActive,
      addSetToExercise,
      updateSet,
      removeSet,
      saveRoutine,
      deleteRoutine,
    ],
  );

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkouts() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkouts must be used within a WorkoutProvider');
  }
  return context;
}

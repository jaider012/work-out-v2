import { getExerciseById } from '@/data/exercises';
import type { MuscleGroup, Workout, WorkoutSet } from '@/types/workout';

export function setVolumeKg(set: WorkoutSet) {
  return (set.weight || 0) * (set.reps || 0);
}

export function computeWorkoutVolumeKg(workout: Pick<Workout, 'exercises'>) {
  let total = 0;
  for (const ex of workout.exercises) {
    for (const set of ex.sets) {
      if (set.completed === false) continue;
      total += setVolumeKg(set);
    }
  }
  return total;
}

export function totalSets(workout: Pick<Workout, 'exercises'>) {
  return workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
}

export function totalReps(workout: Pick<Workout, 'exercises'>) {
  return workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((s, set) => s + (set.reps || 0), 0),
    0,
  );
}

export function muscleVolumeMap(workouts: Workout[]): Record<MuscleGroup, number> {
  const acc = {} as Record<MuscleGroup, number>;
  for (const workout of workouts) {
    for (const ex of workout.exercises) {
      const exercise = getExerciseById(ex.exerciseId);
      if (!exercise) continue;
      const volume = ex.sets.reduce((sum, set) => sum + setVolumeKg(set), 0);
      acc[exercise.primaryMuscle] = (acc[exercise.primaryMuscle] ?? 0) + volume;
      for (const muscle of exercise.secondaryMuscles ?? []) {
        acc[muscle] = (acc[muscle] ?? 0) + volume / 2;
      }
    }
  }
  return acc;
}

export function workoutsInLastDays(workouts: Workout[], days: number): Workout[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return workouts.filter((w) => new Date(w.startedAt).getTime() >= cutoff);
}

export function formatDuration(seconds: number | undefined) {
  if (!seconds) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h) return `${h}h ${m}m`;
  return `${m}m`;
}

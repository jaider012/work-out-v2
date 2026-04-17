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
      if (set.type === 'warmup') continue;
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

/** Weekly volume buckets (oldest → newest), most recent week last. */
export function volumePerWeek(
  workouts: Workout[],
  weekCount = 8,
  now = new Date(),
): { weekStart: Date; volumeKg: number }[] {
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  // Move to the most recent Monday so weeks align with ISO calendars.
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const buckets: { weekStart: Date; volumeKg: number }[] = [];
  for (let i = weekCount - 1; i >= 0; i -= 1) {
    const weekStart = new Date(start.getTime() - i * weekMs);
    buckets.push({ weekStart, volumeKg: 0 });
  }
  for (const workout of workouts) {
    const ts = new Date(workout.startedAt).getTime();
    const idx = buckets.findIndex(
      (b) => ts >= b.weekStart.getTime() && ts < b.weekStart.getTime() + weekMs,
    );
    if (idx >= 0) {
      buckets[idx].volumeKg += computeWorkoutVolumeKg(workout);
    }
  }
  return buckets;
}

export function formatDuration(seconds: number | undefined) {
  if (!seconds) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h) return `${h}h ${m}m`;
  return `${m}m`;
}

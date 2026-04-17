import type { Workout, WorkoutSet } from '@/types/workout';

export interface PerformedSet {
  weight: number;
  reps: number;
  workoutId: string;
  startedAt: string;
}

/** All historical working sets (excludes warmups) for a given exercise, newest first. */
export function setsForExercise(workouts: Workout[], exerciseId: string): PerformedSet[] {
  const acc: PerformedSet[] = [];
  for (const workout of workouts) {
    for (const ex of workout.exercises) {
      if (ex.exerciseId !== exerciseId) continue;
      for (const set of ex.sets) {
        if (set.completed === false) continue;
        if (set.type === 'warmup') continue;
        acc.push({
          weight: set.weight,
          reps: set.reps,
          workoutId: workout.id,
          startedAt: workout.startedAt,
        });
      }
    }
  }
  return acc.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

/** Last logged session's sets for the exercise (used for the "previous" placeholder). */
export function previousSession(workouts: Workout[], exerciseId: string): WorkoutSet[] {
  for (const workout of workouts) {
    const ex = workout.exercises.find((e) => e.exerciseId === exerciseId);
    if (ex && ex.sets.some((s) => s.completed)) {
      return ex.sets.filter((s) => s.completed);
    }
  }
  return [];
}

/** Best (heaviest) set ever performed for the exercise. */
export function bestSetEver(workouts: Workout[], exerciseId: string): PerformedSet | null {
  const sets = setsForExercise(workouts, exerciseId);
  if (sets.length === 0) return null;
  return sets.reduce((best, s) => (s.weight > best.weight ? s : best));
}

/** Estimated 1 rep max via Epley formula. */
export function estimateOneRepMax(weight: number, reps: number) {
  if (!weight || !reps) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/** Best estimated 1RM ever for the exercise. */
export function bestOneRepMax(workouts: Workout[], exerciseId: string): number {
  return setsForExercise(workouts, exerciseId).reduce(
    (best, s) => Math.max(best, estimateOneRepMax(s.weight, s.reps)),
    0,
  );
}

/**
 * Detect personal records inside a freshly finished workout.
 * Returns a set of "<workoutExerciseId>:<setId>" identifiers that beat the
 * previous best for the exercise.
 */
export function detectPRs(workout: Workout, history: Workout[]): Set<string> {
  const prs = new Set<string>();
  // History excludes the workout itself.
  const past = history.filter((w) => w.id !== workout.id);
  for (const ex of workout.exercises) {
    const previousBest = bestOneRepMax(past, ex.exerciseId);
    let currentBest = previousBest;
    for (const set of ex.sets) {
      if (!set.completed) continue;
      if (set.type === 'warmup') continue;
      const oneRm = estimateOneRepMax(set.weight, set.reps);
      if (oneRm > currentBest && oneRm > 0) {
        prs.add(`${ex.id}:${set.id}`);
        currentBest = oneRm;
      }
    }
  }
  return prs;
}

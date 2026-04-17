import type { Routine } from '@/types/workout';

function buildRoutine(
  id: string,
  name: string,
  description: string,
  exerciseIds: string[],
  setsPerExercise = 3,
): Routine & { description: string } {
  return {
    id,
    name,
    description,
    updatedAt: new Date().toISOString(),
    exercises: exerciseIds.map((exerciseId, exerciseIdx) => ({
      id: `${id}-we-${exerciseIdx}`,
      exerciseId,
      sets: Array.from({ length: setsPerExercise }, (_, setIdx) => ({
        id: `${id}-set-${exerciseIdx}-${setIdx}`,
        weight: 0,
        reps: 0,
        completed: false,
        type: 'normal' as const,
      })),
    })),
  };
}

/**
 * Curated starter routines the user can copy into their own library. Mirrors
 * Hevy's "Discover" tab where you can browse community / featured programs.
 */
export const DISCOVER_ROUTINES = [
  buildRoutine(
    'discover-ppl-push',
    'Classic Push Day',
    'Chest, shoulders, triceps — bench, overhead press, isolation.',
    ['bench-press', 'overhead-press', 'incline-bench-db', 'lateral-raise', 'tricep-pushdown'],
  ),
  buildRoutine(
    'discover-ppl-pull',
    'Classic Pull Day',
    'Lats, upper back, biceps — deadlift, rows, curls.',
    ['deadlift', 'pull-up', 'barbell-row', 'face-pull', 'bicep-curl', 'hammer-curl'],
  ),
  buildRoutine(
    'discover-ppl-legs',
    'Classic Leg Day',
    'Squat, posterior chain, calves.',
    ['squat', 'romanian-deadlift', 'leg-press', 'leg-curl', 'standing-calf-raise'],
  ),
  buildRoutine(
    'discover-upper',
    'Heavy Upper',
    'Low-volume, high-intensity upper body for the novice.',
    ['bench-press', 'barbell-row', 'db-shoulder-press', 'pull-up', 'skullcrusher'],
    4,
  ),
  buildRoutine(
    'discover-lower',
    'Heavy Lower',
    'Compound-heavy lower body strength.',
    ['squat', 'romanian-deadlift', 'hip-thrust', 'leg-extension', 'seated-calf-raise'],
    4,
  ),
  buildRoutine(
    'discover-fullbody',
    'Full Body (30 min)',
    'Hit every group in half an hour — great for busy days.',
    ['squat', 'bench-press', 'barbell-row', 'overhead-press', 'plank'],
    3,
  ),
];

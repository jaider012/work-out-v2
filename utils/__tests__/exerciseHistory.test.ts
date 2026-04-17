import type { Workout } from '@/types/workout';

import { detectPRs, estimateOneRepMax, setsForExercise } from '../exerciseHistory';

function makeWorkout(
  id: string,
  startedAt: string,
  exercises: { id: string; exerciseId: string; sets: { weight: number; reps: number; completed?: boolean; type?: 'normal' | 'warmup' | 'failure' | 'drop' }[] }[],
): Workout {
  return {
    id,
    name: 'Test',
    startedAt,
    exercises: exercises.map((ex) => ({
      id: ex.id,
      exerciseId: ex.exerciseId,
      sets: ex.sets.map((set, idx) => ({
        id: `${ex.id}-set-${idx}`,
        weight: set.weight,
        reps: set.reps,
        completed: set.completed ?? true,
        type: set.type,
      })),
    })),
  };
}

describe('estimateOneRepMax', () => {
  it('returns the weight when reps is 1', () => {
    expect(estimateOneRepMax(100, 1)).toBe(100);
  });

  it('scales up via the Epley formula', () => {
    // 100 * (1 + 5/30) = 116.666…, rounded
    expect(estimateOneRepMax(100, 5)).toBe(117);
  });

  it('returns 0 when weight or reps is 0', () => {
    expect(estimateOneRepMax(0, 5)).toBe(0);
    expect(estimateOneRepMax(50, 0)).toBe(0);
  });
});

describe('setsForExercise', () => {
  const workouts = [
    makeWorkout('w-1', '2026-01-01T10:00:00Z', [
      {
        id: 'we-1',
        exerciseId: 'bench-press',
        sets: [
          { weight: 40, reps: 5, type: 'warmup' },
          { weight: 80, reps: 5 },
        ],
      },
    ]),
  ];

  it('excludes warmup sets', () => {
    const result = setsForExercise(workouts, 'bench-press');
    expect(result).toHaveLength(1);
    expect(result[0].weight).toBe(80);
  });
});

describe('detectPRs', () => {
  it('flags a heavier set than the historical best', () => {
    const older = makeWorkout('w-1', '2026-01-01T10:00:00Z', [
      {
        id: 'we-1',
        exerciseId: 'bench-press',
        sets: [{ weight: 80, reps: 5 }],
      },
    ]);
    const current = makeWorkout('w-2', '2026-01-08T10:00:00Z', [
      {
        id: 'we-1',
        exerciseId: 'bench-press',
        sets: [{ weight: 100, reps: 5 }],
      },
    ]);
    const prs = detectPRs(current, [older]);
    expect(prs.size).toBe(1);
  });

  it('does not flag warmups as PRs', () => {
    const current = makeWorkout('w-2', '2026-01-08T10:00:00Z', [
      {
        id: 'we-1',
        exerciseId: 'bench-press',
        sets: [{ weight: 200, reps: 1, type: 'warmup' }],
      },
    ]);
    expect(detectPRs(current, []).size).toBe(0);
  });
});

import type { Workout } from '@/types/workout';

import { computeStreak, workoutsByDay } from '../streak';

function mockWorkout(daysAgo: number, now = new Date('2026-01-15T12:00:00Z')): Workout {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  return {
    id: `w-${daysAgo}`,
    name: 'Test',
    startedAt: d.toISOString(),
    exercises: [],
  };
}

describe('computeStreak', () => {
  const now = new Date('2026-01-15T12:00:00Z');

  it('returns 0 when there are no workouts', () => {
    expect(computeStreak([], now)).toBe(0);
  });

  it('returns 0 when the latest workout was more than a day ago', () => {
    expect(computeStreak([mockWorkout(2, now)], now)).toBe(0);
  });

  it('counts today as a streak of 1', () => {
    expect(computeStreak([mockWorkout(0, now)], now)).toBe(1);
  });

  it('handles a 3-day streak of consecutive days', () => {
    expect(
      computeStreak(
        [mockWorkout(0, now), mockWorkout(1, now), mockWorkout(2, now)],
        now,
      ),
    ).toBe(3);
  });

  it('ignores duplicate workouts on the same day', () => {
    const today = [mockWorkout(0, now), mockWorkout(0, now)];
    expect(computeStreak(today, now)).toBe(1);
  });
});

describe('workoutsByDay', () => {
  const now = new Date('2026-01-15T12:00:00Z');

  it('groups multiple workouts on the same day under one key', () => {
    const map = workoutsByDay([mockWorkout(0, now), mockWorkout(0, now)]);
    expect(Array.from(map.values())[0]).toBe(2);
  });

  it('keeps separate keys per day', () => {
    const map = workoutsByDay([mockWorkout(0, now), mockWorkout(2, now)]);
    expect(map.size).toBe(2);
  });
});

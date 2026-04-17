import type { Workout } from '@/types/workout';

function startOfDay(input: Date | number | string) {
  const d = typeof input === 'string' ? new Date(input) : new Date(input);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayDiff(a: Date, b: Date) {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * A Hevy-style streak counts consecutive days with at least one finished
 * workout. We allow the streak to include "today", and reset only after a
 * whole day without training.
 */
export function computeStreak(workouts: Workout[], now = new Date()): number {
  if (workouts.length === 0) return 0;
  const uniqueDays = Array.from(
    new Set(workouts.map((w) => startOfDay(w.startedAt).getTime())),
  ).sort((a, b) => b - a);

  let streak = 0;
  let cursor = startOfDay(now);
  let idx = 0;

  // If the latest workout was today, streak starts at 1 today.
  // If the latest was yesterday, the streak is still active.
  const latestDay = new Date(uniqueDays[0]);
  const delta = dayDiff(cursor, latestDay);
  if (delta > 1) return 0;

  // Start counting from the latest day.
  cursor = latestDay;

  while (idx < uniqueDays.length) {
    const day = new Date(uniqueDays[idx]);
    if (dayDiff(cursor, day) === 0) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      idx += 1;
    } else {
      break;
    }
  }

  return streak;
}

/** Map of YYYY-MM-DD → workout count, used by the history calendar. */
export function workoutsByDay(workouts: Workout[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const w of workouts) {
    const d = startOfDay(w.startedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

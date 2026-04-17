import type { Routine, RoutineFolder } from '@/types/workout';

const now = new Date().toISOString();

export const SAMPLE_FOLDERS: RoutineFolder[] = [
  { id: 'folder-ppl', name: 'Push / Pull / Legs' },
  { id: 'folder-upper-lower', name: 'Upper / Lower' },
];

export const SAMPLE_ROUTINES: Routine[] = [
  {
    id: 'routine-push',
    name: 'Push Day',
    folderId: 'folder-ppl',
    updatedAt: now,
    exercises: [
      { id: 'we-1', exerciseId: 'bench-press', sets: emptySets(4) },
      { id: 'we-2', exerciseId: 'overhead-press', sets: emptySets(3) },
      { id: 'we-3', exerciseId: 'incline-bench-db', sets: emptySets(3) },
      { id: 'we-4', exerciseId: 'lateral-raise', sets: emptySets(3) },
      { id: 'we-5', exerciseId: 'tricep-pushdown', sets: emptySets(3) },
    ],
  },
  {
    id: 'routine-pull',
    name: 'Pull Day',
    folderId: 'folder-ppl',
    updatedAt: now,
    exercises: [
      { id: 'we-1', exerciseId: 'deadlift', sets: emptySets(3) },
      { id: 'we-2', exerciseId: 'pull-up', sets: emptySets(4) },
      { id: 'we-3', exerciseId: 'barbell-row', sets: emptySets(3) },
      { id: 'we-4', exerciseId: 'face-pull', sets: emptySets(3) },
      { id: 'we-5', exerciseId: 'bicep-curl', sets: emptySets(3) },
    ],
  },
  {
    id: 'routine-legs',
    name: 'Leg Day',
    folderId: 'folder-ppl',
    updatedAt: now,
    exercises: [
      { id: 'we-1', exerciseId: 'squat', sets: emptySets(4) },
      { id: 'we-2', exerciseId: 'romanian-deadlift', sets: emptySets(3) },
      { id: 'we-3', exerciseId: 'leg-press', sets: emptySets(3) },
      { id: 'we-4', exerciseId: 'leg-curl', sets: emptySets(3) },
      { id: 'we-5', exerciseId: 'standing-calf-raise', sets: emptySets(4) },
    ],
  },
  {
    id: 'routine-upper',
    name: 'Upper Body',
    folderId: 'folder-upper-lower',
    updatedAt: now,
    exercises: [
      { id: 'we-1', exerciseId: 'bench-press', sets: emptySets(4) },
      { id: 'we-2', exerciseId: 'barbell-row', sets: emptySets(4) },
      { id: 'we-3', exerciseId: 'db-shoulder-press', sets: emptySets(3) },
      { id: 'we-4', exerciseId: 'pull-up', sets: emptySets(3) },
    ],
  },
];

function emptySets(count: number) {
  return Array.from({ length: count }, (_, idx) => ({
    id: `set-${idx + 1}`,
    weight: 0,
    reps: 0,
    completed: false,
    type: 'normal' as const,
  }));
}

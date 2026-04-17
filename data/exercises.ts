import type { Exercise } from '@/types/workout';

/**
 * Curated mock exercise library inspired by Hevy's catalog. Real Hevy ships a
 * library of ~400 exercises with videos; this is a starter set covering every
 * major muscle group so the picker, statistics and routines feel realistic.
 */
export const EXERCISES: Exercise[] = [
  // Chest
  { id: 'bench-press', name: 'Bench Press (Barbell)', primaryMuscle: 'chest', secondaryMuscles: ['triceps', 'shoulders'], equipment: 'barbell' },
  { id: 'incline-bench-db', name: 'Incline Bench Press (Dumbbell)', primaryMuscle: 'chest', secondaryMuscles: ['shoulders', 'triceps'], equipment: 'dumbbell' },
  { id: 'chest-fly', name: 'Chest Fly (Machine)', primaryMuscle: 'chest', equipment: 'machine' },
  { id: 'push-up', name: 'Push Up', primaryMuscle: 'chest', secondaryMuscles: ['triceps', 'shoulders'], equipment: 'bodyweight' },
  { id: 'cable-crossover', name: 'Cable Crossover', primaryMuscle: 'chest', equipment: 'cable' },

  // Back
  { id: 'deadlift', name: 'Deadlift (Barbell)', primaryMuscle: 'back', secondaryMuscles: ['hamstrings', 'glutes'], equipment: 'barbell' },
  { id: 'pull-up', name: 'Pull Up', primaryMuscle: 'back', secondaryMuscles: ['biceps'], equipment: 'bodyweight' },
  { id: 'lat-pulldown', name: 'Lat Pulldown (Cable)', primaryMuscle: 'back', secondaryMuscles: ['biceps'], equipment: 'cable' },
  { id: 'barbell-row', name: 'Bent Over Row (Barbell)', primaryMuscle: 'back', secondaryMuscles: ['biceps'], equipment: 'barbell' },
  { id: 'seated-row', name: 'Seated Cable Row', primaryMuscle: 'back', equipment: 'cable' },

  // Shoulders
  { id: 'overhead-press', name: 'Overhead Press (Barbell)', primaryMuscle: 'shoulders', secondaryMuscles: ['triceps'], equipment: 'barbell' },
  { id: 'db-shoulder-press', name: 'Shoulder Press (Dumbbell)', primaryMuscle: 'shoulders', secondaryMuscles: ['triceps'], equipment: 'dumbbell' },
  { id: 'lateral-raise', name: 'Lateral Raise (Dumbbell)', primaryMuscle: 'shoulders', equipment: 'dumbbell' },
  { id: 'face-pull', name: 'Face Pull (Cable)', primaryMuscle: 'shoulders', equipment: 'cable' },

  // Arms
  { id: 'bicep-curl', name: 'Bicep Curl (Dumbbell)', primaryMuscle: 'biceps', equipment: 'dumbbell' },
  { id: 'hammer-curl', name: 'Hammer Curl (Dumbbell)', primaryMuscle: 'biceps', secondaryMuscles: ['forearms'], equipment: 'dumbbell' },
  { id: 'preacher-curl', name: 'Preacher Curl (Cable)', primaryMuscle: 'biceps', equipment: 'cable' },
  { id: 'tricep-pushdown', name: 'Tricep Pushdown (Cable)', primaryMuscle: 'triceps', equipment: 'cable' },
  { id: 'skullcrusher', name: 'Skullcrusher (Barbell)', primaryMuscle: 'triceps', equipment: 'barbell' },
  { id: 'dip', name: 'Dip', primaryMuscle: 'triceps', secondaryMuscles: ['chest', 'shoulders'], equipment: 'bodyweight' },

  // Legs
  { id: 'squat', name: 'Squat (Barbell)', primaryMuscle: 'quads', secondaryMuscles: ['glutes', 'hamstrings'], equipment: 'barbell' },
  { id: 'front-squat', name: 'Front Squat (Barbell)', primaryMuscle: 'quads', secondaryMuscles: ['glutes'], equipment: 'barbell' },
  { id: 'leg-press', name: 'Leg Press (Machine)', primaryMuscle: 'quads', secondaryMuscles: ['glutes'], equipment: 'machine' },
  { id: 'leg-extension', name: 'Leg Extension (Machine)', primaryMuscle: 'quads', equipment: 'machine' },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift (Barbell)', primaryMuscle: 'hamstrings', secondaryMuscles: ['glutes'], equipment: 'barbell' },
  { id: 'leg-curl', name: 'Leg Curl (Machine)', primaryMuscle: 'hamstrings', equipment: 'machine' },
  { id: 'hip-thrust', name: 'Hip Thrust (Barbell)', primaryMuscle: 'glutes', secondaryMuscles: ['hamstrings'], equipment: 'barbell' },
  { id: 'lunge', name: 'Walking Lunge (Dumbbell)', primaryMuscle: 'quads', secondaryMuscles: ['glutes'], equipment: 'dumbbell' },
  { id: 'standing-calf-raise', name: 'Standing Calf Raise (Machine)', primaryMuscle: 'calves', equipment: 'machine' },
  { id: 'seated-calf-raise', name: 'Seated Calf Raise (Machine)', primaryMuscle: 'calves', equipment: 'machine' },

  // Core
  { id: 'plank', name: 'Plank', primaryMuscle: 'abs', equipment: 'bodyweight' },
  { id: 'cable-crunch', name: 'Cable Crunch', primaryMuscle: 'abs', equipment: 'cable' },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', primaryMuscle: 'abs', equipment: 'bodyweight' },

  // Cardio
  { id: 'treadmill', name: 'Treadmill', primaryMuscle: 'cardio', equipment: 'machine' },
  { id: 'rowing-machine', name: 'Rowing Machine', primaryMuscle: 'cardio', secondaryMuscles: ['back', 'fullBody'], equipment: 'machine' },
  { id: 'stair-master', name: 'Stair Climber', primaryMuscle: 'cardio', secondaryMuscles: ['glutes'], equipment: 'machine' },
];

export const MUSCLE_LABELS: Record<string, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  abs: 'Core',
  cardio: 'Cardio',
  fullBody: 'Full body',
};

export const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  machine: 'Machine',
  cable: 'Cable',
  bodyweight: 'Bodyweight',
  kettlebell: 'Kettlebell',
  band: 'Band',
  other: 'Other',
};

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((exercise) => exercise.id === id);
}

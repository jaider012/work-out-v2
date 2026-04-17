export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs'
  | 'cardio'
  | 'fullBody';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'kettlebell'
  | 'band'
  | 'other';

export interface Exercise {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  equipment: Equipment;
  instructions?: string;
}

export interface WorkoutSet {
  id: string;
  /** Logged weight in kg. */
  weight: number;
  reps: number;
  rpe?: number;
  completed: boolean;
  /** Set type, mirroring Hevy's W (warm up), F (failure), D (drop), normal. */
  type?: 'normal' | 'warmup' | 'failure' | 'drop';
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  sets: WorkoutSet[];
  notes?: string;
  /** Rest timer in seconds. */
  restSeconds?: number;
}

export interface Workout {
  id: string;
  name: string;
  /** ISO date string of when the workout started. */
  startedAt: string;
  /** ISO date string of when the workout was finished (undefined while active). */
  finishedAt?: string;
  /** Duration in seconds (cached for finished workouts). */
  durationSeconds?: number;
  exercises: WorkoutExercise[];
  notes?: string;
}

export interface Routine {
  id: string;
  name: string;
  /** Optional folder grouping (e.g. "Push / Pull / Legs"). */
  folderId?: string;
  exercises: WorkoutExercise[];
  updatedAt: string;
}

export interface RoutineFolder {
  id: string;
  name: string;
}

export interface WorkoutSummary {
  totalVolumeKg: number;
  totalSets: number;
  totalReps: number;
  prCount: number;
}

export interface BodyMeasurement {
  id: string;
  /** ISO date when the measurement was taken. */
  loggedAt: string;
  /** Body weight in kg (canonical storage). */
  weightKg: number;
  notes?: string;
}


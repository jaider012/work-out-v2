# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn start                # expo start (Metro bundler)
yarn ios | android | web  # expo start --ios / --android / --web
yarn lint                 # expo lint (eslint-config-expo flat config)
yarn test                 # jest (preset: jest-expo)
yarn test <pattern>       # single file, e.g. yarn test plateCalculator
yarn test -t "<name>"     # filter by test name
yarn e2e                  # maestro test .maestro (all 17 flows)
yarn e2e:flow .maestro/02_quick_start_workout.yaml   # single Maestro flow
node scripts/reset-project.js                        # reset to a blank Expo template
```

Maestro flows require a running simulator/emulator plus the app loaded via Expo Go or a dev build. Pass `APP_ID=host.exp.Exponent` for Expo Go, or the native bundle id for dev builds. E2E sign-in flows read `E2E_EMAIL` / `E2E_PASSWORD`.

Jest `testMatch` is restricted to `**/__tests__/**/*.test.ts(x)` — unit tests live next to the util they cover (`utils/__tests__/`).

## Architecture

This is an offline-first Hevy-style workout tracker on **Expo SDK 55 / RN 0.83 / React 19.2** using **expo-router v55 typed routes**. New Architecture is mandatory (`newArchEnabled: true` in `app.json`).

### Routing (`app/`)

File-based routing with nested stacks declared in `app/_layout.tsx`. The root stack conditionally renders `(tabs)` or `(auth)` based on Firebase Auth state from `AuthContext`. Most secondary screens (`active-workout`, `exercise-picker`, `routine/new`, `routine/[id]`, `routine/preview/[id]`, `measurements`, `settings`, `workout-complete`) are registered with `presentation: 'modal'` so users can dismiss back to the tab they came from. `active-workout` and `workout-complete` set `gestureEnabled: false` to prevent accidental swipe-to-dismiss.

The path alias `@/*` maps to the project root (see `tsconfig.json`).

### State layering

Six context providers wrap the app in a specific order in `app/_layout.tsx` — do not reorder unless you understand the dependencies:

```
AuthProvider → SettingsProvider → WorkoutProvider → MeasurementsProvider → RestTimerProvider → ExercisePickerBusProvider
```

- **`WorkoutContext`** is the data hub. It hydrates `workouts`, `routines`, `folders`, `activeWorkout`, and `personalRecords` from AsyncStorage on mount, then persists each slice via separate `useEffect`s guarded on `loading` (so defaults are never written back before hydration). Storage keys live under the `@workout-v2/` namespace. All mutations go through callbacks on this context (e.g. `startRoutine`, `updateSet`, `finishActiveWorkout`, `saveRoutine`). On finish, `detectPRs` compares against prior history to compute new PR set ids of the form `<workoutExerciseId>:<setId>`.
- **`SettingsContext`** owns the `kg`/`lbs` toggle. **Weights are always stored in kg canonically**; UI must pipe through `fromKg` / `toKg` / `formatWeight` from this module when displaying or accepting input. Do not persist values in the user's display unit.
- **`RestTimerContext`** is a global countdown so the timer keeps running when the user navigates away from `active-workout`. `RestTimerOverlay` is a floating chip that auto-shows while `active === true` and fires a success haptic on completion.
- **`ExercisePickerBus`** is a pub/sub shim. The `exercise-picker` modal doesn't know who opened it; instead it `publish`es selected ids, and the caller (`active-workout` or `RoutineEditor`) subscribes or polls `consume()`. When adding a new consumer of the picker, subscribe on mount and consume on focus — don't try to pass route params.
- **`AuthContext`** wraps Firebase Auth (`config/firebase.ts`). The root layout renders a `FullScreenLoader` while `loading` is true, then gates the tab stack on `user`.
- **`MeasurementsContext`** persists body weight entries; like WorkoutContext it stores kg canonically.

### Domain model (`types/workout.ts`)

Core shapes: `Exercise`, `WorkoutSet` (with `type: 'normal' | 'warmup' | 'failure' | 'drop'`, optional `rpe`), `WorkoutExercise` (optional `supersetId` — shared id means same superset group), `Workout`, `Routine` (with optional `folderId`), `RoutineFolder`, `BodyMeasurement`. `finishActiveWorkout` drops incomplete sets and empty exercises before archiving. Warmup sets are excluded from volume, history, PR detection.

### Shared editors / shells

- `components/RoutineEditor.tsx` is used by both `routine/new.tsx` and `routine/[id].tsx`.
- `components/ActiveWorkoutBanner.tsx` is the persistent "workout in progress" bar rendered above the tab bar.
- `components/PlateCalculatorSheet.tsx` handles both kg and lbs plates (see `utils/plateCalculator.ts`).
- `components/RestTimerOverlay.tsx` is rendered once at the root and reads from `RestTimerContext`.

### Data & utilities

- `data/exercises.ts` — ~35 starter exercises; lookup via `getExerciseById`.
- `data/sampleRoutines.ts`, `data/discoverRoutines.ts` — seed content used when storage is empty.
- `utils/workoutStats.ts` — volume, muscle distribution, weekly buckets.
- `utils/exerciseHistory.ts` — previous session, best set, Epley `estimateOneRepMax`, `detectPRs`.
- `utils/streak.ts`, `utils/plateCalculator.ts` — covered by unit tests.

### Maestro / testIDs

Maestro flows rely on stable `testID`s. When touching any flow covered by `.maestro/*.yaml`, keep the existing `testID`s intact (see `.maestro/README.md` for the canonical list: `home-start-empty-workout`, `workout-quick-start`, `active-workout-finish`, `set-weight-<weId>-<idx>`, etc.). Prefer adding `id:` selectors over `text:` when writing new flows — text copy changes break tests, IDs do not.

## Conventions

- Store weights in kg. Convert at the UI boundary via `SettingsContext` helpers.
- When mutating active-workout state, go through `WorkoutContext` callbacks — do not write to AsyncStorage directly.
- New modal screens need a `Stack.Screen` entry in `app/_layout.tsx` with `presentation: 'modal'`.
- Skip warmup sets in any stat/PR computation (mirrors Hevy behavior).
- Historical context for the SDK 53 → 55 migration and product research lives in `HEVY_RESEARCH.md`.

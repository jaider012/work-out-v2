# Hevy clone — research & implementation notes

This document captures the research that informed the Hevy-style restructuring
of `work-out-v2`, plus the upgrade from Expo SDK 53 → 55.

## 1. About Hevy

Hevy (`hevyapp.com`) is a strength-training tracker. Its product strategy
revolves around three pillars:

1. **Workout logging** — fast, distraction-free set/rep tracking.
2. **Progress tracking** — analytics, PRs, body diagrams, calendar.
3. **Socializing** — workout feed, follow other lifters, comment / like.

### Information architecture (4 main tabs)

| Tab | Purpose |
| --- | --- |
| **Home / Feed** | Reverse-chronological feed of workouts from people you follow with stats (duration, volume, PRs) and a discovery row for new users. |
| **Workout** | Quick Start (empty workout) + folders of routines/templates. Tapping a routine starts a logging session. |
| **History** | Calendar view + grouped list of past workouts with summaries; tap into a workout to see every set. |
| **Profile** | Statistics, exercises (with PRs and graphs per movement), measures, calendar, settings. |

Secondary surfaces: exercise picker (modal, with search + muscle/equipment
filters), in-progress workout (modal, can be minimized to keep the timer
running), routine editor.

### Key UX details we mirrored

- **Dark-first theme** with a violet accent (`#7C5CFF`) and near-black surfaces.
- **Pill-shaped primary buttons**.
- **Set row layout**: `SET | KG | REPS | ✓` — tappable checkbox commits the set.
- **Persistent in-progress workout** via local storage so the user can leave the
  screen (modal presentation in expo-router) and resume.
- **Folders for routines** with collapsible groups (Push/Pull/Legs, Upper/Lower).
- **Muscle distribution** bar chart on the profile (last 7 days).
- **Weekly activity row** on the history tab showing which days have a workout.

### Sources

- [Hevy app feature list](https://www.hevyapp.com/features/)
- [Hevy tutorial](https://www.hevyapp.com/hevy-tutorial/)
- [Gym performance tracking](https://www.hevyapp.com/features/gym-performance/)
- [Hevy social features](https://www.hevyapp.com/features/social-features/)
- [App Store listing](https://apps.apple.com/us/app/hevy-workout-tracker-gym-log/id1458862350)
- [Google Play listing](https://play.google.com/store/apps/details?id=com.hevy)

## 2. Expo SDK upgrade (53 → 55)

The project was on Expo SDK 53.0.12 (RN 0.79). It was bumped to **SDK 55.0.15**
(RN 0.83, React 19.2). Notes:

- React Native 0.83, React 19.2 (and `react-dom` 19.2).
- `react-native-reanimated` 3 → 4 (now requires `react-native-worklets`).
- All `expo-*` packages aligned with the SDK 55 bundled native module versions
  (see `node_modules/expo/bundledNativeModules.json`).
- `@expo/vector-icons` 14 → 15 (new icon set imports).
- `@react-native-async-storage/async-storage` 2.1 → 2.2.
- `@expo/metro-runtime` added (peer dep for `expo-router` 55).
- `expo-router` 5 → 55, `expo-router/entry` still works.
- New Architecture is mandatory in SDK 55 (already enabled here via
  `app.json`'s `newArchEnabled: true`).
- `expo-av` was removed in SDK 55 — we don't depend on it.

### Sources

- [Latest Expo changelog](https://expo.dev/changelog)
- [How to upgrade to Expo SDK 55](https://expo.dev/blog/upgrading-to-sdk-55)
- [Expo SDK 54 changelog](https://expo.dev/changelog/sdk-54)
- [Expo SDK upgrade walkthrough](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)
- [React Native New Architecture](https://docs.expo.dev/guides/new-architecture/)

## 3. Implementation summary

### New files

```
types/workout.ts                    # Exercise, WorkoutSet, Workout, Routine types
data/exercises.ts                   # ~35 starter exercises across muscle groups
data/sampleRoutines.ts              # Sample folders + Push/Pull/Legs routines
contexts/WorkoutContext.tsx         # AsyncStorage-backed state (active + log)
utils/workoutStats.ts               # Volume, sets, muscle distribution helpers
app/(tabs)/index.tsx                # Home / Feed
app/(tabs)/workout.tsx              # Quick Start + folders + routines
app/(tabs)/history.tsx              # Weekly activity + grouped history list
app/(tabs)/profile.tsx              # Stats, muscle distribution, settings menu
app/active-workout.tsx              # Modal: live set/rep logging + timer
app/exercise-picker.tsx             # Modal: search + muscle filter + multi-select
app/workout/[id].tsx                # Past workout detail
HEVY_RESEARCH.md                    # This file
```

### Removed (legacy tabs)

- `app/(tabs)/routines.tsx`, `app/(tabs)/progress.tsx`, `app/(tabs)/settings.tsx`
  — merged into the new tab structure.

### Updated

- `package.json` — SDK 55 versions across the board.
- `app/_layout.tsx` — adds `WorkoutProvider` and registers the modal routes.
- `app/(tabs)/_layout.tsx` — new tab order/icons (Home, Workout, History, Profile).
- `constants/Colors.ts` — Hevy-style dark palette with violet accent.
- `components/ui/IconSymbol.tsx` — expanded mapping (dumbbell, calendar,
  person, plus, checkmark, etc.).
- `hooks/useThemeColor.ts`, `components/Collapsible.tsx`,
  `components/ParallaxScrollView.tsx`, `app/(tabs)/_layout.tsx`,
  `app/+not-found.tsx` — small TS fixes for the new RN/React types.

## 4. End-to-end testing (Maestro)

E2E coverage lives under `.maestro/` and uses the Maestro YAML runner. Flows
target stable `testID`s sprinkled through the auth + workout screens (see the
`.maestro/README.md` for the full list).

| Flow | Covers |
| --- | --- |
| `01_sign_in.yaml` | Welcome → Sign in → Home |
| `02_quick_start_workout.yaml` | Quick Start → add Bench Press → log a set → Finish |
| `03_routine_workout.yaml` | Push Day routine → Finish |
| `04_history_review.yaml` | Workout shows up in History + Profile stats render |

Run them with:

```bash
yarn e2e                     # all flows in order
yarn e2e:flow .maestro/02_quick_start_workout.yaml
APP_ID=com.yourorg.workoutv2 yarn e2e   # against a development build
```

## 5. What is left to build

Things the real Hevy app has that this clone does not yet implement:

- Real social graph (the home feed currently shows only the local user's
  finished workouts).
- Routine editor UI (the model + persistence is there; only the screen is
  missing).
- Per-exercise history graphs (1RM, heaviest set, total volume per session).
- Body measurements + progress photos.
- Rest timer with notifications.
- Personal record detection and badges.
- Cloud sync (currently AsyncStorage only).
- Apple Health / Google Fit integration.

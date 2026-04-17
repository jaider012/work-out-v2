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
contexts/WorkoutContext.tsx         # AsyncStorage-backed state (active + log + PRs)
contexts/RestTimerContext.tsx       # Cross-screen rest timer with haptic feedback
contexts/ExercisePickerBus.tsx      # Pub/sub bus for exercise picker → routine editor
components/RestTimerOverlay.tsx     # Floating rest-timer chip (auto-shows when active)
components/RoutineEditor.tsx        # Shared editor used by /routine/new and /routine/[id]
utils/workoutStats.ts               # Volume, sets, muscle distribution helpers
utils/exerciseHistory.ts            # Previous session, best set, e1RM, PR detection
app/(tabs)/index.tsx                # Home / Feed
app/(tabs)/workout.tsx              # Quick Start + folders + routines (long-press menu)
app/(tabs)/history.tsx              # Weekly activity + grouped history list
app/(tabs)/profile.tsx              # Stats + main exercises + browse all + settings
app/active-workout.tsx              # Modal: logging, previous values, PR badges, rest timer, save-as-routine
app/exercise-picker.tsx             # Modal: search + muscle filter + multi-select (active/routine modes)
app/workout/[id].tsx                # Past workout detail
app/routine/new.tsx                 # Create routine
app/routine/[id].tsx                # Edit routine
app/exercise/[id].tsx               # Exercise detail with stats + history
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
| `05_create_routine.yaml` | New Routine → add 2 exercises → Save |
| `06_rest_timer_and_pr.yaml` | Heavy single → rest timer overlay → PR alert |
| `07_exercise_detail.yaml` | Profile → Browse exercises → Bench Press detail |

Run them with:

```bash
yarn e2e                     # all flows in order
yarn e2e:flow .maestro/02_quick_start_workout.yaml
APP_ID=com.yourorg.workoutv2 yarn e2e   # against a development build
```

## 5. Hevy-parity features — iteration 9 update

- ✅ **Routine search** on the Workout tab — matches both routine names
  and the exercises they contain.
- ✅ **Jump back in** strip on Home: horizontal cards for your 3 most
  recent routines that start the workout with one tap (or deep-link into
  the active one if a workout is already running).
- ✅ **Start workout with this exercise** CTA on the exercise detail page.
  If nothing is active it spins up an empty workout and adds the exercise;
  otherwise it appends to the current workout.
- ✅ Empty states polished (Workout tab now shows a dedicated card when
  search has no matches or the user has no routines yet).

## 6. Hevy-parity features — iteration 8 update

- ✅ **Plate calculator in lbs**: the sheet now picks the right plate set
  (kg: 25/20/15/10/5/2.5/1.25 · lbs: 45/35/25/10/5/2.5/1.25) and the bar
  weight follows the user's weight-unit preference.
- ✅ Tiny +/- **weight steppers** inline with every set's weight input
  (2.5 kg / 5 lbs increments).
- ✅ **7-day activity strip** at the top of Home, violet dots for workout
  days and a ring for today.
- ✅ "Danger zone" **Clear all data** button in Settings (wipes workouts,
  routines, folders and measurements).

## 7. Hevy-parity features — iteration 7 update

- ✅ **Supersets**: Create / Break superset lives in the exercise action
  menu. Grouped exercises share a letter badge (A, B, C…) and a violet
  left border so they read as a single block.
- ✅ **Plate calculator** sheet auto-splits a weight into bar + per-side
  plates using a standard kg plate set. Reachable from every barbell
  exercise via a "Plates" chip next to the rest-timer pill.
- ✅ **Personal Records** list screen at `/personal-records`, linked from
  the Profile tab. Sorted by estimated 1 RM, each row deep-links into the
  exercise detail page.

## 8. Hevy-parity features — iteration 6 update

- ✅ **Workout notes** field (multiline) at the top of the active workout,
  saved with the finished workout.
- ✅ **RPE input per set** via a tap-to-cycle badge: — → @6 → @7 → @8 → @9 →
  @10 → —.
- ✅ Long-press a workout in History to open an action sheet with an **Open**
  or **Delete** option (with confirm).
- ✅ Weekly volume **sparkline (8 weeks)** on Profile in addition to the
  existing muscle distribution chart.
- ✅ **JSON import** from Settings: pick a previously exported file and
  restore workouts + routines + folders (kept alongside the new Export).

## 9. Hevy-parity features — iteration 5 update

- ✅ Persistent **active workout banner** floats above the tab bar on every
  tab screen. Shows workout name, live elapsed timer and deep-links into the
  modal (exactly like Hevy's "resume" bar).
- ✅ **Repeat Workout** button on past workout detail. Clones the exercises
  (weights reset) and drops the user straight into logging.
- ✅ Exercise picker now has a second row of **equipment filters**
  (Any / Barbell / Dumbbell / Machine / Cable / Bodyweight).
- ✅ **Discover** section on the Workout tab with 6 curated starter routines
  (PPL, Upper, Lower, Full body) that can be copied into the user's library
  with one tap.
- ✅ **JSON export** from Settings (uses `expo-file-system` + `expo-sharing`)
  to back up workouts, routines, folders and body measurements.

## 10. Hevy-parity features — iteration 4 update

- ✅ Per-set type badge (Normal / Warmup / Failure / Drop) – tap to cycle
  through states, mirrors Hevy's W / F / D markers. Warmups are excluded
  from volume, PR detection and exercise history.
- ✅ Workout streak counter (consecutive days with at least one session)
  surfaced as a flame chip on Home and a stat on Profile.
- ✅ History tab now renders a full month calendar with violet dots on days
  that have a workout, today ring, prev/next navigation and day selection
  that filters the list below.
- ✅ Active workout header now shows "LAST" — how long ago the last workout
  was logged — alongside volume and sets.

## 11. Hevy-parity features — iteration 3 update

- ✅ Weight unit preference (kg / lbs) stored in `SettingsContext`, applied to
  every screen that shows volume / weight (home feed, history, profile,
  active workout, exercise detail, workout detail, measurements).
- ✅ Body measurements screen (`/measurements`) with body-weight logging,
  history list + removal, and a lightweight sparkline trend.
- ✅ E1RM trend sparkline on the exercise detail page.
- ✅ Per-exercise notes input in the active workout, plus exercise reorder
  (chevron up/down + "…" menu) in both the active workout and the routine
  editor.
- ✅ Settings modal at `/settings` (weight unit toggle + about).
- ✅ Profile cards now deep-link to Body Measurements and App Settings.

## 12. Hevy-parity features — earlier iterations

- ✅ Routine editor (create / edit / delete, folder picker, ad-hoc folder
  creation) reachable from the Workout tab and via long-press on a routine.
- ✅ Per-exercise history list with stats (sessions, total sets, best e1RM,
  heaviest set) at `/exercise/[id]`.
- ✅ Personal record detection on every finished workout (Epley e1RM); PR sets
  show a "PR" badge in the active workout and trigger an alert at finish time.
- ✅ "Previous" set values shown alongside the current input (so you know
  what you lifted last time, exactly like Hevy).
- ✅ Cross-screen rest timer with chip overlay, ±15 s controls, haptic on
  completion and per-exercise rest preset (Off / 60s / 90s / 2m / 3m / 4m).
- ✅ "Save as routine" from inside an active workout.
- ✅ Profile tab now lists Main Exercises (top by volume) and a search-driven
  "Browse all exercises" sheet that links to the exercise detail page.

## 6. What is still left to build

- Real social graph (the home feed currently shows only the local user's
  finished workouts).
- Per-exercise history graphs / charts (we list the data, no svg chart yet).
- Body measurements + progress photos.
- Rest timer push notification when the app is backgrounded.
- Cloud sync (currently AsyncStorage only).
- Apple Health / Google Fit integration.
- Drag-and-drop reordering of exercises and sets.

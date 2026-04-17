# work-out-v2 — Hevy-style workout tracker

A React Native / Expo SDK 55 workout tracker inspired by
[Hevy](https://www.hevyapp.com/). Every core flow Hevy ships — logging a
workout, routines in folders, rest timer, PR detection, body measurements,
calendar history, per-exercise charts — is implemented locally with
AsyncStorage persistence.

## Stack

- **Expo SDK 55** (`expo` `55.0.15`, React Native 0.83, React 19.2)
- **expo-router** v55 with typed routes
- **AsyncStorage** for offline-first data
- **expo-file-system** + **expo-sharing** for JSON export / import
- **expo-haptics** for rest-timer / PR haptics
- **Firebase Auth** for the email sign-in flow
- **jest-expo** for unit tests, **Maestro** for E2E flows

## Scripts

```bash
yarn start          # expo start
yarn ios            # expo start --ios
yarn android        # expo start --android
yarn web            # expo start --web
yarn lint           # expo lint
yarn test           # jest (utilities unit tests)
yarn e2e            # run every Maestro flow
yarn e2e:flow .maestro/02_quick_start_workout.yaml   # single flow
```

## Feature map (Hevy parity)

| Surface | What's in the clone |
| --- | --- |
| Tabs | Home · Workout · History · Profile (same as Hevy's Home / Workout / History / Profile) |
| Home | Welcome header + streak chip, 7-day activity strip, "Jump back in" routines, workout feed |
| Workout | Quick Start, routine search, folders with collapse, Discover carousel, long-press actions |
| Routine editor | Name, folder picker (with ad-hoc folder creation), exercise picker integration, reorder chevrons |
| Routine preview | Pre-start sheet with exercise list + planned sets + Edit shortcut |
| Active workout | Live timer, volume / sets / last-workout header, workout notes, per-exercise notes, superset letters, rest timer, plate calculator (kg/lbs), set type badge (N/W/F/D), RPE cycler, previous values per set, bodyweight auto-fill, +/- weight steppers, PR badge, Finish / Save as routine / Discard |
| Exercise library | 35+ exercises, muscle + equipment filters, search, multi-select picker |
| Exercise detail | Sessions / sets / best e1RM stats, heaviest set card, e1RM sparkline, per-session history, "Start workout" CTA |
| History | Full month calendar with violet dots + today ring, month/day filtering, long-press delete |
| Past workout detail | Per-set breakdown, Repeat Workout CTA |
| Profile | Stats grid (workouts / streak / week / sets / PRs / volume), weekly-volume sparkline, muscle distribution, main exercises, browse all exercises sheet |
| Personal Records | Dedicated `/personal-records` list sorted by e1RM |
| Body measurements | Log weight, sparkline, history list, delta vs previous |
| Settings | KG / LBS toggle, JSON export, JSON import, Clear all data |
| Persistent banner | Floating "Workout in progress" bar above every tab |
| Workout complete | Post-finish celebration screen with PR banner + share summary |

See [HEVY_RESEARCH.md](./HEVY_RESEARCH.md) for the research notes and a
per-iteration changelog.

## Project layout

```
app/                    # expo-router screens
  (auth)/               # welcome, sign-in, sign-up
  (tabs)/               # Home, Workout, History, Profile
  active-workout.tsx    # logging modal
  workout-complete.tsx  # post-finish summary
  exercise-picker.tsx   # picker modal
  routine/new.tsx
  routine/[id].tsx      # edit
  routine/preview/[id]  # preview-before-start
  workout/[id].tsx
  exercise/[id].tsx
  measurements.tsx
  personal-records.tsx
  settings.tsx
components/             # shared UI (Card, Button, Sparkline, MonthCalendar, …)
contexts/               # WorkoutContext, SettingsContext, MeasurementsContext,
                        # RestTimerContext, ExercisePickerBus, AuthContext
data/                   # exercises, starter routines, discover routines
types/                  # Exercise, Workout, Routine, BodyMeasurement
utils/                  # stats, streak, exercise history, plate calculator
.maestro/               # 16 Maestro E2E flows
utils/__tests__         # jest unit tests
```

## End-to-end testing

Sixteen Maestro YAML flows cover every major user journey. See
[.maestro/README.md](./.maestro/README.md) for how to run them against
Expo Go or a development build.

## Upgrading from Expo SDK 53

Historical context for the SDK 53 → 55 migration performed on this
repository is documented in
[HEVY_RESEARCH.md §2](./HEVY_RESEARCH.md#2-expo-sdk-upgrade-53--55).

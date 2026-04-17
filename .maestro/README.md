# Maestro end-to-end tests

End-to-end UI tests for the Hevy-style flows in this app. Maestro is a
declarative, YAML-based mobile test runner that drives a real iOS simulator,
Android emulator, or physical device.

## Prerequisites

1. Install the Maestro CLI: <https://docs.maestro.dev/getting-started/installing-maestro>
   ```bash
   curl -fsSL "https://get.maestro.mobile.dev" | bash
   ```
2. A running iOS simulator or Android emulator.
3. A built copy of the app on that device. Two options:
   - **Expo Go** (fastest for local dev) — `yarn start`, scan the QR with Expo
     Go. Then run flows with the Expo Go appId:
     ```bash
     APP_ID=host.exp.Exponent maestro test .maestro/02_quick_start_workout.yaml
     ```
   - **Development build / production build** — `eas build --profile development`
     and pass your bundle id:
     ```bash
     APP_ID=com.yourorg.workoutv2 maestro test .maestro
     ```

## Flows

| File | What it covers |
| --- | --- |
| `01_sign_in.yaml` | Welcome → Sign in → lands on Home tab. |
| `02_quick_start_workout.yaml` | Workout tab → Quick Start → add Bench Press → log a set → Finish. |
| `03_routine_workout.yaml` | Workout tab → start "Push Day" routine → tick a set → Finish. |
| `04_history_review.yaml` | History tab shows the workout, Profile shows stats. |
| `05_create_routine.yaml` | Workout tab → New Routine → add 2 exercises → Save. |
| `06_rest_timer_and_pr.yaml` | Heavy single → rest timer overlay → finish triggers PR alert. |
| `07_exercise_detail.yaml` | Profile → Browse exercises → open Bench Press detail. |
| `08_settings_unit_toggle.yaml` | Toggle weight unit between KG and LBS in Settings. |
| `09_body_measurements.yaml` | Log a body weight entry and confirm it surfaces on Profile. |
| `10_set_types_and_calendar.yaml` | Cycle the set type badge and navigate the history calendar. |
| `11_banner_and_repeat.yaml` | Persistent banner, Discover copy + equipment filter smoke test. |
| `12_notes_rpe_and_import.yaml` | Workout notes input, RPE cycling and Settings import button. |

Run them all in order:

```bash
E2E_EMAIL=you@example.com E2E_PASSWORD=YourPass maestro test .maestro
```

Or run a single flow:

```bash
APP_ID=host.exp.Exponent maestro test .maestro/02_quick_start_workout.yaml
```

## TestIDs used

The flows lean on stable `testID`s assigned across the app. The most important
ones are:

- `welcome-get-started`, `welcome-sign-in`
- `sign-in-email`, `sign-in-password`, `sign-in-submit`
- `home-start-empty-workout`, `home-resume-workout`
- `workout-quick-start`, `routine-start-<routine-name>`
- `active-workout-name`, `active-workout-finish`,
  `active-workout-add-exercise`, `active-workout-discard`
- `set-weight-<workoutExerciseId>-<index>`,
  `set-reps-<workoutExerciseId>-<index>`,
  `set-check-<workoutExerciseId>-<index>`
- `exercise-picker-search`, `exercise-picker-add`,
  `exercise-row-<exerciseId>`

When adding new flows, prefer `id:` selectors over `text:` whenever possible —
text changes break tests, IDs do not.

## Running on EAS Workflows

EAS supports running Maestro in a hosted workflow. See the
[Expo docs](https://docs.expo.dev/eas/workflows/examples/e2e-tests/) for the
yaml configuration; you can reuse the flows in this folder unchanged.

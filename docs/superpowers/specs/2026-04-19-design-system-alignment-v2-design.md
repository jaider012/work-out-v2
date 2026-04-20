# Design System Alignment — v2 (Active Workout + Label Primitive)

**Date:** 2026-04-19
**Depends on:** `2026-04-19-design-system-alignment-design.md` (v1). v1 aligned tokens and added `type="eyebrow"`. v2 continues the alignment work with a wider scope.
**Source of truth:** `Work-Out v2 Design System` folder. When app and design system diverge, design system wins — except for the two product-level exceptions noted below.

## Context

After v1 landed, a second audit pass focused on `app/active-workout.tsx` (skipped in v1 because it had pre-existing changes) and on patterns flagged by the v1 final reviewer. Gaps fall into four buckets:

1. Latent Typography bug — `components/ThemedText.tsx:74` references `Typography.hierarchy.caption.opacity` which is never defined, so the `caption` style applies `opacity: undefined`. The design system says caption should be 0.7.
2. A second uppercase-label pattern (`letterSpacing: 0.5`) exists in ~7 places. It's a real role (stat labels, form field labels) distinct from the `eyebrow` (`letterSpacing: 0.6`, section titles). The design system's `ActiveWorkoutScreen.jsx` uses 0.5 for "DURATION / VOLUME / SETS" and the set-grid header row.
3. `app/active-workout.tsx` has multiple visual drifts: set-type badge colors use hardcoded hex instead of tokens, done-row tint uses `elevatedBackground` instead of the green `rgba(52,199,89,0.06)` from the design system, and the exercise block lacks the violet `fitness_center` icon before the title.
4. Small residuals from v1: an empty `sectionLabel: {}` StyleSheet entry and a couple of redundant `.toUpperCase()` calls that are now double-work (the `eyebrow` type already CSS-uppercases).

## Product Decisions (deviations from strict DS)

- **Top bar of active-workout keeps DURATION centered** (not workout name as the design system shows). User-chosen product call: duration is consulted continuously; burying it in the stats strip costs more than the alignment gains.
- **RPE column is removed** from the set grid to match the design system's 5-column layout. UI, logic, and testIDs go. The `WorkoutSet.rpe?: number` field stays on the type to preserve backward compatibility with AsyncStorage-persisted workouts (old data won't crash on load; the value just becomes unread).

## Goals

1. Resolve the latent caption opacity bug.
2. Introduce `type="label"` on `ThemedText` and refactor the 0.5-tracking inline usages.
3. Tokenize set-type badges and fix the done-row tint in `app/active-workout.tsx`.
4. Add the violet `fitness_center` icon before the exercise title in active-workout.
5. Strip the RPE column from the active-workout set grid (keep type field for data compat).
6. Clean up the residuals flagged by the v1 reviewer (empty `sectionLabel`, redundant `.toUpperCase()`).

## Non-goals

- Top bar layout of active-workout (keep DURATION).
- Migrating old RPE data (field stays on type; no transform).
- Any changes to Maestro E2E flows beyond what's needed to unbreak RPE-referencing testIDs.
- Visual regression testing in simulator (still out of scope — static + lint + unit tests only).
- Touching the `.maestro/*.yaml`, `app.json`, `package.json`, or other files with pre-existing uncommitted changes in the working tree.

## Changes

### A. Typography caption opacity fix

File: `constants/Typography.ts`

Add `opacity: 0.7` to `Typography.hierarchy.caption`. The existing `opacity: Typography.hierarchy.caption.opacity` line in `components/ThemedText.tsx:74` then starts resolving correctly.

Rationale: the design system CSS (`colors_and_type.css`, `.text-caption`) bakes `opacity: 0.7` into caption. The RN Typography table omits it. Adding it fixes the latent reference without touching `ThemedText.tsx`.

### B. `label` primitive + refactor

**Files:** `components/ThemedText.tsx` (add type + style), then cross-cutting refactor.

Add:

```ts
type?: ... | 'label';
```

StyleSheet entry:

```ts
label: {
  fontSize: Typography.hierarchy.caption.fontSize,
  lineHeight: Typography.hierarchy.caption.lineHeight,
  fontWeight: Typography.hierarchy.caption.fontWeight,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  color: Colors.neutral.textSecondary,
},
```

Distinguishing from `eyebrow`: same font metrics and color, different `letterSpacing` (0.5 vs 0.6). Role semantics:
- `eyebrow` → section titles ("YOUR FEED", "ROUTINES").
- `label` → stat labels, form field labels ("DURATION", "EMAIL", "TOTAL SETS").

Refactor targets (found via `grep -rnE "letterSpacing:\s*0\.5" app components --include='*.tsx'` at plan time):
- `app/(auth)/sign-in.tsx:185` and nearby
- `app/(auth)/sign-up.tsx:190` and nearby
- `app/(tabs)/profile.tsx:443`
- `app/workout-complete.tsx:187`
- `app/routine/preview/[id].tsx:147`
- `components/PlateCalculatorSheet.tsx:118`
- `app/active-workout.tsx:870` (set-grid header row) plus any sites added in section C

Same refactor rules as v1 Task 3: drop the three eyebrow-ish props (`textTransform`, `letterSpacing`, `color: Colors.neutral.textSecondary`), keep layout props, switch `type` to `'label'`. Preserve empty StyleSheet entries when referenced multiple times; delete when singly referenced.

### C. Active-workout visual fixes

File: `app/active-workout.tsx` (988 lines — pre-existing uncommitted changes present; we must ensure the `git add` for our work only stages eyebrow/label/badge/icon/tint/RPE changes, not the pre-existing drift).

**C.1 Set-type badges** (currently at approximately `app/active-workout.tsx:68-72`):

Replace hardcoded palette:

| Type | Current bg | Current border | Design system target |
| --- | --- | --- | --- |
| Normal (N) | `transparent` | none | `Colors.neutral.elevatedBackground` (white text) |
| Warmup (W) | `#3A4A7A` (blue) | `#7C9CFF` border | `transparent` + `Colors.semantic.pr` (gold) border, gold text |
| Failure (F) | `#5C2A2A` (dark red) | border `#FF7070` | `Colors.semantic.error` fill, white text |
| Drop (D) | `#4A3A7A` (dark violet) | border `#A07CFF` | `Colors.primary.accentViolet` fill, white text |

Implementation: replace the hex values in `setTypeBadgeStyle()` (or wherever the switch lives) with `Colors.*` references. White text on N/F/D; gold text + gold 1px border on W; no border on N/F/D.

**C.2 Done-row tint:**

Find the style applying `Colors.neutral.elevatedBackground` to a row when `set.completed`. Replace with `rgba(52, 199, 89, 0.06)` (this is the DS spec; there is no existing token for this color-with-alpha, so write it as the literal string with a comment referencing the DS). Because this is a translucent tint and no other tint uses it, inlining is acceptable.

**C.3 Exercise block header icon:**

Before the exercise title (current file has just bold text + ellipsis on right), add an `IconSymbol` mapped from the SF-style name `figure.strengthtraining.traditional` (or `dumbbell.fill` — confirm via `components/ui/IconSymbol.tsx` mapping) in violet (`Colors.primary.accentViolet`), size 20, with `marginRight: Spacing.sm`. If no direct map exists, add one (Material equivalent: `fitness-center` per `assets/icon-map.json`).

**C.4 Stats strip labels:**

The three stat labels (DURATION / VOLUME / SETS, wherever they live in the file) should render with `<ThemedText type="label">`. This is a direct consumer of section B's new primitive.

**C.5 RPE column removal:**

- Remove the RPE column from the grid (find the grid definition; it currently has `SET | PREVIOUS | KG | REPS | RPE | ✓` per audit line 594-607 — reduce to 5 columns).
- Remove the RPE badge cycler (the button that toggles `— @6 @7 @8 @9 @10 —`). Delete the handler + the related state.
- Remove RPE-related code in `app/active-workout.tsx`:
  - Constants: `RPE_CYCLE` (line ~57), helper `nextRpe` (line ~60).
  - Header label `"RPE"` in grid column labels (line ~486).
  - Set-row RPE button (lines ~595-605) including the testID `set-rpe-<weId>-<idx>`, the `updateSet({ rpe: nextRpe(set.rpe) })` call, and the rendered `@N` / `—` text.
  - StyleSheet entries `rpeButton` and `rpeText` (lines ~892, ~901).
- Edit `.maestro/12_notes_rpe_and_import.yaml` to drop the RPE tap block (the `tapOn: id: "set-rpe-..."` step with `optional: true`). The file also covers notes + settings-Import smoke test, so keep the rest. Update the top comment from "Adds workout notes, cycles RPE, and smoke-tests the Import button" to "Adds workout notes and smoke-tests the Import button". Rename the file to `.maestro/12_notes_and_import.yaml` and update the matching entry in `.maestro/config.yaml`. Both files are committed and clean in the working tree (safe to modify).
- Keep `WorkoutSet.rpe?: number` on `types/workout.ts`. Do not modify the type. Old saved data continues to deserialize fine; the field is just ignored by the UI.
- Outside `app/active-workout.tsx`, only `types/workout.ts` references `rpe` (confirmed via grep across `utils/`, `types/`, `contexts/`, `components/`). No utility or stat function reads the field. Removal is UI-only + test-only.

### D. Cleanup residuals

**D.1** `app/(tabs)/workout.tsx:361` — `sectionLabel: {}` is empty and referenced twice. Delete the key and both `style={styles.sectionLabel}` references on the `<ThemedText type="eyebrow">` tags.

**D.2** `app/(tabs)/history.tsx:148` — remove the `.toUpperCase()` call on `monthLabel` inside the `<ThemedText type="eyebrow">`. The eyebrow type now does uppercase via `textTransform`.

**D.3** `app/measurements.tsx:88` (approximate line — verify at plan time) — remove the inner `.toUpperCase()` on `weightUnit` inside the eyebrow-styled "LOG WEIGHT ({weightUnit.toUpperCase()})" string.

## Verification

1. `yarn lint` — clean.
2. `yarn test` — all passing (including existing unit tests; RPE removal must not break `utils/__tests__/exerciseHistory.test.ts` — confirm via read before touching).
3. `grep -rnE "letterSpacing:\s*0\.5" app components --include='*.tsx'` — only survivors are intentional non-label sites (e.g. the `label` StyleSheet entry in `ThemedText.tsx`).
4. `grep -nE "#3A4A7A|#7C9CFF|#5C2A2A|#FF7070|#4A3A7A|#A07CFF" app/active-workout.tsx` — returns nothing (all hardcoded badge hex gone).
5. Manual read: `app/active-workout.tsx` has no remaining RPE UI (search for `rpe`, `RPE`, `@\d`).
6. Manual read: the set-grid template has 5 columns, not 6.

## Risk

- **RPE removal blast radius:** the field is read in `utils/exerciseHistory.ts`, `utils/workoutStats.ts`, maybe more. Most reads are likely guarded by `if (rpe)` since the field is optional. If a non-UI consumer relies on RPE semantically, leave those reads alone. The PR branch does not delete `rpe?: number` from the type — this is an intentional guardrail.
- **Maestro flows:** if any `.maestro/*.yaml` file references a testID we're removing (e.g. `set-rpe-button-<id>`), the flow will break. We cannot edit those files in this spec (pre-existing uncommitted state). Approach: grep `.maestro/` for RPE-related testIDs and flag in the final report. User handles the `.yaml` updates separately.
- **Done-row tint contrast:** the new green tint (`rgba(52,199,89,0.06)`) is quite subtle against the near-black background. Functional, but if the user finds it too faint we can revisit.
- **Badge color inversion (W):** the warmup badge changes from blue fill to transparent + gold border. This is a meaningful visual change that power users may notice. Worth a release note.

## Rollback

Each task is its own commit. Revert in reverse order. No data migrations. The `WorkoutSet.rpe` field staying on the type is the safety net — users don't lose RPE values stored in AsyncStorage, they just can't see/edit them.

# Design System Alignment v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Continue the design-system alignment by fixing a latent caption-opacity bug, introducing a `type="label"` primitive, tokenizing the active-workout set-type badges, fixing the done-row tint, adding the violet exercise-block icon, removing the RPE column and its Maestro coverage, and cleaning up residuals from v1.

**Architecture:** Multi-file refactor plus one product-level removal (RPE column). Six commits, each scoped tight. No new abstractions beyond the `label` primitive.

**Tech Stack:** Expo SDK 55 / RN 0.83 / TypeScript / Jest / Maestro.

**Spec:** `docs/superpowers/specs/2026-04-19-design-system-alignment-v2-design.md`
**Previous work:** `docs/superpowers/specs/2026-04-19-design-system-alignment-design.md` (v1, merged via commits `3b700a7`, `9c7d980`, `3a46ba7`, `de1a6ec`, `75677a9`).

**Working-tree precondition:** Many files have pre-existing uncommitted changes (`.maestro/01..06_*.yaml`, `app.json`, `app/(tabs)/_layout.tsx`, `app/active-workout.tsx`, `components/MonthCalendar.tsx`, `constants/Typography.ts`, `hooks/useColorScheme*.ts`, `package.json`, `yarn.lock`, etc.). **Every task below must `git add` specific files explicitly — never `git add -A`.** Untracked files and working-tree drift unrelated to our tasks stay untouched.

---

## File Structure

**Modify:**
- `constants/Typography.ts` — Task 1 (add `opacity: 0.7` to `caption`).
- `components/ThemedText.tsx` — Task 2 (add `label` type + entry).
- Multiple screen files — Task 3 (refactor inline `letterSpacing: 0.5` sites to `type="label"`).
- `app/active-workout.tsx` — Tasks 4 + 5.
- `.maestro/12_notes_rpe_and_import.yaml` → rename to `.maestro/12_notes_and_import.yaml` — Task 5.
- `.maestro/config.yaml` — Task 5 (update the entry).
- `app/(tabs)/workout.tsx`, `app/(tabs)/history.tsx`, `app/measurements.tsx` — Task 6 (residual cleanup).

No new files. No new tests (pure refactor / UI edits).

---

## Task 1: Fix latent caption opacity

**Files:**
- Modify: `constants/Typography.ts`

**Rationale:** `components/ThemedText.tsx:74` has `opacity: Typography.hierarchy.caption.opacity`, but `Typography.hierarchy.caption` has no `opacity` key, so the style applies `opacity: undefined`. The design system CSS (`.text-caption { opacity: 0.7 }`) specifies 0.7. Add the key.

- [ ] **Step 1: Baseline**

Run: `grep -n "caption:" constants/Typography.ts`

Expected:
```
constants/Typography.ts:XX:    caption: {
```

Open the file and find the `caption` block inside `hierarchy`:

```ts
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20, // 1.4 ratio
    },
```

Precondition: `constants/Typography.ts` has pre-existing uncommitted changes in the working tree. Before editing, run `git diff constants/Typography.ts` and read the existing drift. If the existing drift already adds `opacity` to `caption`, skip this task and report `NEEDS_CONTEXT`. Otherwise proceed — but your edit must stack on top of the existing drift so only your one added line appears in this task's commit.

- [ ] **Step 2: Add opacity line**

Add `opacity: 0.7,` as the 4th property of `caption`. After the edit:

```ts
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20, // 1.4 ratio
      opacity: 0.7,
    },
```

- [ ] **Step 3: Verify lint and tests**

Run: `yarn lint`
Expected: clean.

Run: `yarn test`
Expected: all 33 tests pass.

- [ ] **Step 4: Stage ONLY the caption change**

Run: `git diff constants/Typography.ts` and confirm the diff is only `+      opacity: 0.7,` in the `caption` entry, plus whatever pre-existing drift was already there. If there are unrelated modifications, use `git add -p constants/Typography.ts` to stage only the caption line.

- [ ] **Step 5: Commit**

```bash
git commit -m "Add opacity 0.7 to caption typography

Resolves the latent reference in ThemedText.tsx where
Typography.hierarchy.caption.opacity evaluated to undefined.
Matches the design system's .text-caption CSS spec.
"
```

---

## Task 2: Add `type="label"` to ThemedText

**Files:**
- Modify: `components/ThemedText.tsx`

**Rationale:** The design system has two distinct uppercase roles: `eyebrow` (0.6 tracking, section titles) and `label` (0.5 tracking, stat/field labels). v1 added `eyebrow`; this task adds `label`. Both share caption metrics + textSecondary color.

- [ ] **Step 1: Extend the type union**

In `components/ThemedText.tsx`, find:

```ts
type?: 'default' | 'hero' | 'h1' | 'h2' | 'body' | 'caption' | 'small' | 'button' | 'link' | 'eyebrow';
```

Change to:

```ts
type?: 'default' | 'hero' | 'h1' | 'h2' | 'body' | 'caption' | 'small' | 'button' | 'link' | 'eyebrow' | 'label';
```

- [ ] **Step 2: Wire the style into the `<Text>` style array**

Find the array of conditional type styles. After the `eyebrow` line, add:

```tsx
        type === 'eyebrow' ? styles.eyebrow : undefined,
        type === 'label' ? styles.label : undefined,
        style,
```

- [ ] **Step 3: Add the StyleSheet entry**

After the `eyebrow` entry in `StyleSheet.create({...})`, add:

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

Do NOT include `opacity`. The label role is flat (matches design system).

- [ ] **Step 4: Verify**

Run: `yarn lint` (clean) and `yarn test` (33 pass).

- [ ] **Step 5: Commit**

```bash
git add components/ThemedText.tsx
git commit -m "Add label type to ThemedText

Second uppercase primitive: caption metrics, 0.5 tracking, fg2 color.
Distinct role from eyebrow (0.6 tracking). Eyebrow is section titles;
label is stat labels and form field labels.
"
```

---

## Task 3: Refactor inline `label` usages

**Files (candidate list, confirm via grep in Step 1):**
- Modify: `app/(auth)/sign-in.tsx`
- Modify: `app/(auth)/sign-up.tsx`
- Modify: `app/(tabs)/profile.tsx`
- Modify: `app/workout-complete.tsx`
- Modify: `app/routine/preview/[id].tsx`
- Modify: `components/PlateCalculatorSheet.tsx`
- Modify: `app/active-workout.tsx` — grid-header row (`setHeader` with 0.5 tracking) AND stat labels (DURATION / VOLUME / SETS) if they currently lack 0.5 tracking.

**Rationale:** These sites combine `letterSpacing: 0.5` + `textTransform: 'uppercase'` + `color: Colors.neutral.textSecondary`. They are the `label` role — refactor to `type="label"`.

**Skip:** sites where `letterSpacing: 0.5` appears without `textTransform: 'uppercase'` (not a label), or without the fg2 color (custom role).

- [ ] **Step 1: Enumerate candidates**

Run: `grep -rnE "letterSpacing:\s*0\.5" app components --include='*.tsx'`

Read each hit with ~10 lines of surrounding context. Classify:
- **Label** — block has `textTransform: 'uppercase'` AND `color: Colors.neutral.textSecondary` (or equivalent like `.textSecondary`). → refactor.
- **Not label** — missing either piece. → skip.

Produce a file-by-file classification list before editing.

Also note: the design system's `ActiveWorkoutScreen.jsx` shows `DURATION / VOLUME / SETS` stat labels with `letterSpacing: 0.5`. In `app/active-workout.tsx`, the current stat-label StyleSheet entry may NOT yet have `letterSpacing: 0.5`. If so, you still refactor to `type="label"` — the primitive will apply the 0.5 automatically. The spec intent is the stats strip labels become `type="label"`.

- [ ] **Step 2: Refactor each label site**

Apply the same rules v1 Task 3 used for eyebrows:

```tsx
// before
<ThemedText
  type="caption"
  style={{ textTransform: 'uppercase', letterSpacing: 0.5, color: Colors.neutral.textSecondary, marginBottom: 6 }}
>
  EMAIL
</ThemedText>

// after
<ThemedText type="label" style={{ marginBottom: 6 }}>
  EMAIL
</ThemedText>
```

StyleSheet-form:

```tsx
// before
fieldLabel: {
  color: Colors.neutral.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  marginBottom: 6,
},

// after
fieldLabel: {
  marginBottom: 6,
},
```

Rules:
- Drop the triplet (`textTransform`, `letterSpacing`, the textSecondary `color`). Keep layout props.
- Switch `type="caption"` → `type="label"`.
- Do NOT change text content.
- Do NOT modify `app/active-workout.tsx` RPE-related styles — those are removed entirely in Task 5.
- If a StyleSheet entry becomes `{}` and is referenced only once, delete both; if multiple references, leave the empty entry.
- If `Colors` is no longer used in a file, drop the import.

- [ ] **Step 3: Verify no inline label pattern survives**

Run: `grep -rnE "letterSpacing:\s*0\.5" app components --include='*.tsx'`

Survivors should be: `components/ThemedText.tsx` (the `label` definition itself), plus any non-label sites from the Step 1 classification. For each survivor, explicitly confirm it's not a label.

- [ ] **Step 4: Lint and tests**

Run: `yarn lint` (clean — fix any unused imports).
Run: `yarn test` (33 pass).

- [ ] **Step 5: Stage ONLY refactored files**

Each modified file listed explicitly:

```bash
git add app/(auth)/sign-in.tsx app/(auth)/sign-up.tsx app/(tabs)/profile.tsx ...
git status  # verify only intended files staged
```

**Special handling for `app/active-workout.tsx`:** it has pre-existing working-tree drift. Use `git add -p app/active-workout.tsx` to stage only the hunks your refactor produced, not the pre-existing drift.

- [ ] **Step 6: Commit**

```bash
git commit -m "Refactor inline label styling to ThemedText type

Replace the inline caption+uppercase+0.5-tracking combo with the
new type=\"label\" across auth forms, stat labels, and the active-
workout set-grid header and stats strip.
"
```

---

## Task 4: Active-workout visual fixes (badges + done tint + exercise icon)

**Files:**
- Modify: `app/active-workout.tsx`

**Rationale:** Three small visual tweaks on the same file, bundled into one commit since they're cohesive. No logic changes.

**Precondition:** `app/active-workout.tsx` has pre-existing working-tree drift. Every edit must be staged via `git add -p` so only these three fixes land in the commit.

- [ ] **Step 1: Read the current `setTypeBadgeStyle` function**

Current (circa `app/active-workout.tsx:65-76`):

```ts
function setTypeBadgeStyle(type: SetType) {
  switch (type) {
    case 'warmup':
      return { backgroundColor: '#3A4A7A', borderColor: '#7C9CFF' };
    case 'failure':
      return { backgroundColor: '#5C2A2A', borderColor: '#FF7070' };
    case 'drop':
      return { backgroundColor: '#4A3A7A', borderColor: '#A07CFF' };
    default:
      return { backgroundColor: 'transparent', borderColor: 'transparent' };
  }
}
```

Replace with:

```ts
function setTypeBadgeStyle(type: SetType) {
  switch (type) {
    case 'warmup':
      return {
        backgroundColor: 'transparent',
        borderColor: Colors.semantic.pr,
        textColor: Colors.semantic.pr,
      };
    case 'failure':
      return {
        backgroundColor: Colors.semantic.error,
        borderColor: Colors.semantic.error,
        textColor: Colors.neutral.textPrimary,
      };
    case 'drop':
      return {
        backgroundColor: Colors.primary.accentViolet,
        borderColor: Colors.primary.accentViolet,
        textColor: Colors.neutral.textPrimary,
      };
    default:
      return {
        backgroundColor: Colors.neutral.elevatedBackground,
        borderColor: 'transparent',
        textColor: Colors.neutral.textPrimary,
      };
  }
}
```

Note the new `textColor` field. Find the consumer (likely a view rendering the badge number) and thread the `textColor` into the text color of the badge number (e.g. `<ThemedText style={{ color: badge.textColor }}>`). If the current consumer hardcodes white, swap that for `badge.textColor`.

**If the return type of `setTypeBadgeStyle` was previously used directly as a RN `ViewStyle`**, note that the added `textColor` field is not a valid `ViewStyle` key. You must (a) either destructure `const { textColor, ...viewStyle } = setTypeBadgeStyle(type)` at the call site, or (b) change the function to return `{ view: ViewStyle, textColor: string }`. Pick (a) — simpler diff.

- [ ] **Step 2: Verify old hex is gone**

Run: `grep -nE "#3A4A7A|#7C9CFF|#5C2A2A|#FF7070|#4A3A7A|#A07CFF" app/active-workout.tsx`

Expected: no output.

- [ ] **Step 3: Fix done-row tint**

Find the style that applies a background tint to a completed set row. Likely uses `Colors.neutral.elevatedBackground` or similar. Replace with `'rgba(52, 199, 89, 0.06)'`. The spec allows inlining this one translucent value; no token exists.

If the value appears only in one place, use a named local constant at the top of the file:

```ts
const DONE_ROW_TINT = 'rgba(52, 199, 89, 0.06)';
```

and reference it. This keeps the hex localized.

- [ ] **Step 4: Add violet fitness_center icon to exercise block header**

Find the JSX that renders the per-exercise header row (has the exercise name, possibly an ellipsis button). Add an `IconSymbol` before the title.

First, confirm the mapping. Run:

```
grep -n "fitness_center\|dumbbell" components/ui/IconSymbol.tsx
```

If `IconSymbol` uses SF-symbol-style names keyed to Material icons, the name for this icon is likely `figure.strengthtraining.traditional` or `dumbbell.fill`. Use whichever is already mapped. If none, add a mapping: the SF-style key you choose → Material icon `fitness-center`.

Insert before the title:

```tsx
<IconSymbol name="figure.strengthtraining.traditional" size={20} color={Colors.primary.accentViolet} style={{ marginRight: Spacing.sm }} />
```

(Use whatever exact import name / size / spacing value is already conventional in this file. Match the adjacent code style.)

- [ ] **Step 5: Lint, tests, and visual sanity**

Run: `yarn lint` (clean) and `yarn test` (33 pass).

Read the diff one more time. Make sure you have not:
- Broken the grid-layout width calculations (the set badge is 28×28; width is preserved).
- Introduced a syntax error in JSX from the icon insertion.
- Accidentally changed set-type badge colors for the default (Normal) case such that the badge looks different when no type is set — the default should now use `elevatedBackground`.

- [ ] **Step 6: Stage only the visual-fix hunks**

```bash
git add -p app/active-workout.tsx
```

Select hunks that modify `setTypeBadgeStyle`, the done-row tint, the exercise header icon, and any badge-text-color threading. Reject hunks that are pre-existing drift.

- [ ] **Step 7: Commit**

```bash
git commit -m "Tokenize active-workout visual details

- Set-type badges now use Colors.* tokens. Warmup flips to
  transparent+gold border (matches DS); Normal uses elevated bg.
- Done-row tint changes from elevatedBackground to
  rgba(52,199,89,0.06) per the design system.
- Add violet fitness_center icon before the exercise title.
"
```

---

## Task 5: Remove RPE column

**Files:**
- Modify: `app/active-workout.tsx`
- Modify: `.maestro/12_notes_rpe_and_import.yaml` (rename + edit)
- Modify: `.maestro/config.yaml`

**Rationale:** Product decision: remove RPE UI + logic for DS-strict 5-column set grid. Keep `WorkoutSet.rpe?` on the type (no data migration).

Exact removals in `app/active-workout.tsx` (verify line numbers at edit time):
- Lines ~57-63: `RPE_CYCLE` constant + `nextRpe` helper function.
- Line ~486: `"RPE"` text in the grid header row.
- Lines ~595-605: the entire `<Pressable testID={\`set-rpe-...\`}>` block inside each set row, including the `updateSet({ rpe: nextRpe(set.rpe) })` call and the `@N` / `—` text.
- Lines ~892, ~901: the `rpeButton` and `rpeText` StyleSheet entries.

After removal, the grid's `gridTemplateColumns` (or flex weights if using flex) must collapse from 6 columns to 5. Find the grid-template definition and remove the RPE column's width/flex entry.

- [ ] **Step 1: Read the current RPE code in full**

```bash
grep -n "rpe\|RPE\|@[0-9]\|RPE_CYCLE" app/active-workout.tsx
```

Read each hit with surrounding context. Make a per-site change list.

- [ ] **Step 2: Remove `RPE_CYCLE` and `nextRpe`**

Delete the constant and helper at the top of the file (~lines 57-63):

```ts
const RPE_CYCLE: (number | undefined)[] = [undefined, 6, 7, 8, 9, 10];

function nextRpe(current: number | undefined): number | undefined {
  const idx = RPE_CYCLE.findIndex((v) => v === current);
  const next = RPE_CYCLE[(idx + 1) % RPE_CYCLE.length];
  return next;
}
```

- [ ] **Step 3: Remove the RPE grid-header cell**

Find the grid header row (~line 486 `RPE`). Remove the `<ThemedText>` (or equivalent) cell that renders `RPE`. Update the grid column definition above it from 6 columns to 5 (e.g. remove one `'1fr'` or flex weight entry). Keep columns in order: `SET | PREV | KG | REPS | ✓`.

- [ ] **Step 4: Remove the RPE set-row cell**

Find each set-row render (~lines 595-605). Remove the `<Pressable testID={\`set-rpe-...\`}>` entirely (including children). Remove any `rpeButton` style prop references.

- [ ] **Step 5: Remove orphaned styles**

Remove the `rpeButton` and `rpeText` entries from the StyleSheet (~lines 892, 901).

- [ ] **Step 6: Compile-check**

After the four removals, run:

```bash
yarn tsc --noEmit 2>&1 | head -20
```

(Or `yarn lint` which runs the TS rules.) If any error references `rpe` / `RPE_CYCLE` / `nextRpe` / `rpeButton`, you missed a site. Fix before continuing.

- [ ] **Step 7: Verify tests**

Run: `yarn test`
Expected: all 33 pass. If any test references the removed symbols, report BLOCKED with the test name (the plan didn't anticipate test coupling).

- [ ] **Step 8: Maestro flow update**

Read `.maestro/12_notes_rpe_and_import.yaml`. The file covers: workout notes, a single RPE tap, and a Settings-Import smoke test.

Edits:
1. Remove this block:
```yaml
- tapOn:
    id: "set-rpe-${output.we ?? 'we-0'}-0"
    optional: true
```
2. Update the top comment from `# Adds workout notes, cycles RPE, and smoke-tests the Import button on settings.` to `# Adds workout notes and smoke-tests the Import button on settings.`.
3. Rename the file:
```bash
git mv .maestro/12_notes_rpe_and_import.yaml .maestro/12_notes_and_import.yaml
```
4. Update `.maestro/config.yaml`: change `- 12_notes_rpe_and_import.yaml` to `- 12_notes_and_import.yaml`.

- [ ] **Step 9: Stage only our hunks**

```bash
git add -p app/active-workout.tsx
# stage only RPE-removal hunks, not pre-existing drift

git add .maestro/12_notes_and_import.yaml .maestro/config.yaml
# (git mv + edit should already stage the rename; verify with git status)

git status   # confirm only these three files are staged
```

- [ ] **Step 10: Commit**

```bash
git commit -m "Remove RPE column from active-workout

The design system specifies a 5-column set grid (SET | PREV | KG |
REPS | ✓). Remove the RPE button, helper (nextRpe), constant
(RPE_CYCLE), and orphaned styles. The rpe?: number field on
WorkoutSet stays for backward compatibility with persisted workouts.

Also drop the RPE tap step from the Maestro flow that tested it;
the flow keeps its notes + Settings-Import coverage and is renamed
to 12_notes_and_import.yaml.
"
```

---

## Task 6: Residual cleanup

**Files:**
- Modify: `app/(tabs)/workout.tsx` (delete empty `sectionLabel: {}`)
- Modify: `app/(tabs)/history.tsx` (remove redundant `.toUpperCase()`)
- Modify: `app/measurements.tsx` (remove redundant inner `.toUpperCase()`)

**Rationale:** Last residuals from v1's final review.

- [ ] **Step 1: Delete empty `sectionLabel` in workout.tsx**

Open `app/(tabs)/workout.tsx`. Find `sectionLabel: {}` (~line 361). It is referenced twice via `style={styles.sectionLabel}` on `<ThemedText type="eyebrow">` tags. Delete:
- The key `sectionLabel: {},` entry from the StyleSheet.
- Both `style={styles.sectionLabel}` props on the two `<ThemedText>` sites.

Verify by grepping `grep -n "sectionLabel" app/(tabs)/workout.tsx` → no matches after the edit.

- [ ] **Step 2: Remove `.toUpperCase()` in history.tsx**

Open `app/(tabs)/history.tsx`. Find the eyebrow usage (~line 148) rendering `monthLabel`. Remove the `.toUpperCase()` call — the eyebrow type already CSS-uppercases.

Example:
```tsx
// before
<ThemedText type="eyebrow">{monthLabel.toUpperCase()}</ThemedText>

// after
<ThemedText type="eyebrow">{monthLabel}</ThemedText>
```

- [ ] **Step 3: Remove redundant `.toUpperCase()` in measurements.tsx**

Open `app/measurements.tsx`. Find the eyebrow containing `weightUnit.toUpperCase()` (grep for `toUpperCase` in the file). Drop the inner call. Example:

```tsx
// before
<ThemedText type="eyebrow">LOG WEIGHT ({weightUnit.toUpperCase()})</ThemedText>

// after
<ThemedText type="eyebrow">LOG WEIGHT ({weightUnit})</ThemedText>
```

Note: if the surrounding string has non-eyebrow mixed content, reconsider — the `textTransform: 'uppercase'` will uppercase the whole rendered string, so `"LOG WEIGHT (KG)"` and `"LOG WEIGHT (kg)"` render identically. If this visual equivalence is confirmed, proceed.

- [ ] **Step 4: Lint and tests**

Run: `yarn lint` (clean) and `yarn test` (33 pass).

- [ ] **Step 5: Stage**

```bash
git add app/(tabs)/workout.tsx app/(tabs)/history.tsx app/measurements.tsx
git status  # confirm only these three files
```

- [ ] **Step 6: Commit**

```bash
git commit -m "Remove eyebrow-refactor residuals

- Delete empty sectionLabel StyleSheet entry in workout.tsx.
- Drop redundant .toUpperCase() calls in history.tsx and
  measurements.tsx since the eyebrow type already CSS-uppercases.
"
```

---

## Verification (final)

- [ ] `git log --oneline origin/main..HEAD` shows 6 new commits on top of v1 (Tasks 1–6).
- [ ] `yarn lint` — clean.
- [ ] `yarn test` — 33 pass.
- [ ] `grep -nE "#3A4A7A|#7C9CFF|#5C2A2A|#FF7070|#4A3A7A|#A07CFF" app/active-workout.tsx` — no output.
- [ ] `grep -rn "rpe\|RPE_CYCLE\|nextRpe\|rpeButton" app/active-workout.tsx` — no output (only `types/workout.ts` still references `rpe?`).
- [ ] `grep -rnE "letterSpacing:\s*0\.5" app components --include='*.tsx'` — survivors are only the `label` definition in `ThemedText.tsx` and any classified-as-not-label sites from Task 3.
- [ ] `grep -rnE "letterSpacing:\s*0\.6" app components --include='*.tsx'` — unchanged from v1 final state (only `ActiveWorkoutBanner.tsx:108` and `ThemedText.tsx` eyebrow def).
- [ ] Active-workout set grid is 5 columns: `SET | PREV | KG | REPS | ✓`.
- [ ] `.maestro/config.yaml` references `12_notes_and_import.yaml` (not the old RPE name).
- [ ] Pre-existing working-tree drift (`.maestro/01..06_*.yaml`, `app.json`, etc.) remains unstaged.

No simulator run required (consistent with v1 approach).

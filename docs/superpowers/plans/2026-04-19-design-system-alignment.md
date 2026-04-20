# Design System Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the app's neutral color palette with the design system and promote the ad-hoc eyebrow text pattern to a named `ThemedText` type.

**Architecture:** Single-file token update in `constants/Colors.ts` + additive `type="eyebrow"` variant in `ThemedText` + mechanical refactor of existing inline eyebrow usages across screens. No logic changes, no new components, no test fixtures needed.

**Tech Stack:** Expo SDK 55, React Native, TypeScript, Jest (jest-expo preset).

**Spec:** `docs/superpowers/specs/2026-04-19-design-system-alignment-design.md`

---

## File Structure

**Modify:**
- `constants/Colors.ts` — 6 hex value swaps in the `neutral` and `dark` buckets.
- `components/ThemedText.tsx` — add `'eyebrow'` to the `type` union and a matching StyleSheet entry.

**Modify (refactor, mechanical):**
- `app/(tabs)/index.tsx`
- `app/(tabs)/workout.tsx`
- `app/(tabs)/history.tsx`
- `app/(tabs)/profile.tsx`
- `app/workout-complete.tsx`
- `app/measurements.tsx`
- `app/exercise/[id].tsx`
- `app/settings.tsx`
- `app/routine/preview/[id].tsx`

Files will be confirmed via grep in Task 3; the list above is from a pre-planning scan.

No files created. No test fixtures. No new dependencies.

---

## Task 1: Update color tokens

**Files:**
- Modify: `constants/Colors.ts`

**Rationale:** Six hex values drifted from the design system. The app exposes `Colors.neutral.*` and `Colors.dark.*` to the rest of the codebase; changing values here propagates automatically via `useThemeColor` and direct references.

- [ ] **Step 1: Capture baseline — confirm drift values**

Run: `grep -nE '#3A3A42|#C5C5CC|#8E8E98' constants/Colors.ts`

Expected output (5-6 lines):
```
constants/Colors.ts:25:    border: '#3A3A42',
constants/Colors.ts:28:    textSecondary: '#C5C5CC',
constants/Colors.ts:29:    textTertiary: '#8E8E98',
constants/Colors.ts:56:    icon: '#C5C5CC',
constants/Colors.ts:57:    tabIconDefault: '#8E8E98',
constants/Colors.ts:60:    border: '#3A3A42',
```

If line numbers differ, still proceed — the values are what we're swapping.

- [ ] **Step 2: Apply the six swaps**

Edit `constants/Colors.ts`. Replace:

```
neutral.border:         '#3A3A42'  →  '#2A2A2F'
neutral.textSecondary:  '#C5C5CC'  →  '#A0A0A8'
neutral.textTertiary:   '#8E8E98'  →  '#6B6B73'
dark.icon:              '#C5C5CC'  →  '#A0A0A8'
dark.tabIconDefault:    '#8E8E98'  →  '#6B6B73'
dark.border:            '#3A3A42'  →  '#2A2A2F'
```

After the edit, the file's `neutral` and `dark` blocks should read:

```ts
  neutral: {
    darkBackground: '#0E0E10',
    cardBackground: '#1C1C1F',
    elevatedBackground: '#26262B',
    border: '#2A2A2F',
    lightBackground: '#FFFFFF',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A8',
    textTertiary: '#6B6B73',
  },
```

```ts
  dark: {
    text: '#FFFFFF',
    background: '#0E0E10',
    tint: '#7C5CFF',
    icon: '#A0A0A8',
    tabIconDefault: '#6B6B73',
    tabIconSelected: '#7C5CFF',
    card: '#1C1C1F',
    border: '#2A2A2F',
  },
```

Leave `light` and `primary` and `semantic` blocks untouched.

- [ ] **Step 3: Verify old hex values are gone**

Run: `grep -nE '#3A3A42|#C5C5CC|#8E8E98' constants/Colors.ts`

Expected: no output (exit code 1 is fine).

- [ ] **Step 4: Verify lint and tests pass**

Run: `yarn lint`
Expected: clean exit, no new warnings.

Run: `yarn test`
Expected: all tests pass (unit tests don't touch colors; this is a regression sanity check).

- [ ] **Step 5: Commit**

```bash
git add constants/Colors.ts
git commit -m "Align neutral palette with design system tokens

Six hex values in Colors.neutral and Colors.dark drifted from the
design system. Swap them to match colors_and_type.css exactly:
border, textSecondary, textTertiary, dark.icon, dark.tabIconDefault,
dark.border.
"
```

---

## Task 2: Add `eyebrow` type to `ThemedText`

**Files:**
- Modify: `components/ThemedText.tsx`

**Rationale:** The design system's `.text-eyebrow` is a named role (uppercase, 0.6 tracking, fg2 color, no opacity). The app currently reproduces it inline in ~10 places by combining `caption` type with `textTransform` + `letterSpacing` + explicit color. Promoting it to a named variant removes duplication and prevents drift.

Note: the existing `caption` style does NOT include `opacity: 0.7` in this file (it's in the CSS version only). So the new `eyebrow` style is functionally close to `caption` + transform + tracking + explicit color, with no opacity involved.

- [ ] **Step 1: Extend the type union**

Edit `components/ThemedText.tsx`. Change line 9 from:

```ts
  type?: 'default' | 'hero' | 'h1' | 'h2' | 'body' | 'caption' | 'small' | 'button' | 'link';
```

to:

```ts
  type?: 'default' | 'hero' | 'h1' | 'h2' | 'body' | 'caption' | 'small' | 'button' | 'link' | 'eyebrow';
```

- [ ] **Step 2: Wire the style into the `<Text>` style array**

In the same file, add a line to the style array (around line 33, after the `link` line, before `style`):

```tsx
        type === 'link' ? styles.link : undefined,
        type === 'eyebrow' ? styles.eyebrow : undefined,
        style,
```

- [ ] **Step 3: Add the StyleSheet entry**

In the same file, add to the `StyleSheet.create({...})` object (after `link`, before the closing `});`):

```ts
  eyebrow: {
    fontSize: Typography.hierarchy.caption.fontSize,
    lineHeight: Typography.hierarchy.caption.lineHeight,
    fontWeight: Typography.hierarchy.caption.fontWeight,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: Colors.neutral.textSecondary,
  },
```

And add the `Colors` import at the top of the file. Change line 3 from:

```ts
import { Typography } from '@/constants/Typography';
```

to:

```ts
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
```

- [ ] **Step 4: Verify the file compiles**

Run: `yarn tsc --noEmit` (if project has a tsconfig). If yarn lint uses the TS plugin, `yarn lint` will also catch it.

Run: `yarn lint`
Expected: clean exit.

- [ ] **Step 5: Verify tests still pass**

Run: `yarn test`
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add components/ThemedText.tsx
git commit -m "Add eyebrow type to ThemedText

New named variant matching the design system's .text-eyebrow role:
caption size, uppercase, 0.6 tracking, textSecondary color, no
opacity. Enables refactor of inline eyebrow styling across screens.
"
```

---

## Task 3: Refactor inline eyebrow usages

**Files (to be confirmed by grep in Step 1):**
- Modify: `app/(tabs)/index.tsx`
- Modify: `app/(tabs)/workout.tsx`
- Modify: `app/(tabs)/history.tsx`
- Modify: `app/(tabs)/profile.tsx`
- Modify: `app/workout-complete.tsx`
- Modify: `app/measurements.tsx`
- Modify: `app/exercise/[id].tsx`
- Modify: `app/settings.tsx`
- Modify: `app/routine/preview/[id].tsx`

**Rationale:** Each file currently styles eyebrow labels inline with `textTransform: 'uppercase'` + `letterSpacing: 0.6` + a `Colors.neutral.textSecondary` color prop (or equivalent). The new `type="eyebrow"` now covers all three. Replace the inline combo with `<ThemedText type="eyebrow">` and drop the redundant style props.

**Exception to investigate:** `components/ActiveWorkoutBanner.tsx:108` uses `letterSpacing: 0.6` WITHOUT `textTransform: 'uppercase'`. That's not an eyebrow — leave it alone unless the surrounding code reveals otherwise.

- [ ] **Step 1: Enumerate eyebrow candidates**

Run: `grep -rnE "letterSpacing:\s*0\.6" app components --include='*.tsx'`

Expected output: a list of ~10-12 lines. For each one, open the file at that line and inspect ~5 lines of context. Classify:

- **Eyebrow** — used near an ALL-CAPS string like "YOUR FEED", "ROUTINES", "WEEKLY VOLUME" etc., AND the same style block has `textTransform: 'uppercase'`. Refactor.
- **Not eyebrow** — lacks `textTransform`, or used on something other than a section label. Leave alone.

Produce a file-by-file checklist before editing.

- [ ] **Step 2: Refactor each eyebrow site**

For each file classified as eyebrow, transform the JSX. Two common patterns:

**Pattern A — inline style on ThemedText:**

```tsx
// before
<ThemedText
  type="caption"
  style={{ textTransform: 'uppercase', letterSpacing: 0.6, color: Colors.neutral.textSecondary, marginBottom: 12 }}
>
  YOUR FEED
</ThemedText>

// after
<ThemedText type="eyebrow" style={{ marginBottom: 12 }}>
  YOUR FEED
</ThemedText>
```

**Pattern B — named StyleSheet entry (e.g. `styles.sectionLabel`):**

```tsx
// before — JSX
<ThemedText type="caption" style={styles.sectionLabel}>ROUTINES</ThemedText>

// before — StyleSheet
sectionLabel: {
  color: Colors.neutral.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: 0.6,
  marginBottom: 12,
},

// after — JSX
<ThemedText type="eyebrow" style={styles.sectionLabel}>ROUTINES</ThemedText>

// after — StyleSheet (drop the now-redundant props, keep layout)
sectionLabel: {
  marginBottom: 12,
},
```

**Rules:**
- If the inline/StyleSheet entry only had the three eyebrow props (color, textTransform, letterSpacing), drop the style prop entirely.
- Keep any layout props (`marginBottom`, `marginTop`, `paddingHorizontal`, `marginLeft`, etc.).
- Do NOT keep `color: Colors.neutral.textSecondary` — the eyebrow type now owns color.
- Do NOT change the text content (no "YOUR FEED" → "Your Feed" edits, etc.).
- Do NOT touch `components/ActiveWorkoutBanner.tsx` unless grep reveals it's actually uppercase-styled.

- [ ] **Step 3: Verify no inline eyebrow pattern survives**

Run: `grep -rnE "letterSpacing:\s*0\.6" app components --include='*.tsx'`

Expected: zero matches, OR only matches that were classified "not eyebrow" in Step 1 (e.g. `ActiveWorkoutBanner.tsx:108`). List the survivors and confirm each was intentionally preserved.

- [ ] **Step 4: Verify lint and tests**

Run: `yarn lint`
Expected: clean. No unused style imports. If a `sectionLabel` style became empty `{}`, either delete it or leave as-is (either is fine; prefer deletion if the entry is only used once).

Run: `yarn test`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add app components
git commit -m "Refactor inline eyebrow styling to ThemedText type

Replace the inline caption+uppercase+letterSpacing combo with the
new type=\"eyebrow\" across tab screens, modal screens and detail
screens. Behavior unchanged; removes ~10 duplicated style triplets.
"
```

---

## Verification (final)

- [ ] **All three tasks committed** — `git log --oneline -n 3` shows the commits.
- [ ] **No old hex values in Colors.ts** — `grep -nE '#3A3A42|#C5C5CC|#8E8E98' constants/Colors.ts` returns nothing.
- [ ] **Lint clean** — `yarn lint`.
- [ ] **Tests pass** — `yarn test`.
- [ ] **No orphan eyebrow styles** — `grep -rnE "textTransform:\s*'uppercase'" app components --include='*.tsx'` — every remaining match should be intentional (e.g. badge letters, not section labels).

No simulator run required (Approach B scope).

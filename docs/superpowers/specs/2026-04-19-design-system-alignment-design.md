# Design System Alignment — Tokens + Eyebrow primitive

**Date:** 2026-04-19
**Scope:** Approach B (tokens + eyebrow primitive, no screen-by-screen visual pass)
**Source of truth:** `Work-Out v2 Design System` (external folder) — when app and design system diverge, design system wins.

## Context

The design system was originally derived from the current Expo/React Native app (`work-out-v2`). Since then the app has drifted on a handful of neutral-palette tokens. A focused audit confirmed:

- Primitives (`Button`, `Card`, `IconSymbol`, `TabBar`), typography hierarchy, spacing, radii, and voice/copy all already match.
- Real drift is limited to 4 neutral color values and one missing primitive (a named `eyebrow` text type).

Structural audit is not needed. Work is confined to `constants/Colors.ts` and `components/ThemedText.tsx` plus refactor of existing eyebrow usages in tab screens.

## Goals

1. Make the app's neutral palette byte-identical to `colors_and_type.css` tokens.
2. Promote the ad-hoc eyebrow pattern (`caption + uppercase + letterSpacing: 0.6`) to a named `type="eyebrow"` in `ThemedText` so future screens can't drift.
3. Refactor existing inline eyebrow usages to the new type.

Non-goals:
- No visual regression testing in simulator (out of scope per Approach B).
- No changes to Button/Card/IconSymbol primitives (already aligned).
- No light-mode palette tuning beyond what the design system already specifies.
- No copy changes.

## Changes

### 1. Token updates — `constants/Colors.ts`

Six value changes in `Colors.neutral` and `Colors.dark`:

| Key | Before | After |
| --- | --- | --- |
| `neutral.border` | `#3A3A42` | `#2A2A2F` |
| `neutral.textSecondary` | `#C5C5CC` | `#A0A0A8` |
| `neutral.textTertiary` | `#8E8E98` | `#6B6B73` |
| `dark.icon` | `#C5C5CC` | `#A0A0A8` |
| `dark.tabIconDefault` | `#8E8E98` | `#6B6B73` |
| `dark.border` | `#3A3A42` | `#2A2A2F` |

Rationale per token: design system CSS defines `--color-border: #2A2A2F`, `--color-fg2: #A0A0A8`, `--color-fg3: #6B6B73`. App drifted to lighter greys (higher contrast). Adopting the darker values is what the design system docs prescribe and matches the `ui_kits/mobile/components/Primitives.jsx` C object exactly.

All other tokens (spacing, radii, typography, primary accent `#7C5CFF`, PR gold `#FFB020`, semantic success/error) already match. No changes.

### 2. Eyebrow primitive — `components/ThemedText.tsx`

Add a new type variant:

```ts
type: 'eyebrow'
```

Style:
- `fontSize: 14`, `lineHeight: 20`, `fontWeight: '400'` (matches `.text-caption` metrics)
- `textTransform: 'uppercase'`
- `letterSpacing: 0.6`
- `color: Colors.neutral.textSecondary` (i.e. `#A0A0A8` after token fix)
- **No `opacity` override.** Design system's `.text-eyebrow` in CSS uses `fg2` flat (no 0.7 opacity), whereas `.text-caption` bakes in `opacity: 0.7`. The new type must be a dedicated style, not `caption + transform`.

This is additive — no existing `type` values change. The existing `caption` type stays intact for other uses.

### 3. Refactor existing usages

Replace inline eyebrow patterns with `<ThemedText type="eyebrow">`. Search heuristic: files containing both `textTransform: 'uppercase'` and `letterSpacing: 0.6`.

Expected files (confirmed by audit):
- `app/(tabs)/index.tsx` — "JUMP BACK IN", "YOUR FEED"
- `app/(tabs)/workout.tsx` — "ROUTINES", "DISCOVER"
- `app/(tabs)/profile.tsx` — stats labels, "WEEKLY VOLUME (8W)", "MUSCLE DISTRIBUTION (7D)", "ACCOUNT", "SUPPORT"
- `app/active-workout.tsx` — stat labels if they use this pattern

During the refactor, execute grep first to find **every** match; don't rely only on the four files above. Any match not in those files also gets refactored.

For each replacement:
- Remove `textTransform`, `letterSpacing`, and the `color` + `opacity` props that were simulating the eyebrow look.
- Preserve other props (`style` overrides like `marginBottom`).

## Verification

1. `yarn lint` — must pass with no new warnings.
2. `yarn test` — must pass (unit tests don't exercise colors but sanity check for regressions from refactor).
3. Static review: grep for `textTransform.*uppercase.*letterSpacing.*0\.6` returns zero matches in screens after refactor.
4. Static review: grep for the old hex values (`#3A3A42`, `#C5C5CC`, `#8E8E98`) returns zero matches in `constants/Colors.ts`.

No simulator run required (that's Approach C).

## Risk

- **Contrast shift:** The new `textSecondary` (`#A0A0A8`) and `textTertiary` (`#6B6B73`) are darker than current. Subtitles and placeholders will appear lower-contrast. This is the design system's intent (per README: "fg3 for disabled/placeholder, fg2 for captions"). Acceptable.
- **Border hairlines:** The new `border` (`#2A2A2F`) is darker than current (`#3A3A42`). Hairlines become more subtle. Intentional per design system ("hairline divider" and "depth from surface tint, not shadow").
- **Refactor miss:** If a file uses the eyebrow pattern via a different code spelling (e.g. `letterSpacing: 0.6,` on a separate line), the grep heuristic may miss it. Mitigation: also grep for just `letterSpacing: 0.6` to find lone matches, review each.

## Rollback

Single-commit atomic change. Revert the commit to restore prior tokens. No data migrations.

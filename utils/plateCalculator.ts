/**
 * Splits a target total weight (bar + plates) into the plates that need to be
 * loaded on each side of a standard olympic barbell. Uses the most common
 * commercial plate set for the chosen unit and greedy allocation.
 */
export const DEFAULT_BAR_KG = 20;
export const DEFAULT_BAR_LBS = 45;
const PLATE_KG = [25, 20, 15, 10, 5, 2.5, 1.25];
const PLATE_LBS = [45, 35, 25, 10, 5, 2.5, 1.25];

export interface PlateBreakdown {
  /** Total bar weight in the chosen unit. */
  bar: number;
  perSide: { size: number; count: number }[];
  /** Weight left over because it cannot be loaded with standard plates. */
  remainder: number;
  unit: 'kg' | 'lbs';
}

export function calculatePlates(
  target: number,
  unit: 'kg' | 'lbs' = 'kg',
  bar = unit === 'lbs' ? DEFAULT_BAR_LBS : DEFAULT_BAR_KG,
): PlateBreakdown {
  const plateSet = unit === 'lbs' ? PLATE_LBS : PLATE_KG;
  if (target <= bar) {
    return { bar, perSide: [], remainder: Math.max(0, target - bar), unit };
  }
  const perSideTarget = (target - bar) / 2;
  const perSide: { size: number; count: number }[] = [];
  let remaining = perSideTarget;
  for (const plate of plateSet) {
    if (remaining <= 0) break;
    const count = Math.floor((remaining + 1e-6) / plate);
    if (count > 0) {
      perSide.push({ size: plate, count });
      remaining -= plate * count;
    }
  }
  const remainder = Math.max(0, remaining) * 2;
  return { bar, perSide, remainder: Math.round(remainder * 100) / 100, unit };
}

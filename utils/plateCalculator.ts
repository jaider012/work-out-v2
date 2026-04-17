/**
 * Splits a target total weight (bar + plates) into the plates that need to be
 * loaded on each side of a standard 20 kg olympic barbell. Uses the most
 * common commercial plate set and greedy allocation.
 */
export const DEFAULT_BAR_KG = 20;
const PLATE_KG = [25, 20, 15, 10, 5, 2.5, 1.25];

export interface PlateBreakdown {
  barKg: number;
  perSide: { kg: number; count: number }[];
  /** Weight left over because it cannot be loaded with standard plates. */
  remainderKg: number;
}

export function calculatePlates(targetKg: number, barKg = DEFAULT_BAR_KG): PlateBreakdown {
  if (targetKg <= barKg) {
    return { barKg, perSide: [], remainderKg: Math.max(0, targetKg - barKg) };
  }
  const perSideTarget = (targetKg - barKg) / 2;
  const perSide: { kg: number; count: number }[] = [];
  let remaining = perSideTarget;
  for (const plate of PLATE_KG) {
    if (remaining <= 0) break;
    const count = Math.floor((remaining + 1e-6) / plate);
    if (count > 0) {
      perSide.push({ kg: plate, count });
      remaining -= plate * count;
    }
  }
  const remainderKg = Math.max(0, remaining) * 2;
  return { barKg, perSide, remainderKg: Math.round(remainderKg * 100) / 100 };
}

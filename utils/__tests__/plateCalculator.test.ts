import { calculatePlates, DEFAULT_BAR_KG, DEFAULT_BAR_LBS } from '../plateCalculator';

describe('calculatePlates (kg)', () => {
  it('returns no plates when the target equals the bar', () => {
    const result = calculatePlates(20, 'kg');
    expect(result.bar).toBe(DEFAULT_BAR_KG);
    expect(result.perSide).toEqual([]);
    expect(result.remainder).toBe(0);
  });

  it('splits 100 kg into 2×20 + 2×20 = correct per-side plates', () => {
    const result = calculatePlates(100, 'kg');
    // (100 - 20) / 2 = 40 kg per side → 1 × 20 + 1 × 15 + 1 × 5 = 40
    const total = result.perSide.reduce((sum, p) => sum + p.size * p.count, 0);
    expect(total).toBe(40);
    expect(result.remainder).toBe(0);
  });

  it('greedy allocates as much as possible and reports the remainder', () => {
    const result = calculatePlates(143.75, 'kg');
    const perSide = result.perSide.reduce((sum, p) => sum + p.size * p.count, 0);
    const expectedPerSide = (143.75 - 20) / 2;
    // Greedy with [25,20,15,10,5,2.5,1.25] cannot split 0.625 kg / side.
    expect(perSide).toBeLessThanOrEqual(expectedPerSide);
    expect(2 * perSide + result.remainder + 20).toBeCloseTo(143.75, 2);
  });
});

describe('calculatePlates (lbs)', () => {
  it('defaults to a 45 lb bar', () => {
    const result = calculatePlates(45, 'lbs');
    expect(result.bar).toBe(DEFAULT_BAR_LBS);
    expect(result.perSide).toEqual([]);
  });

  it('handles a standard 135 lb bench press', () => {
    const result = calculatePlates(135, 'lbs');
    expect(result.perSide).toEqual([{ size: 45, count: 1 }]);
    expect(result.remainder).toBe(0);
  });

  it('reports a remainder when the target cannot be cleanly loaded', () => {
    const result = calculatePlates(46, 'lbs');
    // (46 - 45) / 2 = 0.5 lb per side which no plate can load.
    expect(result.remainder).toBeGreaterThan(0);
  });
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

import { fromKg, toKg } from '@/contexts/SettingsContext';
import { formatDisplay, parseBuffer } from '@/utils/numericInputBuffer';

describe('parseBuffer', () => {
  it('returns 0 for empty input', () => {
    expect(parseBuffer('', 'weight')).toBe(0);
    expect(parseBuffer('   ', 'weight')).toBe(0);
  });

  it('parses decimal weight with dot', () => {
    expect(parseBuffer('22.5', 'weight')).toBe(22.5);
  });

  it('parses decimal weight typed with comma', () => {
    expect(parseBuffer('22,5', 'weight')).toBe(22.5);
  });

  it('parses sub-unit decimals that start with zero', () => {
    expect(parseBuffer('0.5', 'weight')).toBe(0.5);
  });

  it('treats trailing dot as integer (user mid-typing)', () => {
    expect(parseBuffer('2.', 'weight')).toBe(2);
  });

  it('rejects non-numeric text', () => {
    expect(parseBuffer('abc', 'weight')).toBe(0);
  });

  it('rejects negative values', () => {
    expect(parseBuffer('-5', 'weight')).toBe(0);
  });

  it('parses integer reps', () => {
    expect(parseBuffer('10', 'reps')).toBe(10);
  });

  it('rounds decimals to integer in reps mode', () => {
    expect(parseBuffer('10.7', 'reps')).toBe(11);
  });
});

describe('formatDisplay', () => {
  it('returns empty string for zero', () => {
    expect(formatDisplay(0, 'weight')).toBe('');
    expect(formatDisplay(0, 'reps')).toBe('');
  });

  it('prints weight with its decimals', () => {
    expect(formatDisplay(22.5, 'weight')).toBe('22.5');
    expect(formatDisplay(100, 'weight')).toBe('100');
  });

  it('rounds reps to integer', () => {
    expect(formatDisplay(9.6, 'reps')).toBe('10');
  });
});

describe('round-trip weight commit (lbs)', () => {
  it('keeps a typed value within 0.1 lbs after commit', () => {
    const typed = 50.5;
    const kg = toKg(parseBuffer(String(typed), 'weight'), 'lbs');
    const shownAfterCommit = fromKg(kg, 'lbs');
    expect(Math.abs(shownAfterCommit - typed)).toBeLessThanOrEqual(0.1);
  });

  it('keeps a typed value exactly when the unit is kg', () => {
    const typed = 22.5;
    const kg = toKg(parseBuffer(String(typed), 'weight'), 'kg');
    expect(fromKg(kg, 'kg')).toBe(typed);
  });
});

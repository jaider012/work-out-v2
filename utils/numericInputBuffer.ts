export type NumericInputMode = 'weight' | 'reps';

export function formatDisplay(num: number, mode: NumericInputMode): string {
  if (!num) return '';
  if (mode === 'reps') return String(Math.round(num));
  return String(num);
}

export function parseBuffer(text: string, mode: NumericInputMode): number {
  const normalized = text.replace(',', '.').trim();
  if (!normalized) return 0;
  const parsed = parseFloat(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return mode === 'reps' ? Math.round(parsed) : parsed;
}

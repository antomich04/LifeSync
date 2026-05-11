export type PeakStatus = 'Well within limit' | 'Approaching limit' | 'Near limit' | 'Exceeds limit';

export const SAFE_LIMITS: Record<string, number> = {
  'NO₂': 40,
  'O₃':  100,
  'CO':  4000,
  'SO₂': 20,
};

export function getPeakStatus(peak: number, limit: number): PeakStatus {
  const ratio = peak / limit;
  if (ratio <= 0.6)  return 'Well within limit';
  if (ratio <= 0.85) return 'Approaching limit';
  if (ratio <= 1.0)  return 'Near limit';
  return 'Exceeds limit';
}
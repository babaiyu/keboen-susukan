import dayjs from 'dayjs';
import 'dayjs/locale/id';

// Indonesian month names for every date rendered in the UI.
dayjs.locale('id');

/** Today as a date-only string (YYYY-MM-DD), the storage format. */
export function todayISO(): string {
  return dayjs().format('YYYY-MM-DD');
}

/** Formats a stored YYYY-MM-DD date for display, e.g. "14 Nov 2026". */
export function formatDate(value?: string, fallback = 'Belum diisi'): string {
  if (!value) return fallback;
  const date = dayjs(value);
  return date.isValid() ? date.format('D MMM YYYY') : fallback;
}

/** Formats numbers with Indonesian thousands separators. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

/**
 * Parses a user-typed decimal, accepting both "2.5" and the Indonesian "2,5".
 * formatNumber renders values with the id-ID locale (a comma), so the input
 * fields must accept that same form. Returns NaN for empty or invalid input so
 * callers can show a validation error.
 */
export function parseDecimal(value: string): number {
  const normalized = value.trim().replace(',', '.');
  return normalized === '' ? Number.NaN : Number(normalized);
}

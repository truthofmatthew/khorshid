// Jalali (Solar Hijri) dates on top of the browser's built-in Persian calendar.
// Calendar days are read at UTC midnight so a time zone never shifts the day.

export type JDate = { y: number; m: number; d: number };

const DAY = 86_400_000;
const fmt = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', {
  timeZone: 'UTC', year: 'numeric', month: 'numeric', day: 'numeric',
});

export const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
// Index 0 is Saturday, the first day of the Iranian week.
export const WEEKDAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
export const WEEKDAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

function fromUTC(t: Date): JDate {
  const p: Record<string, string> = {};
  for (const x of fmt.formatToParts(t)) p[x.type] = x.value;
  return { y: +p.year, m: +p.month, d: +p.day };
}

/** Jalali date of a local calendar day. */
export function toJalali(date: Date): JDate {
  return fromUTC(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())));
}

/** Local Date for a Jalali day, or null when the day does not exist (e.g. 30 Esfand in a common year). */
export function toGregorian(y: number, m: number, d: number): Date | null {
  if (!Number.isInteger(y) || m < 1 || m > 12 || d < 1 || d > (m <= 6 ? 31 : 30)) return null;
  // 1 Farvardin falls on 19-22 March; search around the estimate.
  const guess = Date.UTC(y + 621, 2, 20) + ((m <= 6 ? (m - 1) * 31 : 186 + (m - 7) * 30) + d - 1) * DAY;
  for (const off of [0, 1, -1, 2, -2]) {
    const t = new Date(guess + off * DAY);
    const j = fromUTC(t);
    if (j.y === y && j.m === m && j.d === d) return new Date(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
  }
  return null;
}

export function daysInMonth(y: number, m: number): number {
  if (m <= 6) return 31;
  if (m <= 11) return 30;
  return toGregorian(y, 12, 30) ? 30 : 29;
}

/** 0 = Saturday … 6 = Friday. */
export const weekday = (date: Date) => (date.getDay() + 1) % 7;

export const toFaDigits = (s: string | number) => String(s).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
export const toLatinDigits = (s: string) =>
  s.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)).replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));

export type Style = 'numeric' | 'long';

export function formatJalali(date: Date, style: Style = 'numeric', faDigits = false): string {
  const j = toJalali(date);
  const s = style === 'long'
    ? `${j.d} ${MONTHS[j.m - 1]} ${j.y}`
    : `${j.y}/${String(j.m).padStart(2, '0')}/${String(j.d).padStart(2, '0')}`;
  return faDigits ? toFaDigits(s) : s;
}

// Reads the date strings Notion renders (every "Date format" option) and rewrites them as Jalali.
import { formatJalali, toGregorian, toLatinDigits, toFaDigits, type Style } from './jalali.ts';

const MON: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};
const RELATIVE: Record<string, [number, string]> = {
  today: [0, 'امروز'], yesterday: [-1, 'دیروز'], tomorrow: [1, 'فردا'],
};

function make(y: number, m: number, d: number): Date | null {
  const date = new Date(y, m, d);
  return date.getFullYear() === y && date.getMonth() === m && date.getDate() === d ? date : null;
}

function month(name: string): number | undefined {
  return MON[name.slice(0, 3).toLowerCase()];
}

/** One Gregorian date as Notion shows it, without time. Years before 1600 are left alone: those are Jalali already. */
export function parseGregorian(text: string): { date: Date; style: Style } | null {
  const t = text.trim();
  let m: RegExpMatchArray | null;
  if ((m = t.match(/^([A-Za-z]{3,9})\.? (\d{1,2}),? (\d{4})$/)) && month(m[1]) !== undefined)
    return wrap(make(+m[3], month(m[1])!, +m[2]), 'long');
  if ((m = t.match(/^(\d{1,2}) ([A-Za-z]{3,9})\.?,? (\d{4})$/)) && month(m[2]) !== undefined)
    return wrap(make(+m[3], month(m[2])!, +m[1]), 'long');
  if ((m = t.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/)) && +m[1] >= 1600)
    return wrap(make(+m[1], +m[2] - 1, +m[3]), 'numeric');
  if ((m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/))) {
    // Month/Day/Year unless the first part cannot be a month (then it is Day/Month/Year).
    const [a, b] = +m[1] > 12 ? [+m[2], +m[1]] : [+m[1], +m[2]];
    return wrap(make(+m[3], a - 1, b), 'numeric');
  }
  return null;
}

const wrap = (date: Date | null, style: Style) => (date ? { date, style } : null);

const TIME = /\s+(\d{1,2}:\d{2}(?:\s?[AP]M)?)$/i;

function convertOne(part: string, opts: { faDigits: boolean; style?: Style }): string | null {
  let s = part.trim();
  let time = '';
  const tm = s.match(TIME);
  if (tm) { time = ' ' + tm[1].replace(/\s?AM$/i, ' ق.ظ').replace(/\s?PM$/i, ' ب.ظ'); s = s.slice(0, tm.index); }
  const rel = RELATIVE[s.toLowerCase()];
  if (rel) return rel[1] + (opts.faDigits ? toFaDigits(time) : time);
  const g = parseGregorian(s);
  if (!g) return null;
  const out = formatJalali(g.date, opts.style ?? g.style, opts.faDigits) + time;
  return opts.faDigits ? toFaDigits(out) : out;
}

/** Jalali version of a whole date label ("@Nov 2, 2026 → Nov 5, 2026"), or null when it is not a date label. */
export function convertDateText(text: string, opts: { faDigits: boolean; style?: Style }): string | null {
  const at = text.startsWith('@') ? '@' : '';
  const parts = text.slice(at.length).split(/\s*→\s*/);
  if (parts.length > 2) return null;
  const out = parts.map((p) => convertOne(p, opts));
  if (out.some((x) => x === null)) return null;
  return at + out.join(' ← ');
}

/** Jalali date typed by the user ("1405/8/11", "۱۴۰۵-۰۸-۱۱") → Gregorian Date. */
export function parseJalaliInput(text: string): Date | null {
  const m = toLatinDigits(text.trim()).match(/^(1[2-4]\d\d)[/.\-](\d{1,2})[/.\-](\d{1,2})$/);
  return m ? toGregorian(+m[1], +m[2], +m[3]) : null;
}

const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const formatGregorianLong = (d: Date) => `${EN_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

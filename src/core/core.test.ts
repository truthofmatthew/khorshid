import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toJalali, toGregorian, daysInMonth, formatJalali, weekday } from './jalali.ts';
import { convertDateText, parseJalaliInput } from './dates.ts';
import { fixLayout, fixPersian } from './text.ts';

test('known dates', () => {
  assert.deepEqual(toJalali(new Date(2026, 10, 2)), { y: 1405, m: 8, d: 11 });
  assert.deepEqual(toJalali(new Date(2025, 2, 21)), { y: 1404, m: 1, d: 1 });
  assert.equal(toGregorian(1405, 8, 11)?.toDateString(), new Date(2026, 10, 2).toDateString());
  assert.equal(weekday(new Date(2026, 10, 7)), 0); // a Saturday
});

test('round trip over 60 years, every day', () => {
  const d = new Date(1990, 0, 1);
  while (d.getFullYear() < 2050) {
    const j = toJalali(d);
    assert.equal(toGregorian(j.y, j.m, j.d)?.toDateString(), d.toDateString());
    d.setDate(d.getDate() + 1);
  }
});

test('invalid days and leap Esfand', () => {
  assert.equal(toGregorian(1405, 7, 31), null);
  assert.equal(daysInMonth(1403, 12), 30); // 1403 is leap
  assert.equal(daysInMonth(1404, 12), 29);
  assert.equal(toGregorian(1404, 12, 30), null);
});

test('Notion date labels', () => {
  const o = { faDigits: false };
  assert.equal(convertDateText('November 2, 2026', o), '11 آبان 1405');
  assert.equal(convertDateText('Nov 2, 2026 3:30 PM', o), '11 آبان 1405 3:30 ب.ظ');
  assert.equal(convertDateText('2026/11/02', o), '1405/08/11');
  assert.equal(convertDateText('11/02/2026', o), '1405/08/11');
  assert.equal(convertDateText('25/12/2026', o), '1405/10/04');
  assert.equal(convertDateText('@Today', o), '@امروز');
  assert.equal(convertDateText('Nov 2, 2026 → Nov 5, 2026', o), '11 آبان 1405 ← 14 آبان 1405');
  assert.equal(convertDateText('2026/11/02', { faDigits: true }), '۱۴۰۵/۰۸/۱۱');
  assert.equal(convertDateText('1405/08/11', o), null);
  assert.equal(convertDateText('Meeting notes', o), null);
  assert.equal(convertDateText('February 30, 2026', o), null);
  assert.equal(formatJalali(new Date(2026, 10, 2), 'long', true), '۱۱ آبان ۱۴۰۵');
});

test('typed Jalali input', () => {
  assert.equal(parseJalaliInput('۱۴۰۵/۸/۱۱')?.toDateString(), new Date(2026, 10, 2).toDateString());
  assert.equal(parseJalaliInput('2026/11/02'), null);
});

test('writing helpers', () => {
  assert.equal(fixLayout('sghl'), 'سلام');
  assert.equal(fixLayout('اثممخ'), 'hello');
  assert.equal(fixPersian('علي مي رود و كتاب ها را مي خواند .'), 'علی می‌رود و کتاب‌ها را می‌خواند.');
});

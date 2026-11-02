// Embeddable Persian calendar. Everything is in the URL, so a Notion /embed of it needs no account:
// ?type=month|today|week|countdown&theme=auto|light|dark&accent=b5452f&digits=fa|en&to=1406-01-01&label=…
import { toJalali, toGregorian, daysInMonth, weekday, toFaDigits, MONTHS, WEEKDAYS, WEEKDAYS_SHORT, type JDate } from '../core/jalali.ts';
import { occasion } from '../core/holidays.ts';

const q = new URLSearchParams(location.search);
const type = q.get('type') ?? 'month';
const fa = q.get('digits') !== 'en';
const n = (x: string | number) => (fa ? toFaDigits(x) : String(x));
const accent = q.get('accent');
if (accent && /^[0-9a-f]{3,8}$/i.test(accent)) document.documentElement.style.setProperty('--accent', `#${accent}`);
if (q.get('theme') === 'light' || q.get('theme') === 'dark') document.documentElement.dataset.theme = q.get('theme')!;
document.body.classList.add(`w-${type}`);

const gFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const gMonth = new Intl.DateTimeFormat('en-US', { month: 'short' });
const root = document.getElementById('app')!;

const today = () => new Date(new Date().toDateString());
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const el = (tag: string, cls = '', text = '') => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
};

function month(view: JDate) {
  const first = toGregorian(view.y, view.m, 1)!;
  const len = daysInMonth(view.y, view.m);
  const last = toGregorian(view.y, view.m, len)!;
  const t = today();

  const head = el('div', 'head');
  const prev = el('button', 'nav', '›'); prev.ariaLabel = 'ماه قبل';
  const next = el('button', 'nav', '‹'); next.ariaLabel = 'ماه بعد';
  const title = el('div', 'title');
  title.append(el('strong', '', `${MONTHS[view.m - 1]} ${n(view.y)}`),
    el('span', 'sub en', `${gMonth.format(first)}–${gMonth.format(last)} ${last.getFullYear()}`));
  head.append(prev, title, next);
  prev.onclick = () => render(view.m === 1 ? { y: view.y - 1, m: 12, d: 1 } : { ...view, m: view.m - 1 });
  next.onclick = () => render(view.m === 12 ? { y: view.y + 1, m: 1, d: 1 } : { ...view, m: view.m + 1 });

  const grid = el('div', 'grid');
  grid.role = 'grid';
  WEEKDAYS_SHORT.forEach((w, i) => { const h = el('div', 'dow', w); h.title = WEEKDAYS[i]; grid.append(h); });
  for (let i = 0; i < weekday(first); i++) grid.append(el('div', 'pad'));
  for (let d = 1; d <= len; d++) {
    const g = toGregorian(view.y, view.m, d)!;
    const occ = occasion(view.m, d);
    const cell = el('div', 'day');
    if (weekday(g) === 6 || occ?.off) cell.classList.add('off');
    if (sameDay(g, t)) { cell.classList.add('today'); cell.ariaCurrent = 'date'; }
    if (occ) { cell.classList.add('occ'); cell.title = occ.name; }
    cell.append(el('span', 'j', n(d)), el('span', 'g', String(g.getDate())));
    grid.append(cell);
  }
  root.replaceChildren(head, grid);
}

function todayCard() {
  const t = today();
  const j = toJalali(t);
  const occ = occasion(j.m, j.d);
  const card = el('div', 'card');
  card.append(
    el('div', 'wd', WEEKDAYS[weekday(t)]),
    el('div', 'big', n(j.d)),
    el('div', 'my', `${MONTHS[j.m - 1]} ${n(j.y)}`),
    el('div', 'sub en', t.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })),
  );
  if (occ) card.append(el('div', 'occ-name', occ.name));
  root.replaceChildren(card);
}

function week() {
  const t = today();
  const start = new Date(t); start.setDate(t.getDate() - weekday(t));
  const j = toJalali(t);
  const strip = el('div', 'strip');
  for (let i = 0; i < 7; i++) {
    const g = new Date(start); g.setDate(start.getDate() + i);
    const jd = toJalali(g);
    const occ = occasion(jd.m, jd.d);
    const c = el('div', 'day');
    if (i === 6 || occ?.off) c.classList.add('off');
    if (sameDay(g, t)) { c.classList.add('today'); c.ariaCurrent = 'date'; }
    if (occ) c.title = occ.name;
    c.append(el('span', 'dow', WEEKDAYS[i]), el('span', 'j', n(jd.d)), el('span', 'g', gFmt.format(g)));
    strip.append(c);
  }
  const head = el('div', 'head');
  head.append(el('strong', '', `${MONTHS[j.m - 1]} ${n(j.y)}`));
  root.replaceChildren(head, strip);
}

function countdown() {
  const t = today();
  const [y, m, d] = (q.get('to') ?? '').split('-').map(Number);
  // Default: the next Nowruz.
  let target = y ? toGregorian(y, m, d) : toGregorian(toJalali(t).y + 1, 1, 1);
  if (!target) { root.textContent = 'این تاریخ رو نمی‌شناسم'; return; }
  const days = Math.round((target.getTime() - t.getTime()) / 86_400_000);
  const tj = toJalali(target);
  const card = el('div', 'card');
  card.append(
    el('div', 'wd', q.get('label') || (y ? 'تا' : 'تا نوروز')),
    el('div', 'big', n(Math.abs(days))),
    el('div', 'my', days >= 0 ? 'روز مونده' : 'روز گذشته'),
    el('div', 'sub', `${n(tj.d)} ${MONTHS[tj.m - 1]} ${n(tj.y)}`),
  );
  root.replaceChildren(card);
}

function render(view = toJalali(today())) {
  if (type === 'today') todayCard();
  else if (type === 'week') week();
  else if (type === 'countdown') countdown();
  else month(view);
}

render();
// Roll over at midnight for pages left open all day.
setInterval(() => { if (type !== 'month') render(); }, 60_000);

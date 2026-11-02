// Notion content script. Dates are never edited in Notion's DOM text: each date label gets a
// data-kh attribute and CSS draws the Jalali text in its place, so nothing Jalali is ever saved
// and Notion's own re-renders cannot fight us. Labels are found by their text, not by Notion's
// class names, which change without notice.
import { convertDateText, parseJalaliInput, formatGregorianLong } from '../../core/dates.ts';
import { toJalali, toFaDigits, MONTHS, WEEKDAYS } from '../../core/jalali.ts';
import { fontFaceCss, SANS_STACK } from '../../core/fonts.ts';
import { getSettings, onSettings, type Settings } from '../settings.ts';

let s: Settings;

const QUICK = /\d{4}|^@?(today|yesterday|tomorrow)\b/i;
const EN_DAYS: Record<string, number> = { sun: 1, mon: 2, tue: 3, wed: 4, thu: 5, fri: 6, sat: 0 };
const MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const BASE_CSS = `
[data-kh]{font-size:0!important;letter-spacing:0!important}
[data-kh]::after{content:attr(data-kh);font-size:attr(data-kh-fs type(<length>),14px);direction:rtl;unicode-bidi:isolate;white-space:nowrap}
`;
const FONT_CSS = `
.notion-app-inner,.notion-app-inner *:not(svg,svg *),.notion-overlay-container,.notion-overlay-container *:not(svg,svg *){font-family:${SANS_STACK}!important}
.notion-app-inner .notion-code-block *,.notion-app-inner code,.notion-app-inner [data-content-type="code"],.notion-app-inner [data-content-type="code"] *{font-family:"SFMono-Regular",Menlo,Consolas,"Liberation Mono",monospace!important}
`;
// Notion mirrors blocks for Arabic and Hebrew; cells, cards and titles still need per-paragraph direction.
const DIR_CSS = `
.notion-table-view-cell,.notion-collection-item,.notion-board-view [data-content-editable-leaf],[placeholder],.notion-page-block,[data-content-editable-leaf="true"]{unicode-bidi:plaintext;text-align:start}
`;

function style(id: string, css: string) {
  let el = document.getElementById(id);
  if (!css) return el?.remove();
  if (!el) { el = document.createElement('style'); el.id = id; document.head.append(el); }
  if (el.textContent !== css) el.textContent = css;
}

/** Text the user types into a page is never touched, only Notion's own labels and mention chips. */
function inProse(el: Element): boolean {
  const editable = el.closest('[contenteditable="true"]');
  if (!editable) return false;
  const chip = el.closest('[contenteditable="false"]'); // mention chips sit inside editable text
  return !chip || !editable.contains(chip);
}

function mark(el: HTMLElement, text: string) {
  if (!el.dataset.khFs) el.dataset.khFs = getComputedStyle(el).fontSize;
  el.dataset.kh = text;
  el.dataset.khSrc = el.textContent ?? '';
}

function unmark(el: HTMLElement) {
  delete el.dataset.kh; delete el.dataset.khSrc; delete el.dataset.khFs;
}

function convertLabel(el: HTMLElement) {
  const text = el.textContent ?? '';
  if (el.dataset.khSrc === text) return;
  if (el.dataset.kh) unmark(el);
  const t = text.trim();
  if (!t || t.length > 60 || !QUICK.test(t) || inProse(el)) return;
  const out = convertDateText(t, { faDigits: s.faDigits, style: s.style === 'auto' ? undefined : s.style });
  if (out) mark(el, out);
}

function scan(root: Node) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const leaves = new Set<HTMLElement>();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement;
    if (el && el.childNodes.length === 1 && !el.closest('script,style,input,textarea')) leaves.add(el);
  }
  // A text node that just changed may belong to a label we marked earlier.
  if (root.nodeType === Node.ELEMENT_NODE && (root as HTMLElement).dataset?.khSrc !== undefined) leaves.add(root as HTMLElement);
  leaves.forEach(convertLabel);
}

/** Month grid of a Notion calendar view: header, weekday names and day numbers. */
function convertCalendars() {
  for (const view of document.querySelectorAll<HTMLElement>('.notion-calendar-view')) {
    let year = 0, month = -1;
    for (const el of view.querySelectorAll<HTMLElement>('*')) {
      if (el.childNodes.length !== 1 || el.firstChild?.nodeType !== Node.TEXT_NODE) continue;
      const m = (el.dataset.khSrc ?? el.textContent ?? '').trim().match(/^([A-Z][a-z]+) (\d{4})$/);
      const mi = m ? MON.indexOf(m[1].slice(0, 3).toLowerCase()) : -1;
      if (mi >= 0) {
        year = +m![2]; month = mi;
        const a = toJalali(new Date(year, month, 1)), b = toJalali(new Date(year, month + 1, 0));
        const label = a.m === b.m ? `${MONTHS[a.m - 1]} ${a.y}` : `${MONTHS[a.m - 1]} – ${MONTHS[b.m - 1]} ${b.y}`;
        if (el.dataset.khSrc !== el.textContent) mark(el, s.faDigits ? toFaDigits(label) : label);
        break;
      }
    }
    if (month < 0) continue;
    for (const el of view.querySelectorAll<HTMLElement>('.notion-calendar-header-days *, [class*="calendar"] [class*="day-name"]')) {
      const t = (el.dataset.khSrc ?? el.textContent ?? '').trim().slice(0, 3).toLowerCase();
      if (el.childNodes.length === 1 && t in EN_DAYS && el.dataset.khSrc !== el.textContent) mark(el, WEEKDAYS[EN_DAYS[t]]);
    }
    // Day cells show "26 … 31, Nov 1, 2 … 30, Dec 1 …"; a "Mon 1" label starts that month.
    const cells = [...view.querySelectorAll<HTMLElement>('.notion-calendar-view-day')];
    const firstLabel = cells.findIndex((c) => /^[A-Z][a-z]{2} 1$/.test((c.dataset.khSrc ?? c.textContent ?? '').trim()));
    let cm = firstLabel > 0 ? month - 1 : month;
    cells.forEach((c) => {
      const t = (c.dataset.khSrc ?? c.textContent ?? '').trim();
      const lm = t.match(/^([A-Z][a-z]{2}) (\d{1,2})$/);
      if (lm) cm = month + ((MON.indexOf(lm[1].toLowerCase()) - month + 18) % 12) - 6;
      const day = +(lm ? lm[2] : t);
      if (!day || c.dataset.khSrc === c.textContent) return;
      const j = toJalali(new Date(year, cm, day));
      const label = j.d === 1 ? `${j.d} ${MONTHS[j.m - 1]}` : String(j.d);
      mark(c, s.faDigits ? toFaDigits(label) : label);
    });
  }
}

function clearAll() {
  document.querySelectorAll<HTMLElement>('[data-kh]').forEach(unmark);
}

let pending = new Set<Node>();
let queued = false;
function flush() {
  queued = false;
  if (!s.jalali) return;
  const roots = pending; pending = new Set();
  roots.forEach((r) => r.isConnected && scan(r));
  convertCalendars();
}

const observer = new MutationObserver((muts) => {
  for (const m of muts) {
    const target = m.type === 'characterData' ? m.target.parentElement : m.target;
    if (target) pending.add(target);
  }
  if (!queued) { queued = true; requestAnimationFrame(flush); }
});

// Typing "1405/8/11" (Persian or Latin digits) in a Notion date field: rewrite it to the
// Gregorian day before Notion reads the field on Enter or blur.
function jalaliInput(e: Event) {
  if (!s.jalaliInput) return;
  if (e instanceof KeyboardEvent && e.key !== 'Enter') return;
  const input = e.target;
  if (!(input instanceof HTMLInputElement)) return;
  const date = parseJalaliInput(input.value);
  if (!date) return;
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, formatGregorianLong(date));
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function apply(next: Settings) {
  const restyle = !s || s.faDigits !== next.faDigits || s.style !== next.style || !next.jalali;
  s = next;
  style('kh-base', BASE_CSS);
  style('kh-font-face', s.font ? fontFaceCss(s.font, (f) => chrome.runtime.getURL(`fonts/${f}`)) : '');
  style('kh-font', s.font ? FONT_CSS : '');
  style('kh-dir', s.direction ? DIR_CSS : '');
  if (restyle) clearAll();
  if (s.jalali) { scan(document.body); convertCalendars(); }
}

// The background also injects this script into tabs that were open at install; run once per tab.
if (!(window as any).__khNotion) {
  (window as any).__khNotion = true;
  chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
    if (msg?.type === 'status') reply({ site: 'notion', dates: document.querySelectorAll('[data-kh]').length });
  });
  getSettings().then(start);
}

function start(initial: Settings) {
  apply(initial);
  onSettings(apply);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  document.addEventListener('keydown', jalaliInput, true);
  document.addEventListener('focusout', jalaliInput, true);
}

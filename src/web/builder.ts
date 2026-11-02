import { toLatinDigits, toGregorian } from '../core/jalali.ts';

const form = document.querySelector<HTMLFormElement>('#opts')!;
const frame = document.querySelector<HTMLIFrameElement>('#frame')!;
const urlBox = document.querySelector<HTMLInputElement>('#url')!;
const code = document.querySelector('#iframe-code')!;
const cd = document.querySelector<HTMLFieldSetElement>('#cd')!;
const HEIGHT: Record<string, number> = { month: 430, today: 230, week: 150, countdown: 230 };

function update() {
  const f = new FormData(form);
  const type = String(f.get('type'));
  const q = new URLSearchParams({ type, theme: String(f.get('theme')), accent: String(f.get('accent')), digits: String(f.get('digits')) });
  cd.hidden = type !== 'countdown';
  if (type === 'countdown') {
    const m = toLatinDigits(String(f.get('to') ?? '')).match(/^(\d{4})\D(\d{1,2})\D(\d{1,2})$/);
    if (m && toGregorian(+m[1], +m[2], +m[3])) q.set('to', `${+m[1]}-${+m[2]}-${+m[3]}`);
    const label = String(f.get('label') ?? '').trim();
    if (label) q.set('label', label);
  }
  const url = new URL(`../widget/?${q}`, location.href).href;
  urlBox.value = url;
  frame.src = url;
  frame.style.height = `${HEIGHT[type]}px`;
  code.textContent = `<iframe src="${url}" width="100%" height="${HEIGHT[type]}" style="border:0" loading="lazy"></iframe>`;
}

form.addEventListener('input', update);
document.querySelector<HTMLButtonElement>('#copy')!.onclick = async (e) => {
  await navigator.clipboard.writeText(urlBox.value);
  const btn = e.currentTarget as HTMLButtonElement;
  btn.textContent = 'کپی شد';
  setTimeout(() => (btn.textContent = 'کپی لینک'), 1500);
};
update();

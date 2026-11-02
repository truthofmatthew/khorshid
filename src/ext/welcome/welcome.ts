// Welcome guide: opened once on install (and once after the 0.x → Khorshid update), and from the popup.
const q = new URLSearchParams(location.search);
const fa = document.querySelector<HTMLElement>('.l-fa')!;
const en = document.querySelector<HTMLElement>('.l-en')!;
const btn = document.querySelector<HTMLButtonElement>('#lang-btn')!;

function show(lang: 'fa' | 'en') {
  fa.hidden = lang !== 'fa';
  en.hidden = lang !== 'en';
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  btn.textContent = lang === 'fa' ? 'English' : 'فارسی';
  btn.lang = lang === 'fa' ? 'en' : 'fa';
  btn.onclick = () => show(lang === 'fa' ? 'en' : 'fa');
}

// Persian first: most users run Chrome in English, so the browser language says little about them.
show(q.get('lang') === 'en' ? 'en' : 'fa');
if (q.has('updated')) for (const id of ['updated-fa', 'updated-en']) document.getElementById(id)!.hidden = false;

for (const b of document.querySelectorAll<HTMLButtonElement>('[data-done]')) {
  b.onclick = () => chrome.tabs.getCurrent((t) => (t?.id ? chrome.tabs.remove(t.id) : window.close()));
}

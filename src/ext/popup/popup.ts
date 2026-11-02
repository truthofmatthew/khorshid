import { FONTS, fontFaceCss } from '../../core/fonts.ts';
import { toFaDigits } from '../../core/jalali.ts';
import { getSettings, saveSettings, type Settings } from '../settings.ts';

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const NOTION = /(^|\.)notion\.so$/;
const NOTION_LIKE = /(^|\.)notion\.(site|com)$/;

// The popup itself shows each font in its own face.
const faces = document.createElement('style');
faces.textContent = FONTS.map((f) => fontFaceCss(f.id, (file) => `fonts/${file}`).replaceAll('"KH Persian"', `"${f.id}"`)).join('\n');
document.head.append(faces);

const fontSelect = $<HTMLSelectElement>('#font');
for (const f of FONTS) fontSelect.add(new Option(f.fa, f.id));

async function init() {
  const s = await getSettings();
  document.querySelectorAll<HTMLInputElement>('input[data-key]').forEach((el) => {
    const key = el.dataset.key as keyof Settings;
    el.checked = !!s[key];
    el.onchange = () => saveSettings({ [key]: el.checked });
  });
  document.querySelectorAll<HTMLInputElement>('input[name=style]').forEach((el) => {
    el.checked = el.value === s.style;
    el.onchange = () => saveSettings({ style: el.value as Settings['style'] });
  });
  fontSelect.value = s.font;
  fontSelect.style.fontFamily = s.font || 'inherit';
  fontSelect.onchange = () => {
    fontSelect.style.fontFamily = fontSelect.value || 'inherit';
    saveSettings({ font: fontSelect.value });
  };
  $('#version').textContent = 'نسخه ' + toFaDigits(chrome.runtime.getManifest().version);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url ? new URL(tab.url) : null;
  const status = $('#status');
  if (!url || !url.protocol.startsWith('http')) { status.textContent = 'در این صفحه کاری نمی‌کند'; return; }

  if (NOTION.test(url.hostname)) {
    const res = await chrome.tabs.sendMessage(tab.id!, { type: 'status' }).catch(() => null);
    status.textContent = res
      ? `فعال در نوشن · ${toFaDigits(res.dates)} تاریخ شمسی شد`
      : 'صفحه را یک بار تازه کنید';
    status.dataset.on = String(!!res);
    return;
  }
  setupSite(tab, url);
}

async function setupSite(tab: chrome.tabs.Tab, url: URL) {
  const origin = `${url.origin}/*`;
  const id = `site-${url.hostname}`;
  const script = NOTION_LIKE.test(url.hostname) ? 'notion.js' : 'site.js';
  const on = (await chrome.permissions.contains({ origins: [origin] }))
    && (await chrome.scripting.getRegisteredContentScripts({ ids: [id] })).length > 0;
  const status = $('#status');
  status.textContent = on ? `روشن روی ${url.hostname}` : `روی ${url.hostname} خاموش است`;
  status.dataset.on = String(on);
  $('#site').hidden = false;
  $('#site-text').textContent = on
    ? 'فونت فارسی و راست‌چین خودکار روی این سایت روشن است.'
    : 'فونت فارسی و راست‌چین خودکار را برای این سایت روشن کنید. فقط همین سایت، نه همه‌جا.';
  const btn = $<HTMLButtonElement>('#site-btn');
  btn.textContent = on ? `خاموش کردن روی ${url.hostname}` : `روشن کردن روی ${url.hostname}`;
  btn.onclick = async () => {
    if (on) {
      await chrome.scripting.unregisterContentScripts({ ids: [id] }).catch(() => {});
      await chrome.permissions.remove({ origins: [origin] });
      chrome.tabs.reload(tab.id!);
      window.close();
      return;
    }
    // permissions.request must be the first await: it needs the click's user gesture.
    if (!(await chrome.permissions.request({ origins: [origin] }))) return;
    await chrome.scripting.registerContentScripts([{ id, matches: [origin], js: [script], runAt: 'document_idle' }]);
    await chrome.scripting.executeScript({ target: { tabId: tab.id! }, files: [script] });
    setupSite(tab, url);
  };
}

init();

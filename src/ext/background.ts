import { DEFAULTS } from './settings.ts';
import { FONTS } from '../core/fonts.ts';

const MENU = [
  { id: 'layout', title: 'اصلاح زبان کیبورد (sghl → سلام)' },
  { id: 'persian', title: 'اصلاح نگارش فارسی (ی، ک، نیم‌فاصله)' },
] as const;

chrome.runtime.onInstalled.addListener(async ({ reason, previousVersion }) => {
  await chrome.contextMenus.removeAll();
  for (const m of MENU) chrome.contextMenus.create({ id: m.id, title: m.title, contexts: ['selection', 'editable'] });

  if (reason === 'install' || reason === 'update') {
    // Notion tabs opened before the install have no content script yet; start it there so
    // nobody has to know about reloading.
    for (const tab of await chrome.tabs.query({ url: 'https://*.notion.so/*' })) {
      if (tab.id) chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['notion.js'] }).catch(() => {});
    }
  }
  if (reason === 'install') chrome.tabs.create({ url: 'welcome.html' });
  if (reason !== 'update' || !previousVersion?.startsWith('0.')) return;

  // 0.x was "Persian Tools for Notion": say once that it is now Khorshid.
  chrome.tabs.create({ url: 'welcome.html?updated' });
  // Carry settings over from 0.x, which stored each one under its own key.
  const old = await chrome.storage.sync.get(['persianInput', 'fontInjectionEnabled', 'selectedFont', 'persianNumbers', 'kh']);
  if (old.kh || !('persianInput' in old)) return;
  const font = FONTS.some((f) => f.id === old.selectedFont) ? old.selectedFont : 'Vazirmatn';
  await chrome.storage.sync.set({
    kh: { ...DEFAULTS, jalali: !!old.persianInput, faDigits: !!old.persianNumbers, font: old.fontInjectionEnabled ? font : '' },
  });
  await chrome.storage.sync.remove(['persianInput', 'fontInjectionEnabled', 'selectedFont', 'persianNumbers']);
});

async function fix(tabId: number | undefined, mode: string) {
  if (tabId === undefined) return;
  // activeTab (granted by the shortcut or menu click) lets this run on any site.
  await chrome.scripting.executeScript({ target: { tabId }, files: ['fix.js'] });
  await chrome.scripting.executeScript({ target: { tabId }, func: (m) => (window as any).__khFix(m), args: [mode] });
}

chrome.contextMenus.onClicked.addListener((info, tab) => fix(tab?.id, String(info.menuItemId)));
chrome.commands.onCommand.addListener((cmd, tab) => fix(tab?.id, cmd === 'fix-layout' ? 'layout' : 'persian'));

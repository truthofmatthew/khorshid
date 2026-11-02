import { DEFAULTS } from './settings.ts';

const MENU = [
  { id: 'layout', title: 'اصلاح زبان کیبورد (sghl → سلام)' },
  { id: 'persian', title: 'اصلاح نگارش فارسی (ی، ک، نیم‌فاصله)' },
] as const;

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  for (const m of MENU) chrome.contextMenus.create({ id: m.id, title: m.title, contexts: ['selection', 'editable'] });
  if (reason !== 'update') return;
  // Carry settings over from 0.x, which stored each one under its own key.
  const old = await chrome.storage.sync.get(['persianInput', 'fontInjectionEnabled', 'selectedFont', 'persianNumbers', 'kh']);
  if (old.kh || !('persianInput' in old)) return;
  await chrome.storage.sync.set({
    kh: {
      ...DEFAULTS,
      jalali: !!old.persianInput,
      faDigits: !!old.persianNumbers,
      font: old.fontInjectionEnabled ? (old.selectedFont || 'Vazirmatn') : '',
    },
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

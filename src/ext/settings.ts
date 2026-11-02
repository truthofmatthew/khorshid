export type Settings = {
  jalali: boolean;          // show Notion dates as Jalali
  faDigits: boolean;        // ۱۲۳ instead of 123 in converted dates
  style: 'auto' | 'numeric' | 'long';
  jalaliInput: boolean;     // typing 1405/8/11 in a Notion date field saves the right day
  font: string;             // '' = leave Notion's font alone
  direction: boolean;       // per-paragraph RTL/LTR where Notion does not do it
};

export const DEFAULTS: Settings = {
  jalali: true, faDigits: true, style: 'auto', jalaliInput: true, font: 'Vazirmatn', direction: true,
};

export async function getSettings(): Promise<Settings> {
  const { kh } = await chrome.storage.sync.get('kh');
  return { ...DEFAULTS, ...kh };
}

export async function saveSettings(patch: Partial<Settings>) {
  await chrome.storage.sync.set({ kh: { ...(await getSettings()), ...patch } });
}

export function onSettings(cb: (s: Settings) => void) {
  chrome.storage.onChanged.addListener((c, area) => {
    if (area === 'sync' && c.kh) cb({ ...DEFAULTS, ...c.kh.newValue });
  });
}

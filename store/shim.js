// Stand-in for the chrome.* APIs so the built extension scripts run on plain pages for screenshots.
const q = new URLSearchParams(location.search);
const store = {
  kh: { jalali: q.get('jalali') !== '0', faDigits: true, style: 'auto', jalaliInput: true, font: 'Vazirmatn', direction: true },
};
window.chrome = Object.assign(window.chrome || {}, {
  storage: { sync: { get: async () => store, set: async (v) => Object.assign(store, v) }, onChanged: { addListener() {} } },
  runtime: { getURL: (p) => '/dist/extension/' + p, getManifest: () => ({ version: '1.0.0' }), onMessage: { addListener() {} } },
  tabs: { query: async () => [{ id: 1, url: q.get('url') || 'https://www.notion.so/x' }], sendMessage: async () => ({ site: 'notion', dates: 42 }), reload() {} },
  permissions: { contains: async () => false, request: async () => true, remove: async () => true },
  scripting: { getRegisteredContentScripts: async () => [], registerContentScripts: async () => {}, executeScript: async () => {}, unregisterContentScripts: async () => {} },
});

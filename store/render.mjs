// Renders the Chrome Web Store images into store/out/ with headless Chromium (Chrome or Edge).
// Run `npm run build` first. Usage: node store/render.mjs
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import { extname, join } from 'node:path';

const BROWSERS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
];
const browser = BROWSERS.find(existsSync);
if (!browser) throw new Error('No Chrome, Edge or Chromium found');

// popup.html for the screenshot: the built popup plus the chrome.* stand-in.
const popup = readFileSync('dist/extension/popup.html', 'utf8')
  .replace('<meta charset="utf-8">', '<meta charset="utf-8"><base href="/dist/extension/"><script src="/store/shim.js"></script>');
writeFileSync('store/popup.html', popup);

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = createServer((req, res) => {
  const path = join('.', decodeURIComponent(new URL(req.url, 'http://x').pathname));
  const file = existsSync(path) && !path.endsWith('/') ? path : join(path, 'index.html');
  if (!existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
}).listen(0);
const base = `http://localhost:${server.address().port}`;

const shot = (scene, title, sub, extra = '') =>
  `/store/shot.html?${new URLSearchParams({ scene, title, sub })}${extra}`;
const SHOTS = [
  ['1-dates.png', shot('/store/notion-table.html', 'تاریخ‌های نوشن، <em>شمسی</em>', 'Every Notion date in the Persian calendar: tables, properties, mentions')],
  ['2-calendar.png', shot('/store/notion-calendar.html', 'نمای تقویم نوشن با <em>ماه‌های شمسی</em>', 'Calendar views show Jalali months, weekdays and days')],
  ['3-embed.png', shot('/store/notion-embed.html', 'تقویم شمسی را <em>در صفحه‌ی نوشن</em> بگذارید', 'Free embeddable Persian calendars for Notion, Obsidian and any site', '&url=notion.so/dashboard')],
  ['4-settings.png', shot('/store/notion-table.html?jalali=1', 'همه‌چیز با <em>یک کلیک</em>', 'Persian fonts, digits, auto direction, per-site switch', '&popup=1')],
  ['5-writing.png', shot('/store/writing.html', 'sghl ← <em>سلام</em>', 'Fix text typed with the wrong keyboard layout, and Persian typos', '&url=chatgpt.com')],
];

mkdirSync('store/out', { recursive: true });
// Async: a sync call would block the server that feeds the browser.
async function render(url, out, w, h) {
  rmSync(out, { force: true });
  await promisify(execFile)(browser, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    `--window-size=${w},${h}`, '--virtual-time-budget=4000', `--screenshot=${out}`, base + url,
  ], { timeout: 60_000 }).catch(() => {}); // Edge's updater can fail the exit code after a good shot
  if (!existsSync(out)) throw new Error(`no screenshot for ${url}`);
}

// Extension icons from public/icons/icon.svg (rebuild afterwards to copy them into dist).
// Headless windows are at least 500px wide, so small images are drawn large and scaled down.
await render('/store/icon.html', 'store/out/icon-512.png', 512, 512);
for (const size of [128, 48, 16]) execFileSync('sips', ['-z', String(size), String(size), 'store/out/icon-512.png', '--out', `public/icons/icon${size}.png`], { stdio: 'ignore' });

for (const [name, url] of SHOTS) await render(url, `store/out/${name}`, 1280, 800);
await render('/store/promo.html', 'store/out/promo-880x560.png', 880, 560);
execFileSync('sips', ['-z', '280', '440', 'store/out/promo-880x560.png', '--out', 'store/out/promo-440x280.png'], { stdio: 'ignore' });
server.close();
console.log('wrote store/out/*.png');

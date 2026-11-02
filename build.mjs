// Builds dist/extension (load unpacked / zip for the store) and dist/web, which the website serves
// at /projects/khorshid/. URL rule there: English has no suffix, Persian ends in /fa/.
import { build, context } from 'esbuild';
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';

const watch = process.argv.includes('--watch');
rmSync('dist', { recursive: true, force: true });

const common = { bundle: true, format: 'iife', target: 'chrome120', logLevel: 'info', minify: !watch, sourcemap: watch ? 'inline' : false };
const jobs = [
  { ...common, outdir: 'dist/extension', entryPoints: {
    notion: 'src/ext/content/notion.ts', site: 'src/ext/content/site.ts', fix: 'src/ext/fix.ts',
    background: 'src/ext/background.ts', popup: 'src/ext/popup/popup.ts', welcome: 'src/ext/welcome/welcome.ts',
  } },
  { ...common, outdir: 'dist/web', entryPoints: { widget: 'src/web/widget.ts', builder: 'src/web/builder.ts' } },
];

const copy = (from, to) => { mkdirSync(to.replace(/\/[^/]+$/, ''), { recursive: true }); cpSync(from, to, { recursive: true }); };
copy('src/ext/manifest.json', 'dist/extension/manifest.json');
copy('src/ext/popup/popup.html', 'dist/extension/popup.html');
copy('src/ext/popup/popup.css', 'dist/extension/popup.css');
copy('src/ext/welcome/welcome.html', 'dist/extension/welcome.html');
copy('src/ext/welcome/welcome.css', 'dist/extension/welcome.css');
copy('public/fonts', 'dist/extension/fonts');
copy('public/icons', 'dist/extension/icons');
copy('public/fonts/Vazirmatn.woff2', 'dist/web/fonts/Vazirmatn.woff2'); // the web pages only use Vazirmatn
copy('public/icons', 'dist/web/icons');
copy('src/web/widget.html', 'dist/web/embed/index.html'); // embedded in people's Notion pages: never move it
copy('src/web/calendar-en.html', 'dist/web/calendar/index.html');
copy('src/web/calendar.html', 'dist/web/calendar/fa/index.html');
copy('src/web/privacy.html', 'dist/web/privacy/index.html');
copy('src/web/widget.css', 'dist/web/widget.css');
copy('src/web/site.css', 'dist/web/site.css');
copy('src/ext/welcome/welcome.css', 'dist/web/welcome.css');
mkdirSync('dist/web/help/fa', { recursive: true });
writeFileSync('dist/web/help/index.html', helpPage('en'));
writeFileSync('dist/web/help/fa/index.html', helpPage('fa'));

// The website's help pages reuse the extension's welcome guide, one language per URL.
function helpPage(lang) {
  const src = readFileSync('src/ext/welcome/welcome.html', 'utf8');
  let body = src.slice(src.indexOf(`<!--${lang}:start-->`), src.indexOf(`<!--${lang}:end-->`))
    .replace(/<p class="updated"[\s\S]*?<\/p>/, '')
    .replace(/<button class="done"[^>]*>[^<]*<\/button>/, '')
    .replace(' hidden>', '>');
  const fa = lang === 'fa';
  const base = 'https://truthofmatthew.com/projects/khorshid/help/';
  const store = 'https://chromewebstore.google.com/detail/dhkfoinnpjgabapcgjkmjophfincioij';
  // Someone reading this on the web may not have installed it yet.
  body = body.replace(/<header>[\s\S]*?<\/header>/, fa
    ? `<header><img src="icons/icon128.png" alt="" width="88" height="88"><h1>راهنمای خورشید</h1><p>اول افزونه رو نصب کن، بعدش این سه تا کار کوچیک:</p><a class="btn" href="${store}">نصبش کن، مجانیه</a></header>`
    : `<header><img src="icons/icon128.png" alt="" width="88" height="88"><h1>How to use Khorshid</h1><p>Install it first, then three tiny things:</p><a class="btn" href="${store}">Add to Chrome, it's free</a></header>`);
  const title = fa ? 'راهنمای خورشید: تاریخ شمسی و فونت فارسی در نوشن، قدم‌به‌قدم' : 'How to use Khorshid: Persian dates and fonts in Notion, step by step';
  const desc = fa
    ? 'راهنمای ساده‌ی خورشید: نصب، سنجاق کردن، شمسی کردن تاریخ‌های نوشن، تایپ تاریخ شمسی، اصلاح زبان کیبورد و گذاشتن تقویم شمسی در نوشن.'
    : 'A simple guide to Khorshid: install, pin, see Notion dates in the Persian calendar, type Jalali dates, fix the keyboard layout and embed a Persian calendar.';
  return `<!doctype html>
<html lang="${lang}" dir="${fa ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<base href="${fa ? '../../' : '../'}">
<link rel="canonical" href="${base}${fa ? 'fa/' : ''}">
<link rel="alternate" hreflang="fa" href="${base}fa/">
<link rel="alternate" hreflang="en" href="${base}">
<link rel="alternate" hreflang="x-default" href="${base}">
<meta property="og:type" content="article">
<meta property="og:title" content="${title}">
<meta property="og:url" content="${base}${fa ? 'fa/' : ''}">
<meta property="og:image" content="https://truthofmatthew.com/projects/khorshid/og.jpg">
<meta property="og:site_name" content="Matthew Truth">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="icons/icon.svg">
<link rel="stylesheet" href="welcome.css">
</head>
<body>
<main>
  <div class="lang"><a href="${fa ? 'fa/' : ''}">${fa ? 'خورشید' : 'Khorshid'}</a> · <a href="help/${fa ? '' : 'fa/'}" hreflang="${fa ? 'en' : 'fa'}" lang="${fa ? 'en' : 'fa'}">${fa ? 'English' : 'فارسی'}</a></div>
  ${body}
</main>
</body>
</html>
`;
}

const manifest = JSON.parse(readFileSync('dist/extension/manifest.json', 'utf8'));
if (manifest.description.length > 132) throw new Error(`manifest description is ${manifest.description.length} chars; the store allows 132`);
writeFileSync('dist/extension/manifest.json', JSON.stringify(manifest));

if (watch) for (const j of jobs) await (await context(j)).watch();
else await Promise.all(jobs.map((j) => build(j)));

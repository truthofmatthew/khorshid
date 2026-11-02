// Builds dist/extension (load unpacked / zip for the store) and dist/web (served at /khorshid/).
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
copy('src/web/widget.html', 'dist/web/widget/index.html');
copy('src/web/calendar.html', 'dist/web/calendar/index.html');
copy('src/web/privacy.html', 'dist/web/privacy/index.html');
copy('src/web/widget.css', 'dist/web/widget.css');
copy('src/web/site.css', 'dist/web/site.css');

const manifest = JSON.parse(readFileSync('dist/extension/manifest.json', 'utf8'));
if (manifest.description.length > 132) throw new Error(`manifest description is ${manifest.description.length} chars; the store allows 132`);
writeFileSync('dist/extension/manifest.json', JSON.stringify(manifest));

if (watch) for (const j of jobs) await (await context(j)).watch();
else await Promise.all(jobs.map((j) => build(j)));

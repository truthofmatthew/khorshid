// Runs on sites the user turned on from the popup (ChatGPT, Gmail, Slack, …): Persian font for
// Persian characters only, and each paragraph takes the direction of its first strong letter.
import { fontFaceCss } from '../../core/fonts.ts';
import { getSettings, onSettings, type Settings } from '../settings.ts';

const DIR_CSS = `p,li,h1,h2,h3,h4,h5,h6,blockquote,td,th,dd,dt,figcaption,textarea,input:not([type]),input[type=text],input[type=search],[contenteditable="true"],[contenteditable="true"] div{unicode-bidi:plaintext;text-align:start}
pre,code,pre *,code *{unicode-bidi:isolate;text-align:left;direction:ltr}`;

// Read before our style exists, so it is the site's own stack.
const siteStack = getComputedStyle(document.body).fontFamily;

function apply(s: Settings) {
  let el = document.getElementById('kh-site');
  if (!el) { el = document.createElement('style'); el.id = 'kh-site'; document.documentElement.append(el); }
  const face = s.font ? fontFaceCss(s.font, (f) => chrome.runtime.getURL(`fonts/${f}`)) : '';
  // The Persian face only covers Arabic-script code points, so Latin text keeps the site's font.
  // shortcut: one stack (the body's) for the whole page; per-element fonts like serif headings
  // are flattened. Upgrade to per-element stacks if users report a site looking off.
  const family = s.font ? `body,body *:not(svg,svg *,pre,pre *,code,code *,kbd,samp,i,[class*="icon"],[class*="Icon"]){font-family:"KH Persian",${siteStack}!important}` : '';
  el.textContent = [face, s.direction ? DIR_CSS : '', family].join('\n');
}

if (!(window as any).__khSite) {
  (window as any).__khSite = true;
  getSettings().then(apply);
  onSettings(apply);
  chrome.runtime.onMessage.addListener((msg, _s, reply) => {
    if (msg?.type === 'status') reply({ site: 'web' });
  });
}

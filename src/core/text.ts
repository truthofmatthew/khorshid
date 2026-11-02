// Writing helpers: wrong-keyboard-layout fix and Persian typography cleanup.

// Standard Persian layout (ISIRI 9147) on a QWERTY keyboard, unshifted keys.
const EN = "qwertyuiop[]asdfghjkl;'zxcvbnm,\\";
const FA = 'ضصثقفغعهخحجچشسیبلاتنمکگظطزرذدپوپ';
const EN_TO_FA = new Map([...EN].map((c, i) => [c, FA[i]]));
const FA_TO_EN = new Map([...FA].map((c, i) => [c, EN[i]]));
FA_TO_EN.set('پ', 'm');
EN_TO_FA.set('?', '؟');
FA_TO_EN.set('؟', '?');

const isFa = (c: string) => /[؀-ۿ]/.test(c);

/** "sghl" → "سلام" and "اثممخ" → "hello": flips text typed with the wrong keyboard layout. */
export function fixLayout(text: string): string {
  const letters = [...text].filter((c) => /\p{L}/u.test(c));
  const toEn = letters.filter(isFa).length > letters.length / 2;
  return [...text].map((c) => {
    if (toEn) return FA_TO_EN.get(c) ?? c;
    return EN_TO_FA.get(c.toLowerCase()) ?? c;
  }).join('');
}

const ZWNJ = '‌';

/** Arabic letters → Persian, half-spaces for می/ها/تر, no space before Persian punctuation. */
export function fixPersian(text: string): string {
  return text
    .replace(/ي/g, 'ی').replace(/ى/g, 'ی').replace(/ك/g, 'ک').replace(/ة/g, 'ه')
    .replace(/(^|[\s‌])(ن?می)\s+(?=[؀-ۿ])/g, `$1$2${ZWNJ}`)
    .replace(/([؀-ۿ])\s+(ها|های|هایی|هایم|هایت|هایش|تر|ترین)(?=$|[\s.,،؛!?؟])/g, `$1${ZWNJ}$2`)
    .replace(/\s+([،؛؟!.:])/g, '$1');
}

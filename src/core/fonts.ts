// Persian fonts by Saber Rastikerdar and Amin Abedi, all under the SIL Open Font License.
export const FONTS = [
  { id: 'Vazirmatn', fa: 'وزیرمتن', files: [['Vazirmatn.woff2', '100 900']] },
  { id: 'Estedad', fa: 'استعداد', files: [['Estedad.woff2', '100 900']] },
  { id: 'Sahel', fa: 'ساحل', files: [['Sahel.woff2', '100 900']] },
  { id: 'Shabnam', fa: 'شبنم', files: [['Shabnam.woff2', '400'], ['Shabnam-Bold.woff2', '700']] },
  { id: 'Samim', fa: 'صمیم', files: [['Samim.woff2', '400'], ['Samim-Bold.woff2', '700']] },
  { id: 'Parastoo', fa: 'پرستو', files: [['Parastoo.woff2', '400'], ['Parastoo-Bold.woff2', '700']] },
] as const;

// Only Arabic-script characters use the Persian font; Latin text keeps the site's own font.
const ARABIC_SCRIPT = 'U+0600-06FF, U+0750-077F, U+08A0-08FF, U+200C-200F, U+FB50-FDFF, U+FE70-FEFF';

/** @font-face rules that register `id` under the family name "KH Persian". */
export function fontFaceCss(id: string, url: (file: string) => string): string {
  const font = FONTS.find((f) => f.id === id);
  if (!font) return '';
  return font.files.map(([file, weight]) =>
    `@font-face{font-family:"KH Persian";src:url("${url(file)}") format("woff2");font-weight:${weight};font-display:swap;unicode-range:${ARABIC_SCRIPT}}`,
  ).join('\n');
}

export const SANS_STACK = '"KH Persian", ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"';

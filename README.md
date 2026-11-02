<div dir="rtl">

# خورشید ☀️

نوشن تاریخ شمسی بلد نبود، یادش دادم. فونت فارسی و راست‌چین هم یادش دادم. یه تقویم شمسی مجانی هم داره که می‌تونی وسط صفحه‌های نوشنت بذاری.

[نصبش کن، مجانیه](https://chromewebstore.google.com/detail/dhkfoinnpjgabapcgjkmjophfincioij) · [یه تقویم برای نوشنت بساز](https://truthofmatthew.com/projects/khorshid/calendar/fa/) · [راهنما](https://truthofmatthew.com/projects/khorshid/help/fa/) · [یه چیزی خرابه؟ بگو](https://github.com/truthofmatthew/khorshid/issues)

</div>

![Notion dates shown in the Persian calendar](store/out/1-dates.png)

**Khorshid** (خورشید, "sun") is a Chrome extension that teaches Notion Persian. Every date shows in the Jalali calendar, Persian text gets a font that doesn't look like a ransom note, and each paragraph figures out which way it should face. It also fixes text you typed on the wrong keyboard, anywhere on the web, and comes with free Persian calendars you can drop into Notion, Obsidian or your own site.

## What it does

| | |
|---|---|
| **Jalali dates in Notion** | Table and board dates, page properties, `@date` mentions, ranges and times. Even `Today` becomes `امروز`. |
| **Calendar views** | Month headers (`آبان – آذر ۱۴۰۵`), Persian weekday names and Jalali day numbers. No more mental math. |
| **Type Jalali dates** | Type `۱۴۰۵/۸/۱۱` in a Notion date field, press Enter, and Notion saves the right day. |
| **Persian fonts** | Vazirmatn, Estedad, Sahel, Shabnam, Samim, Parastoo. Only Persian letters change; English keeps Notion's font. |
| **Auto direction** | Each paragraph, table cell and card follows its first letter. Code stays left-to-right, as it should. |
| **Wrong-keyboard fix** | Select `sghl`, press <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>L</kbd>, get `سلام` (works the other way too). Any site. |
| **Persian typing fix** | <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> turns Arabic `ي`/`ك` into `ی`/`ک` and adds the half-spaces (`می‌روم`, `کتاب‌ها`). |
| **Other sites** | Switch fonts and auto direction on for ChatGPT, Gmail, Slack or anywhere else, one site at a time, from the popup. |
| **Calendars for Notion** | Month, today, week strip, and a countdown to Nowruz. Pick one at [truthofmatthew.com/projects/khorshid/calendar](https://truthofmatthew.com/projects/khorshid/calendar/), then `/embed` it in Notion. |

![Notion calendar view in Jalali months](store/out/2-calendar.png)
![Persian calendar widgets embedded in a Notion page](store/out/3-embed.png)
![Extension popup](store/out/4-settings.png)
![Wrong keyboard layout fix](store/out/5-writing.png)

## How it works (for the curious)

- It never edits your Notion pages. Each date label gets a `data-kh` attribute and CSS draws the Jalali date on top, so nothing Jalali is saved and Notion can re-render all it wants.
- Dates are found by what they say (`Nov 2, 2026`, `2026/11/02`, `Today`…), not by Notion's class names, which change whenever Notion feels like it. The calendar-view grid is the one spot that still leans on Notion's `.notion-calendar-view` classes.
- The Jalali math is the browser's own Persian calendar (`Intl.DateTimeFormat` with `ca-persian`). No date library.
- Nothing leaves your browser. The [privacy policy](https://truthofmatthew.com/projects/khorshid/privacy/) is short because there's nothing to confess.

## Build it yourself

```bash
npm install
npm test          # date conversion, Notion date parsing, typing fixes
npm run build     # dist/extension (load unpacked) and dist/web (served at /projects/khorshid/)
npm run zip       # dist/khorshid-extension.zip for the Chrome Web Store
node store/render.mjs   # store screenshots, promo tile and icons (needs Chrome or Edge)
```

Then open `chrome://extensions`, turn on Developer mode and load `dist/extension`.

```
src/core/     Jalali dates, Notion date parsing, typing fixes, fonts, holidays (no browser APIs)
src/ext/      the extension: Notion script, other-sites script, popup, welcome guide, background
src/web/      calendar widget, calendar builder, privacy page
store/        screenshot scenes and the renderer
```

## Thanks

Fonts by Saber Rastikerdar and Amin Abedi, under the SIL Open Font License ([list](public/fonts/FONTS.md)). Without them, Persian on the web would still look like it's shouting.

Made by [Matthew Truth](https://truthofmatthew.com).

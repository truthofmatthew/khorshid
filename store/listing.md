# Chrome Web Store listing

Paste into the developer console for item `dhkfoinnpjgabapcgjkmjophfincioij` (update the existing item; a new item would lose the current users and reviews).

**Name** (from manifest): Khorshid: Persian Tools for Notion · تاریخ شمسی نوشن

**Summary** (from manifest description, 132 max):
تاریخ شمسی، فونت فارسی و راست‌چین در نوشن و هر سایتی. Jalali dates, Persian fonts and typing fixes for Notion and the web.

**Category:** Productivity · Workflow & planning

**Language:** Persian (primary), English

**Homepage:** https://truthofmatthew.com/projects/khorshid/fa/
**Support:** https://github.com/truthofmatthew/khorshid/issues
**Privacy policy:** https://truthofmatthew.com/projects/khorshid/privacy/

**Images:** `store/out/1-dates.png` … `5-writing.png` (1280×800), small promo tile `store/out/promo-440x280.png`, icon `public/icons/icon128.png`.

## Description

نوشن تاریخ شمسی بلد نبود، خورشید یادش داد.

• تاریخ شمسی همه‌جای نوشن: جدول‌ها، ویژگی‌های صفحه، @تاریخ‌ها، بازه‌ها و ساعت‌ها. حتی Today می‌شه «امروز».
• نمای تقویم نوشن با ماه‌های شمسی، اسم روزهای هفته و شماره‌ی روزها. دیگه لازم نیست تو ذهنت حساب کنی.
• تاریخ رو شمسی تایپ کن: تو کادر تاریخ نوشن بنویس ۱۴۰۵/۸/۱۱ و Enter بزن، نوشن همون روز رو ثبت می‌کنه.
• فونت فارسی: وزیرمتن، استعداد، ساحل، شبنم، صمیم یا پرستو. فقط حروف فارسی عوض می‌شن، انگلیسی‌ها دست نمی‌خورن.
• راست‌چین خودکار: هر پاراگراف، سلول و کارت خودش می‌فهمه فارسیه یا انگلیسی.
• کیبورد اشتباهی بود؟ متن رو انتخاب کن و Alt+Shift+L بزن، «sghl» می‌شه «سلام». تو هر سایتی.
• Alt+Shift+P هم «ي» و «ك» عربی رو درست می‌کنه و نیم‌فاصله می‌ذاره.
• تو ChatGPT، جیمیل، اسلک یا هر سایت دیگه هم فونت و راست‌چین رو روشن کن، فقط برای همون سایت.
• تقویم شمسی مجانی برای وسط صفحه‌ی نوشن: ماه، امروز، هفته و شمارش معکوس تا نوروز.

هیچ اطلاعاتی ازت جمع نمی‌کنه و هیچی تو صفحه‌های نوشنت ذخیره نمی‌کنه. مجانی و متن‌بازه.

—

Notion didn't know the Persian calendar. Khorshid taught it.

• Jalali (Shamsi) dates all over Notion: tables, properties, @date mentions, ranges and times. Even "Today" turns into «امروز».
• Calendar views in Jalali months, with Persian weekday names. No more mental math.
• Type a Jalali date (1405/8/11) in any Notion date field and Notion saves the right day.
• Six Persian fonts that only touch Persian letters.
• Every paragraph, cell and card picks its own direction: right-to-left or left-to-right.
• Typed Persian on an English keyboard? Alt+Shift+L fixes it on any site. Alt+Shift+P fixes Arabic ي/ك and half-spaces.
• Turn fonts and direction on for any other site, one site at a time.
• Free Persian calendars to embed in Notion, Obsidian and websites, including a countdown to Nowruz.

It collects nothing about you and never writes to your Notion pages. Free and open source.

## Permission justifications (for the review form)

- **storage:** saves the user's settings.
- **activeTab, scripting:** runs the typing fixer on the current page when the user presses the shortcut or picks it from the right-click menu, and applies fonts on sites the user turns on.
- **contextMenus:** adds the two typing-fix items to the right-click menu.
- **Host notion.so:** shows Jalali dates and Persian fonts in Notion.
- **Optional host permissions (https://*/*):** requested one site at a time, only when the user turns the extension on for that site.

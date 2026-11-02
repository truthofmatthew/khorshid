// Fixed solar-calendar holidays and occasions, keyed "month-day".
// shortcut: lunar (Hijri) holidays move every year and Iran sets them by moon sighting, so they
// are not listed; add a yearly table from the official calendar when someone asks for them.
export const OCCASIONS: Record<string, { name: string; off: boolean }> = {
  '1-1': { name: 'نوروز', off: true },
  '1-2': { name: 'نوروز', off: true },
  '1-3': { name: 'نوروز', off: true },
  '1-4': { name: 'نوروز', off: true },
  '1-12': { name: 'روز جمهوری اسلامی', off: true },
  '1-13': { name: 'روز طبیعت', off: true },
  '3-14': { name: 'رحلت امام خمینی', off: true },
  '3-15': { name: 'قیام ۱۵ خرداد', off: true },
  '9-30': { name: 'شب یلدا', off: false },
  '11-22': { name: 'پیروزی انقلاب', off: true },
  '12-29': { name: 'ملی شدن صنعت نفت', off: true },
};

export const occasion = (m: number, d: number) => OCCASIONS[`${m}-${d}`];

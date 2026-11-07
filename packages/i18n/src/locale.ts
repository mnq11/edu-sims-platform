import { BUILTIN_DICTIONARIES, type Dictionary, type Locale } from './dictionaries.js';

export type Direction = 'rtl' | 'ltr';

const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur']);
const dictionaries = new Map<Locale, Dictionary>(Object.entries(BUILTIN_DICTIONARIES));

/** اللغة الاحتياطية عند غياب مفتاح في اللغة النشطة — العربية هي المرجع. */
const FALLBACK_LOCALE: Locale = 'ar';

let activeLocale: Locale = FALLBACK_LOCALE;

const localeListeners = new Set<(locale: Locale) => void>();

/** يسجل قاموس لغة جديد أو يدمجه مع الموجود — للمساهمين والمترجمين. */
export function registerDictionary(locale: Locale, entries: Dictionary): void {
  dictionaries.set(locale, { ...dictionaries.get(locale), ...entries });
}

export function getAvailableLocales(): readonly Locale[] {
  return [...dictionaries.keys()];
}

export function setLocale(locale: Locale): void {
  if (!dictionaries.has(locale)) throw new Error(`لغة غير مسجلة: ${locale}`);
  if (locale === activeLocale) return;
  activeLocale = locale;
  for (const listener of [...localeListeners]) listener(locale);
}

export function getLocale(): Locale {
  return activeLocale;
}

/** اتجاه اللغة النشطة — العربية أولاً: RTL هو الأصل وليس الاستثناء. */
export function getDirection(): Direction {
  return RTL_LOCALES.has(activeLocale) ? 'rtl' : 'ltr';
}

/** اشترك بتغيّر اللغة (لإعادة رسم الواجهة). يعيد دالة إلغاء الاشتراك. */
export function onLocaleChange(listener: (locale: Locale) => void): () => void {
  localeListeners.add(listener);
  return () => localeListeners.delete(listener);
}

/**
 * يترجم مفتاحاً مع استيفاء معاملات {name}. الأولوية:
 * اللغة النشطة ← العربية (المرجع) ← المفتاح نفسه (يظهر في التطوير ليكتشف النقص).
 */
export function t(key: string, params: Record<string, string | number> = {}): string {
  const template =
    dictionaries.get(activeLocale)?.[key] ??
    dictionaries.get(FALLBACK_LOCALE)?.[key] ??
    key;
  return template.replaceAll(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

import { useEffect, useState } from 'react';

import { CLINIC_PHONE, localePath, locales, type Locale } from './clinic';

export { CLINIC_EMAIL, CLINIC_INSTAGRAM, CLINIC_MAP, CLINIC_PHONE, locales, type Locale } from './clinic';

export const whatsappLink = (text: string) => `${CLINIC_PHONE.whatsapp}?text=${encodeURIComponent(text)}`;
// Displayed number, wrapped in a left-to-right isolate so Arabic text doesn't reverse the digit groups.
export const phoneText = `\u2066${CLINIC_PHONE.display}\u2069`;
export const withPhone = (text: string) => text.replace(/\{phone\}/g, phoneText);

export type LegalPageKey = 'privacy' | 'legal';
const legalSlugs: Record<LegalPageKey, string> = {
  privacy: 'confidentialite',
  legal: 'mentions-legales',
};
// Home page of each language: / (English), /fr/, /ar/.
export const homeHref = (locale: Locale) => `${import.meta.env.BASE_URL}${localePath(locale)}`;
export const legalHref = (page: LegalPageKey) => `${import.meta.env.BASE_URL}${legalSlugs[page]}`;

export function legalPageFromLocation(): LegalPageKey | null {
  const slug = window.location.pathname.slice(import.meta.env.BASE_URL.length).replace(/\/+$/, '');
  return (Object.keys(legalSlugs) as LegalPageKey[]).find((page) => legalSlugs[page] === slug) ?? null;
}

const isLocale = (value: string | null | undefined): value is Locale => locales.includes(value as Locale);

// Language in the address: /fr/ and /ar/ for the home page, or ?lang= (older links).
function localeFromUrl(): Locale | null {
  const queryLocale = new URLSearchParams(window.location.search).get('lang');
  if (isLocale(queryLocale)) return queryLocale;
  const folder = window.location.pathname.slice(import.meta.env.BASE_URL.length).split('/')[0];
  return isLocale(folder) && folder !== 'en' ? folder : null;
}

// The home page shows the language of its address (/ is English). The legal pages have one
// address for all languages, so they use the language picked earlier in the visit (sessionStorage).
function initialLocale(home: boolean): Locale {
  const urlLocale = localeFromUrl();
  if (urlLocale || home) return urlLocale ?? 'en';
  let savedLocale: string | null = null;
  try { savedLocale = window.sessionStorage.getItem('nama-locale'); } catch { /* storage blocked */ }
  return isLocale(savedLocale) ? savedLocale : 'en';
}

// Current language, remembered for the rest of the visit; keeps <html lang/dir> in sync.
// On the home page it also keeps the address on that language's page (/, /fr/, /ar/).
export function useLocale({ home = false } = {}) {
  const [locale, setLocale] = useState<Locale>(() => initialLocale(home));
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    try { window.sessionStorage.setItem('nama-locale', locale); } catch { /* storage blocked */ }
    if (home && window.location.pathname + window.location.search !== homeHref(locale)) {
      window.history.replaceState(null, '', homeHref(locale) + window.location.hash);
    }
  }, [locale, home]);
  return [locale, setLocale] as const;
}

import { useEffect, useState } from 'react';

export type Locale = 'fr' | 'en' | 'ar';
export const locales: Locale[] = ['fr', 'en', 'ar'];

// The clinic's only phone number: used for calls, WhatsApp and display text.
export const CLINIC_PHONE = {
  display: '78 87 68 25',
  tel: 'tel:+96178876825',
  whatsapp: 'https://wa.me/96178876825',
};
export const CLINIC_EMAIL = 'namapolyclinic@gmail.com';
export const whatsappLink = (text: string) => `${CLINIC_PHONE.whatsapp}?text=${encodeURIComponent(text)}`;
// Displayed number, wrapped in a left-to-right isolate so Arabic text doesn't reverse the digit groups.
export const phoneText = `\u2066${CLINIC_PHONE.display}\u2069`;
export const withPhone = (text: string) => text.replace(/\{phone\}/g, phoneText);

export type LegalPageKey = 'privacy' | 'legal';
const legalSlugs: Record<LegalPageKey, string> = {
  privacy: 'confidentialite',
  legal: 'mentions-legales',
};
export const homeHref = import.meta.env.BASE_URL;
export const legalHref = (page: LegalPageKey) => `${import.meta.env.BASE_URL}${legalSlugs[page]}`;

export function legalPageFromLocation(): LegalPageKey | null {
  const slug = window.location.pathname.slice(import.meta.env.BASE_URL.length).replace(/\/+$/, '');
  return (Object.keys(legalSlugs) as LegalPageKey[]).find((page) => legalSlugs[page] === slug) ?? null;
}

// Every visit starts in English (or the ?lang= in the link). A language picked on the
// switcher is kept only for the rest of the visit (sessionStorage), e.g. on the legal pages.
function initialLocale(): Locale {
  const queryLocale = new URLSearchParams(window.location.search).get('lang');
  if (queryLocale === 'fr' || queryLocale === 'en' || queryLocale === 'ar') return queryLocale;
  let savedLocale: string | null = null;
  try { savedLocale = window.sessionStorage.getItem('nama-locale'); } catch { /* storage blocked */ }
  return savedLocale === 'fr' || savedLocale === 'ar' ? savedLocale : 'en';
}

// Current language, remembered for the rest of the visit; keeps <html lang/dir> in sync.
export function useLocale() {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    try { window.sessionStorage.setItem('nama-locale', locale); } catch { /* storage blocked */ }
  }, [locale]);
  return [locale, setLocale] as const;
}

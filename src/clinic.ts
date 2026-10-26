// Clinic facts and search-engine text, shared by the site and the build (vite.config.ts).
// Plain data only: no React and no import.meta.env, so the build can import it.

export type Locale = 'fr' | 'en' | 'ar';
export const locales: Locale[] = ['fr', 'en', 'ar'];
// English is the home page (/); the other languages have their own folder.
export const localePath = (locale: Locale) => (locale === 'en' ? '' : `${locale}/`);
export const ogLocales: Record<Locale, string> = { fr: 'fr_LB', en: 'en_US', ar: 'ar_LB' };

// The clinic's only phone number: used for calls, WhatsApp and display text.
export const CLINIC_PHONE = {
  display: '78 87 68 25',
  tel: 'tel:+96178876825',
  whatsapp: 'https://wa.me/96178876825',
};
export const CLINIC_EMAIL = 'namapolyclinic@gmail.com';
export const CLINIC_INSTAGRAM = 'https://www.instagram.com/namapolyclinic';
export const CLINIC_MAP = 'https://maps.google.com/?q=WH5P%2B62F%20Jal%20El%20Dib%20Lebanon';

// Title and description of each language's home page, shown in search results.
export const pageMeta: Record<Locale, { title: string; description: string; imageAlt: string }> = {
  fr: {
    title: 'NAMA Polyclinic Jal El Dib | Psychologue, Orthophoniste, Diététicienne',
    description: 'Psychologues, orthophonistes, psychomotricité, diététique, physiothérapie et psychiatrie à Jal El Dib (Metn), près de Beyrouth. Pour enfants, ados et adultes.',
    imageAlt: 'Logo de NAMA Polyclinic',
  },
  en: {
    title: 'NAMA Polyclinic Jal El Dib | Psychologist, Speech Therapy, Dietitian',
    description: 'Psychologists, speech therapists, psychomotor therapy, dietetics, physiotherapy and psychiatry in Jal El Dib, Metn, near Beirut. For children, teens and adults.',
    imageAlt: 'NAMA Polyclinic logo',
  },
  ar: {
    title: 'عيادة ناما جل الديب | اختصاصي نفسي، علاج النطق، اختصاصية تغذية',
    description: 'اختصاصيون في علم النفس وعلاج النطق واللغة والعلاج النفسي الحركي والتغذية والعلاج الفيزيائي والطب النفسي في جل الديب، المتن، قرب بيروت. للأطفال والبالغين.',
    imageAlt: 'شعار عيادة ناما',
  },
};

// schema.org MedicalClinic: lets Google show the address, hours and phone in results.
// `origin` is the site address without a trailing slash, or '' when it is not known.
export function clinicStructuredData(locale: Locale, origin: string) {
  const site = origin ? `${origin}/` : '';
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    ...(site && { '@id': `${site}#clinic`, url: `${site}${localePath(locale)}`, logo: `${site}icon-512.png`, image: `${site}og-image.png` }),
    name: 'NAMA Polyclinic',
    alternateName: ['NAMA', 'عيادة ناما'],
    description: pageMeta[locale].description,
    telephone: '+961 78 87 68 25',
    email: CLINIC_EMAIL,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'WH5P+62F',
      addressLocality: 'Jal El Dib',
      addressRegion: 'Metn, Mount Lebanon',
      addressCountry: 'LB',
    },
    // Centre of the plus code WH5P+62F.
    geo: { '@type': 'GeoCoordinates', latitude: 33.908062, longitude: 35.585047 },
    hasMap: CLINIC_MAP,
    // Keep in sync with the hours shown on the page (`location` in src/App.tsx).
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:00',
      closes: '20:00',
    }],
    medicalSpecialty: ['SpeechPathology', 'Psychiatric', 'Physiotherapy', 'DietNutrition'],
    availableService: ['Speech therapy', 'Psychology', 'Psychomotor therapy', 'Dietetics and nutrition', 'Physiotherapy', 'Neuro-Linguistic Programming (NLP)', 'Psychiatry', 'Special education']
      .map((name) => ({ '@type': 'MedicalTherapy', name })),
    areaServed: [
      { '@type': 'Place', name: 'Jal El Dib' },
      { '@type': 'AdministrativeArea', name: 'Metn' },
      { '@type': 'City', name: 'Beirut' },
      { '@type': 'Country', name: 'Lebanon' },
    ],
    availableLanguage: ['French', 'English', 'Arabic'],
    sameAs: [CLINIC_INSTAGRAM],
  };
}

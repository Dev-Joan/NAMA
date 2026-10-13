import { useEffect, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

import topLogo from './assets/nama-top-logo.png';
import { CLINIC_EMAIL, homeHref, legalHref, locales, useLocale, withPhone, type LegalPageKey, type Locale } from './site';

// Text conventions in this file:
//   [[...]]    something the clinic must confirm before launch; shown highlighted on the page
//   {phone}    the clinic phone number (CLINIC_PHONE)
//   {privacy}  a link to the privacy policy
//   {email}    the clinic email address, as a mailto link

interface LegalSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
}

interface LegalDocument {
  title: string;
  intro: string;
  sections: LegalSection[];
}

interface LegalCopy {
  languageLabel: string;
  logoAlt: string;
  back: string;
  updated: string;
  updatedDate: string;
  confirm: string;
  privacyLink: string;
  rights: string;
  documents: Record<LegalPageKey, LegalDocument>;
}

const legalCopy: Record<Locale, LegalCopy> = {
  fr: {
    languageLabel: 'Langue du site',
    logoAlt: 'NAMA Polyclinic, retour à l’accueil',
    back: 'Retour au site',
    updated: 'Dernière mise à jour :',
    updatedDate: '13 octobre 2026',
    confirm: 'À confirmer :',
    privacyLink: 'politique de confidentialité',
    rights: 'Tous droits réservés.',
    documents: {
      privacy: {
        title: 'Politique de confidentialité',
        intro: 'Cette page explique quelles informations vous nous confiez lorsque vous utilisez le site de NAMA Polyclinic, et ce que nous en faisons.',
        sections: [
          {
            heading: 'Qui est responsable de vos informations ?',
            paragraphs: [
              'NAMA Polyclinic, WH5P+62F, Jal El Dib, Liban, est responsable des informations que vous lui transmettez. [[Raison sociale exacte de la clinique]]',
              'Pour toute question : {phone}, par téléphone ou WhatsApp, ou par e-mail à {email}.',
            ],
          },
          {
            heading: 'Ce que vous nous transmettez par le formulaire',
            list: [
              'votre nom ;',
              'votre numéro de téléphone ;',
              'la spécialité que vous recherchez ;',
              'votre message, si vous en écrivez un.',
            ],
            paragraphs: [
              'La spécialité et votre message peuvent révéler des informations sur votre santé ou celle d’un proche. Ce sont des informations sensibles : écrivez seulement ce qui est utile pour une première prise de contact. Nous parlerons du reste en consultation.',
            ],
          },
          {
            heading: 'Comment le formulaire fonctionne',
            paragraphs: [
              'Ce site ne conserve pas vos réponses, et elles ne sont enregistrées dans aucune de nos bases de données.',
              'Lorsque vous appuyez sur « Envoyer », votre message est transmis à Web3Forms, un service d’envoi de formulaires, qui l’envoie par e-mail à la clinique. [[Vérifier la politique de conservation des données de Web3Forms (web3forms.com/privacy)]]',
              'Vous pouvez aussi nous écrire directement avec le bouton WhatsApp. Dans ce cas, votre message passe par WhatsApp, un service de Meta, et arrive sur le compte WhatsApp de la clinique ({phone}). WhatsApp chiffre les messages de bout en bout. Son utilisation est soumise aux conditions et à la politique de confidentialité de WhatsApp.',
            ],
          },
          {
            heading: 'Pourquoi nous utilisons vos informations',
            paragraphs: [
              'Uniquement pour vous répondre, vous orienter vers le bon professionnel et organiser un rendez-vous. Nous ne les utilisons pas pour de la publicité et ne les vendons à personne.',
            ],
          },
          {
            heading: 'Qui y a accès',
            paragraphs: [
              'Les messages arrivent dans la boîte e-mail de la clinique, et sur son compte WhatsApp si vous l’utilisez. [[Qui a accès à la boîte e-mail et au compte WhatsApp : accueil, praticiens, autres]]',
              'Vos informations ne sont transmises à un praticien de NAMA que si cela est nécessaire pour vous répondre ou vous prendre en charge.',
            ],
          },
          {
            heading: 'Combien de temps nous les gardons',
            paragraphs: [
              'Vos messages restent dans la boîte e-mail de la clinique, et dans son WhatsApp si vous l’avez utilisé, [[pendant combien de temps, et quand les messages et conversations sont supprimés]].',
              'Si vous devenez patient, votre dossier de soins est tenu séparément, selon les règles qui s’appliquent aux dossiers médicaux.',
            ],
          },
          {
            heading: 'Vos droits',
            paragraphs: [
              'Vous pouvez à tout moment demander à consulter, corriger ou supprimer les informations que vous nous avez envoyées, en nous contactant au {phone}. Vous pouvez aussi supprimer la conversation de votre côté dans WhatsApp.',
              'Nous traitons vos informations conformément à la loi libanaise n° 81 du 10 octobre 2018 relative aux transactions électroniques et aux données à caractère personnel. [[À faire vérifier par un conseiller juridique]]',
            ],
          },
          {
            heading: 'Ce que le site enregistre d’autre',
            list: [
              'Votre choix de langue est enregistré dans votre navigateur pour être retenu à votre prochaine visite. Il ne nous est pas transmis.',
              'La carte est fournie par Google Maps. En l’affichant, votre navigateur se connecte à Google, qui peut collecter des données selon sa propre politique de confidentialité.',
              'Les polices de caractères sont chargées depuis Google Fonts, ce qui transmet votre adresse IP à Google.',
              'L’hébergeur du site peut enregistrer des données techniques, comme votre adresse IP et les pages consultées, pour faire fonctionner et sécuriser le site. [[Nom de l’hébergeur]]',
              'Le site n’utilise aucun outil de statistiques ni de publicité.',
            ],
          },
          {
            heading: 'Modifications',
            paragraphs: [
              'Nous pouvons mettre à jour cette politique. La date de la dernière mise à jour figure en haut de cette page.',
            ],
          },
        ],
      },
      legal: {
        title: 'Mentions légales',
        intro: 'Informations sur l’éditeur du site de NAMA Polyclinic et sur son utilisation.',
        sections: [
          {
            heading: 'Éditeur du site',
            paragraphs: [
              'NAMA Polyclinic. [[Raison sociale et forme juridique]]',
              'Adresse : WH5P+62F, Jal El Dib, Liban. Téléphone : {phone}. E-mail : {email}.',
              '[[Numéro d’immatriculation au registre du commerce et autorisation du ministère de la Santé publique, le cas échéant]]',
            ],
          },
          {
            heading: 'Responsable de la publication',
            paragraphs: ['[[Nom de la personne responsable du contenu du site]]'],
          },
          {
            heading: 'Hébergement',
            paragraphs: ['[[Nom et adresse de l’hébergeur. Le site est actuellement prévu sur Replit (replit.com)]]'],
          },
          {
            heading: 'Professionnels de santé',
            paragraphs: [
              'Les professionnels présentés sur ce site exercent sous leur propre titre professionnel. [[Ordre ou syndicat auprès duquel chaque praticien est inscrit]]',
            ],
          },
          {
            heading: 'Information médicale',
            paragraphs: [
              'Les informations de ce site sont générales. Elles ne remplacent ni une consultation, ni un diagnostic, ni un avis adapté à votre situation.',
              'Ce site, le formulaire et WhatsApp ne sont pas des services d’urgence. En cas d’urgence, appelez le 140 (Croix-Rouge libanaise) ou rendez-vous aux urgences les plus proches.',
            ],
          },
          {
            heading: 'Propriété intellectuelle',
            paragraphs: [
              'Le nom NAMA, le logo et les contenus de ce site appartiennent à NAMA Polyclinic. Toute reproduction sans autorisation est interdite. [[Confirmer que la clinique détient les droits sur le logo et les textes]]',
            ],
          },
          {
            heading: 'Liens externes',
            paragraphs: [
              'Le site renvoie vers WhatsApp, Instagram et Google Maps. NAMA n’est pas responsable du contenu ni des pratiques de ces services.',
            ],
          },
          {
            heading: 'Données personnelles',
            paragraphs: ['Pour savoir comment vos informations sont traitées, consultez notre {privacy}.'],
          },
        ],
      },
    },
  },
  en: {
    languageLabel: 'Website language',
    logoAlt: 'NAMA Polyclinic, back to home',
    back: 'Back to website',
    updated: 'Last updated:',
    updatedDate: '13 October 2026',
    confirm: 'To confirm:',
    privacyLink: 'privacy policy',
    rights: 'All rights reserved.',
    documents: {
      privacy: {
        title: 'Privacy policy',
        intro: 'This page explains what information you share with us when you use the NAMA Polyclinic website, and what we do with it.',
        sections: [
          {
            heading: 'Who is responsible for your information?',
            paragraphs: [
              'NAMA Polyclinic, WH5P+62F, Jal El Dib, Lebanon, is responsible for the information you send to it. [[Exact legal name of the clinic]]',
              'For any question: {phone}, by phone or WhatsApp, or by email at {email}.',
            ],
          },
          {
            heading: 'What you send us through the form',
            list: [
              'your name;',
              'your phone number;',
              'the specialty you are looking for;',
              'your message, if you write one.',
            ],
            paragraphs: [
              'The specialty and your message may reveal information about your health or that of someone close to you. This is sensitive information: only write what is useful for a first contact. We will talk about the rest during the consultation.',
            ],
          },
          {
            heading: 'How the form works',
            paragraphs: [
              'This website does not keep your answers, and they are not stored in any database of ours.',
              'When you tap “Send”, your message is passed to Web3Forms, a form-delivery service, which emails it to the clinic. [[Check Web3Forms’ data retention policy (web3forms.com/privacy)]]',
              'You can also message us directly with the WhatsApp button. In that case your message goes through WhatsApp, a Meta service, and arrives in the clinic’s WhatsApp account ({phone}). WhatsApp encrypts messages end to end. Its use is subject to WhatsApp’s terms and privacy policy.',
            ],
          },
          {
            heading: 'Why we use your information',
            paragraphs: [
              'Only to reply to you, direct you to the right professional and arrange an appointment. We do not use it for advertising and we do not sell it to anyone.',
            ],
          },
          {
            heading: 'Who can see it',
            paragraphs: [
              'Messages arrive in the clinic’s email inbox, and in its WhatsApp account if you use it. [[Who has access to the inbox and the WhatsApp account: reception, practitioners, others]]',
              'Your information is only shared with a NAMA practitioner when this is needed to reply to you or care for you.',
            ],
          },
          {
            heading: 'How long we keep it',
            paragraphs: [
              'Your messages stay in the clinic’s email inbox, and in its WhatsApp if you used it, [[for how long, and when messages and conversations are deleted]].',
              'If you become a patient, your care record is kept separately, under the rules that apply to medical records.',
            ],
          },
          {
            heading: 'Your rights',
            paragraphs: [
              'At any time, you can ask to see, correct or delete the information you sent us by contacting us on {phone}. You can also delete the conversation on your side in WhatsApp.',
              'We handle your information in line with Lebanese Law No. 81 of 10 October 2018 on Electronic Transactions and Personal Data. [[To be checked by a legal adviser]]',
            ],
          },
          {
            heading: 'What else the website records',
            list: [
              'Your language choice is saved in your browser so it is remembered on your next visit. It is not sent to us.',
              'The map is provided by Google Maps. When it is displayed, your browser connects to Google, which may collect data under its own privacy policy.',
              'Fonts are loaded from Google Fonts, which sends your IP address to Google.',
              'The website host may record technical data, such as your IP address and the pages you visit, to run and secure the website. [[Name of the host]]',
              'The website does not use any analytics or advertising tools.',
            ],
          },
          {
            heading: 'Changes',
            paragraphs: [
              'We may update this policy. The date of the last update is shown at the top of this page.',
            ],
          },
        ],
      },
      legal: {
        title: 'Legal notice',
        intro: 'Information about the publisher of the NAMA Polyclinic website and about its use.',
        sections: [
          {
            heading: 'Website publisher',
            paragraphs: [
              'NAMA Polyclinic. [[Legal name and legal form]]',
              'Address: WH5P+62F, Jal El Dib, Lebanon. Phone: {phone}. Email: {email}.',
              '[[Commercial register number and Ministry of Public Health authorisation, if applicable]]',
            ],
          },
          {
            heading: 'Person responsible for the content',
            paragraphs: ['[[Name of the person responsible for the website content]]'],
          },
          {
            heading: 'Hosting',
            paragraphs: ['[[Name and address of the host. The website is currently planned to run on Replit (replit.com)]]'],
          },
          {
            heading: 'Healthcare professionals',
            paragraphs: [
              'The professionals presented on this website practise under their own professional titles. [[Order or syndicate each practitioner is registered with]]',
            ],
          },
          {
            heading: 'Medical information',
            paragraphs: [
              'The information on this website is general. It does not replace a consultation, a diagnosis or advice suited to your situation.',
              'This website, the form and WhatsApp are not emergency services. In an emergency, call 140 (Lebanese Red Cross) or go to the nearest emergency department.',
            ],
          },
          {
            heading: 'Intellectual property',
            paragraphs: [
              'The NAMA name, logo and the content of this website belong to NAMA Polyclinic. Any reproduction without permission is prohibited. [[Confirm that the clinic owns the rights to the logo and texts]]',
            ],
          },
          {
            heading: 'External links',
            paragraphs: [
              'The website links to WhatsApp, Instagram and Google Maps. NAMA is not responsible for the content or practices of these services.',
            ],
          },
          {
            heading: 'Personal data',
            paragraphs: ['To learn how your information is handled, read our {privacy}.'],
          },
        ],
      },
    },
  },
  ar: {
    languageLabel: 'لغة الموقع',
    logoAlt: 'عيادة ناما، العودة إلى الصفحة الرئيسية',
    back: 'العودة إلى الموقع',
    updated: 'آخر تحديث:',
    updatedDate: '13 تشرين الأول 2026',
    confirm: 'يُرجى التأكيد:',
    privacyLink: 'سياسة الخصوصية',
    rights: 'جميع الحقوق محفوظة.',
    documents: {
      privacy: {
        title: 'سياسة الخصوصية',
        intro: 'توضح هذه الصفحة المعلومات التي تشاركونها معنا عند استخدام موقع عيادة ناما، وما نفعله بها.',
        sections: [
          {
            heading: 'من المسؤول عن معلوماتكم؟',
            paragraphs: [
              'عيادة ناما، WH5P+62F، جل الديب، لبنان، هي المسؤولة عن المعلومات التي ترسلونها إليها. [[الاسم القانوني الدقيق للعيادة]]',
              'لأي سؤال: {phone}، عبر الهاتف أو واتساب، أو عبر البريد الإلكتروني {email}.',
            ],
          },
          {
            heading: 'ما ترسلونه إلينا عبر النموذج',
            list: [
              'اسمكم؛',
              'رقم هاتفكم؛',
              'الاختصاص الذي تبحثون عنه؛',
              'رسالتكم، إن كتبتم واحدة.',
            ],
            paragraphs: [
              'قد يكشف الاختصاص ورسالتكم معلومات عن صحتكم أو صحة أحد المقرّبين منكم. هذه معلومات حساسة: اكتبوا فقط ما يفيد في التواصل الأول، وسنتحدث عن الباقي خلال الاستشارة.',
            ],
          },
          {
            heading: 'كيف يعمل النموذج',
            paragraphs: [
              'لا يحفظ هذا الموقع إجاباتكم، ولا تُخزَّن في أي قاعدة بيانات تابعة لنا.',
              'عند الضغط على «إرسال»، تُنقَل رسالتكم عبر Web3Forms، وهي خدمة لإرسال النماذج، ثم تصل بالبريد الإلكتروني إلى العيادة. [[التأكد من سياسة Web3Forms بشأن الاحتفاظ بالبيانات (web3forms.com/privacy)]]',
              'يمكنكم أيضاً مراسلتنا مباشرةً عبر زر واتساب. في هذه الحالة، تمرّ رسالتكم عبر واتساب، وهو خدمة تابعة لشركة Meta، وتصل إلى حساب واتساب الخاص بالعيادة ({phone}). يشفّر واتساب الرسائل تشفيراً تامّاً بين الطرفين، ويخضع استخدامه لشروط واتساب وسياسة الخصوصية الخاصة به.',
            ],
          },
          {
            heading: 'لماذا نستخدم معلوماتكم',
            paragraphs: [
              'فقط للرد عليكم، وتوجيهكم إلى الاختصاصي المناسب، وتحديد موعد. لا نستخدمها لأغراض إعلانية ولا نبيعها لأي جهة.',
            ],
          },
          {
            heading: 'من يمكنه الاطلاع عليها',
            paragraphs: [
              'تصل الرسائل إلى البريد الإلكتروني للعيادة، وإلى حساب واتساب الخاص بها إذا استخدمتموه. [[من يمكنه الوصول إلى البريد الإلكتروني وحساب واتساب: الاستقبال، الاختصاصيون، غيرهم]]',
              'لا نشارك معلوماتكم مع أحد اختصاصيي ناما إلا عند الحاجة إلى ذلك للرد عليكم أو لرعايتكم.',
            ],
          },
          {
            heading: 'مدة الاحتفاظ بها',
            paragraphs: [
              'تبقى رسائلكم في البريد الإلكتروني للعيادة، وفي حساب واتساب الخاص بها إذا استخدمتموه [[لأي مدة، ومتى تُحذَف الرسائل والمحادثات]].',
              'إذا أصبحتم من مرضى العيادة، يُحفَظ ملفكم العلاجي بشكل منفصل، وفق القواعد المطبّقة على الملفات الطبية.',
            ],
          },
          {
            heading: 'حقوقكم',
            paragraphs: [
              'يمكنكم في أي وقت طلب الاطلاع على المعلومات التي أرسلتموها إلينا أو تصحيحها أو حذفها، عبر التواصل معنا على {phone}. ويمكنكم أيضاً حذف المحادثة من جهتكم في واتساب.',
              'نعالج معلوماتكم وفقاً للقانون اللبناني رقم 81 الصادر في 10 تشرين الأول 2018 المتعلق بالمعاملات الإلكترونية والبيانات ذات الطابع الشخصي. [[يجب أن يراجعه مستشار قانوني]]',
            ],
          },
          {
            heading: 'ما يسجّله الموقع أيضاً',
            list: [
              'يُحفَظ اختياركم للغة في متصفحكم ليتذكّره الموقع في زيارتكم المقبلة، ولا يُرسَل إلينا.',
              'تُعرَض الخريطة عبر خرائط Google. عند عرضها، يتصل متصفحكم بشركة Google التي قد تجمع بيانات وفق سياسة الخصوصية الخاصة بها.',
              'تُحمَّل الخطوط من Google Fonts، ما يرسل عنوان IP الخاص بكم إلى Google.',
              'قد تسجّل الجهة المستضيفة للموقع بيانات تقنية، مثل عنوان IP والصفحات التي تزورونها، لتشغيل الموقع وحمايته. [[اسم الجهة المستضيفة]]',
              'لا يستخدم الموقع أي أدوات إحصاء أو إعلان.',
            ],
          },
          {
            heading: 'التعديلات',
            paragraphs: [
              'قد نحدّث هذه السياسة. يظهر تاريخ آخر تحديث في أعلى هذه الصفحة.',
            ],
          },
        ],
      },
      legal: {
        title: 'إشعار قانوني',
        intro: 'معلومات عن الجهة الناشرة لموقع عيادة ناما وعن استخدامه.',
        sections: [
          {
            heading: 'ناشر الموقع',
            paragraphs: [
              'عيادة ناما. [[الاسم القانوني والشكل القانوني]]',
              'العنوان: WH5P+62F، جل الديب، لبنان. الهاتف: {phone}. البريد الإلكتروني: {email}.',
              '[[رقم التسجيل في السجل التجاري وترخيص وزارة الصحة العامة، إن وُجد]]',
            ],
          },
          {
            heading: 'المسؤول عن المحتوى',
            paragraphs: ['[[اسم الشخص المسؤول عن محتوى الموقع]]'],
          },
          {
            heading: 'الاستضافة',
            paragraphs: ['[[اسم الجهة المستضيفة وعنوانها. يُخطَّط حالياً لاستضافة الموقع على Replit (replit.com)]]'],
          },
          {
            heading: 'الاختصاصيون الصحيون',
            paragraphs: [
              'يمارس الاختصاصيون المعروضون على هذا الموقع مهنتهم بصفتهم المهنية الخاصة. [[النقابة أو الهيئة المسجَّل فيها كل اختصاصي]]',
            ],
          },
          {
            heading: 'المعلومات الطبية',
            paragraphs: [
              'المعلومات الواردة على هذا الموقع عامة، ولا تحلّ محلّ الاستشارة أو التشخيص أو النصيحة الملائمة لوضعكم.',
              'هذا الموقع والنموذج وواتساب ليست خدمات طوارئ. في حالة الطوارئ، اتصلوا بالرقم 140 (الصليب الأحمر اللبناني) أو توجّهوا إلى أقرب قسم طوارئ.',
            ],
          },
          {
            heading: 'الملكية الفكرية',
            paragraphs: [
              'اسم ناما وشعارها ومحتوى هذا الموقع ملك لعيادة ناما. يُمنَع أي نسخ من دون إذن. [[تأكيد أن العيادة تملك حقوق الشعار والنصوص]]',
            ],
          },
          {
            heading: 'الروابط الخارجية',
            paragraphs: [
              'يتضمن الموقع روابط إلى واتساب وإنستغرام وخرائط Google. ناما غير مسؤولة عن محتوى هذه الخدمات أو ممارساتها.',
            ],
          },
          {
            heading: 'البيانات الشخصية',
            paragraphs: ['لمعرفة كيفية معالجة معلوماتكم، راجعوا {privacy}.'],
          },
        ],
      },
    },
  },
};

function RichText({ text, copy }: { text: string; copy: LegalCopy }) {
  const parts = withPhone(text).split(/(\[\[[^\]]+\]\]|\{privacy\}|\{email\})/);
  const nodes: ReactNode[] = parts.map((part, index) => {
    if (part === '{privacy}') return <a key={index} href={legalHref('privacy')}>{copy.privacyLink}</a>;
    if (part === '{email}') return <a key={index} href={`mailto:${CLINIC_EMAIL}`} dir="ltr">{CLINIC_EMAIL}</a>;
    if (part.startsWith('[[')) {
      return <mark key={index} className="to-confirm"><strong>{copy.confirm}</strong> {part.slice(2, -2)}</mark>;
    }
    return part;
  });
  return <>{nodes}</>;
}

export function LegalPage({ page }: { page: LegalPageKey }) {
  const [locale, setLocale] = useLocale();
  const copy = legalCopy[locale];
  const document_ = copy.documents[page];
  const otherPage: LegalPageKey = page === 'privacy' ? 'legal' : 'privacy';

  useEffect(() => {
    document.title = `${document_.title} | NAMA Polyclinic`;
    // index.html points canonical at the home page; this page is its own canonical.
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', new URL(legalHref(page), canonical.getAttribute('href') ?? window.location.href).href);
  }, [document_, page]);

  return (
    <div className="legal-page">
      <header className="legal-header">
        <div className="container nav-shell">
          <a href={homeHref} className="brand-lockup" aria-label={copy.logoAlt} data-testid="link-legal-home">
            <img src={topLogo} alt={copy.logoAlt} />
          </a>
          <div className="header-actions">
            <div className="language-switcher" role="group" aria-label={copy.languageLabel}>
              {locales.map((option) => (
                <button key={option} type="button" className={locale === option ? 'active' : ''} onClick={() => setLocale(option)} aria-pressed={locale === option}>
                  {option === 'ar' ? 'عربي' : option.toUpperCase()}
                </button>
              ))}
            </div>
            <a href={homeHref} className="button button-outline legal-back" aria-label={copy.back} data-testid="link-legal-back"><ArrowLeft size={14} /> <span className="legal-back-label">{copy.back}</span></a>
          </div>
        </div>
      </header>
      <main className="container legal-content">
        <div className="eyebrow">NAMA Polyclinic</div>
        <h1 className="display">{document_.title}</h1>
        <p className="legal-updated">{copy.updated} {copy.updatedDate}</p>
        <p className="legal-intro">{document_.intro}</p>
        {document_.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.list && <ul>{section.list.map((item) => <li key={item}><RichText text={item} copy={copy} /></li>)}</ul>}
            {section.paragraphs?.map((paragraph) => <p key={paragraph}><RichText text={paragraph} copy={copy} /></p>)}
          </section>
        ))}
      </main>
      <footer className="legal-footer">
        <div className="container">
          <span>© {new Date().getFullYear()} NAMA Polyclinic. {copy.rights}</span>
          <a href={legalHref(otherPage)} data-testid={`link-legal-${otherPage}`}>{copy.documents[otherPage].title}</a>
        </div>
      </footer>
    </div>
  );
}

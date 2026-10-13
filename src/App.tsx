import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  ChevronRight,
  Clock3,
  HeartHandshake,
  ImagePlus,
  Instagram,
  Loader2,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Phone,
  Plus,
  Send,
  ShieldCheck,
  Stethoscope,
  X,
} from 'lucide-react';

import topLogo from './assets/nama-top-logo.png';
import namaIcon from './assets/nama-icon.png';
import './index.css';
import { LegalPage } from './legal';
import { CLINIC_PHONE, legalHref, legalPageFromLocation, locales, phoneText, useLocale, whatsappLink, withPhone, type Locale } from './site';

type NavKey = 'home' | 'about' | 'services' | 'team' | 'visit' | 'testimonials' | 'faq' | 'contact';
type SpecialtyKey = 'speech' | 'mind' | 'motion' | 'leaf' | 'physio';

const navItems: { key: NavKey; href: string; testId: string }[] = [
  { key: 'home', href: '#accueil', testId: 'accueil' },
  { key: 'about', href: '#a-propos', testId: 'à-propos' },
  { key: 'services', href: '#services', testId: 'nos-services' },
  { key: 'team', href: '#equipe', testId: 'notre-équipe' },
  { key: 'visit', href: '#parcours', testId: 'première-visite' },
  { key: 'testimonials', href: '#temoignages', testId: 'témoignages' },
  { key: 'faq', href: '#faq', testId: 'faq' },
  { key: 'contact', href: '#contact', testId: 'contact' },
];

// Team photos: drop a file named after the member's id into src/assets/team/
// (see the README there). Members without a photo keep the line-art placeholder.
// `focus` is the vertical crop (0% shows the top of the photo, 100% the bottom).
const teamPhotoIds: Record<string, { id: string; focus: string }> = {
  'Marie-Ange Abou Chrouche': { id: 'marie-ange', focus: '68%' },
  'Nour Asmar': { id: 'nour', focus: '86%' },
  'Tracy Chamoun': { id: 'tracy', focus: '45%' },
  'Romy Moussa': { id: 'romy', focus: '50%' },
  'Perla Boutros': { id: 'perla', focus: '5%' },
  'Christian Abou Zahra': { id: 'christian', focus: '20%' },
  'Mervat Salem': { id: 'mervat', focus: '25%' },
  'Fadia Mourad': { id: 'fadia', focus: '15%' },
  'Frederic Nader': { id: 'frederic', focus: '30%' },
  'Jeanne d’Arc Tannous': { id: 'jeanne-darc', focus: '10%' },
};
const teamPhotoFiles = import.meta.glob<string>('./assets/team/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' });
function teamPhoto(name: string) {
  const member = teamPhotoIds[name];
  if (!member) return undefined;
  const file = Object.keys(teamPhotoFiles).find((path) => path.replace(/^.*\/|\.[^.]+$/g, '').toLowerCase() === member.id);
  return file ? { src: teamPhotoFiles[file], focus: member.focus } : undefined;
}

const specialtyKeys: SpecialtyKey[] = ['speech', 'mind', 'motion', 'leaf', 'physio'];

const NAME_MAX = 100;
const MESSAGE_MAX = 1000;

type FormField = 'name' | 'phone' | 'specialty' | 'message';
type FormErrorKey = Exclude<keyof LocaleCopy['contact']['errors'], 'summary'>;
type FormStatus = 'idle' | 'sending' | 'sent' | 'error';

// Web3Forms emails each message to the address registered with this access key.
// The key is public by design (it can only send to that address). See .env.example.
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;
const WEB3FORMS_URL = 'https://api.web3forms.com/submit';
const formFields: FormField[] = ['name', 'phone', 'specialty', 'message'];

// Accepts Lebanese local numbers (03 123 456, 78 87 68 25) and international
// ones (+961 3 123 456, 0033 6 12 34 56 78).
function isValidPhone(raw: string) {
  const cleaned = raw.replace(/[\s\-.()/]/g, '');
  if (!/^(\+|00)?\d+$/.test(cleaned)) return false;
  const international = /^(\+|00)/.test(cleaned);
  const digits = cleaned.replace(/^(\+|00)/, '');
  if (!international) return digits.length >= 7 && digits.length <= 8;
  if (digits.startsWith('961')) return /^\d{7,8}$/.test(digits.slice(3));
  return digits.length >= 8 && digits.length <= 15;
}

function validateContactForm(values: Record<FormField, string>) {
  const errors: Partial<Record<FormField, FormErrorKey>> = {};
  if (!values.name) errors.name = 'nameRequired';
  else if (values.name.length < 2) errors.name = 'nameShort';
  if (!values.phone) errors.phone = 'phoneRequired';
  else if (!isValidPhone(values.phone)) errors.phone = 'phoneInvalid';
  if (!values.specialty) errors.specialty = 'specialtyRequired';
  if (values.message.length > MESSAGE_MAX) errors.message = 'messageTooLong';
  return errors;
}

interface TeamMember {
  name: string;
  // Shown under the photo, with the name.
  specialty: string;
  // Further titles, each on its own line under the specialty.
  titles?: string[];
  // First line of the hover panel. Co-founders default to "Co-fondatrice".
  role?: string;
  // Hidden until hover, focus or tap: bio, qualifications, languages...
  details?: string[];
}

interface LocaleCopy {
  languageLabel: string;
  logoAlt: string;
  nav: Record<NavKey, string>;
  hero: {
    eyebrow: string;
    heading: [string, string];
    lead: string;
    book: string;
    services: string;
    note: string;
    markAlt: string;
  };
  about: {
    eyebrow: string;
    heading: [string, string];
    copy: string;
    markAlt: string;
    trust: { title: string; description: string }[];
  };
  clinic: {
    eyebrow: string;
    heading: [string, string];
    copy: string;
    link: string;
    photo: string;
    photoNote: string;
  };
  services: {
    eyebrow: string;
    heading: [string, string];
    copy: string;
    index: string;
    nutritionSuffix: string;
    specialties: Record<SpecialtyKey, { title: string; description: string; detail: string }>;
  };
  team: {
    eyebrow: string;
    heading: [string, string];
    copy: string;
    founderRole: string;
    founders: TeamMember[];
    teamHeading: [string, string];
    members: TeamMember[];
    supportHeading: [string, string];
    support: TeamMember[];
    viewProfile: string;
    photo: string;
    portraitAlt: string;
    foot: string;
    professionalLink: string;
    professionalMessage: string;
  };
  steps: {
    eyebrow: string;
    heading: [string, string];
    copy: string;
    items: { title: string; text: string }[];
  };
  testimonials: {
    eyebrow: string;
    heading: [string, string];
    reserved: string;
    cards: { quote: string; text: string; cite: string }[];
  };
  faq: {
    eyebrow: string;
    heading: [string, string];
    copy: string;
    contact: string;
    items: { question: string; answer: string }[];
  };
  contact: {
    eyebrow: string;
    heading: [string, string];
    intro: string;
    phone: string;
    whatsapp: string;
    location: string;
    address: [string, string];
    instagramAria: string;
    whatsappAria: string;
    directionsAria: string;
    mapTitle: string;
    formHeading: string;
    name: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    specialty: string;
    specialtyPlaceholder: string;
    specialtyOptions: string[];
    message: string;
    messagePlaceholder: string;
    errors: {
      summary: string;
      nameRequired: string;
      nameShort: string;
      phoneRequired: string;
      phoneInvalid: string;
      specialtyRequired: string;
      messageTooLong: string;
    };
    privacyNote: string;
    privacyLink: string;
    submit: string;
    submitting: string;
    successHeading: string;
    successCopy: string;
    errorHeading: string;
    errorCopy: string;
    openWhatsApp: string;
    whatsappRequestTitle: string;
    newMessage: string;
    whatsappHeading: string;
    whatsappNote: string;
    whatsappButton: string;
    whatsappGreeting: string;
  };
  location: {
    eyebrow: string;
    heading: string;
    weekdays: string;
    weekdayHours: string;
    sunday: string;
    closed: string;
    link: string;
    ariaLabel: string;
  };
  footer: {
    copy: string;
    explore: string;
    findUs: string;
    whatsapp: string;
    rights: string;
    tagline: string;
    privacy: string;
    legal: string;
  };
  meta: { title: string; description: string; keywords: string };
}

const translations: Record<Locale, LocaleCopy> = {
  fr: {
    languageLabel: 'Langue du site',
    logoAlt: 'Logo original de NAMA Polyclinic',
    nav: { home: 'Accueil', about: 'À propos', services: 'Nos services', team: 'Notre équipe', visit: 'Première visite', testimonials: 'Témoignages', faq: 'FAQ', contact: 'Contact' },
    hero: {
      eyebrow: 'Polyclinique médicale & paramédicale',
      heading: ['Parce que chaque parcours', 'compte.'],
      lead: 'Un lieu doux et pluridisciplinaire à Jal El Dib, où chaque personne, enfant ou adulte, est accueillie avec attention.',
      book: 'Prendre rendez vous',
      services: 'Découvrir nos spécialités',
      note: 'Avancer, ensemble.',
      markAlt: 'Symbole NAMA représentant un adulte, un enfant et une pousse',
    },
    about: {
      eyebrow: 'Pourquoi NAMA',
      heading: ['Un même toit.', 'Plusieurs chemins.'],
      copy: 'NAMA réunit des regards médicaux et paramédicaux pour prendre soin de la personne dans son ensemble. Ici, on commence par écouter, puis on construit un accompagnement qui a du sens pour vous, votre enfant ou votre famille.',
      markAlt: 'Symbole NAMA : un adulte et un enfant autour d’une pousse',
      trust: [
        { title: 'Équipe pluridisciplinaire', description: 'Des compétences qui se répondent, au même endroit.' },
        { title: 'Approche personnalisée', description: 'Un bilan attentif avant chaque étape.' },
        { title: 'De l’enfant à l’adulte', description: 'Un accompagnement qui évolue avec vous.' },
        { title: 'Rendez vous flexibles', description: 'Des créneaux pensés pour la vraie vie.' },
      ],
    },
    clinic: {
      eyebrow: 'Le lieu NAMA',
      heading: ['Un espace pour', 'chaque étape.'],
      copy: 'Un cabinet lumineux et accueillant, pensé pour que les enfants, les adultes et leurs proches se sentent à leur place dès le premier rendez vous.',
      link: 'Découvrir NAMA',
      photo: 'Photo du bâtiment',
      photoNote: 'À ajouter prochainement',
    },
    services: {
      eyebrow: 'Nos spécialités',
      heading: ['Des expertises qui', 'se complètent.'],
      copy: 'Une porte d’entrée, puis le bon chemin. Nos professionnels travaillent avec précision, bienveillance et une vision commune du soin.',
      index: '05 disciplines, 01 intention',
      nutritionSuffix: '/ Nutrition',
      specialties: {
        speech: { title: 'Orthophonie', description: 'Accompagner la parole, le langage et la déglutition, à chaque âge. Un espace pour retrouver confiance dans sa voix et ses échanges.', detail: 'Articulation, retard de langage, bégaiement, troubles de la communication et de la déglutition.' },
        mind: { title: 'Psychologie', description: 'Écouter ce qui se vit, mettre des mots sur ce qui pèse et avancer avec un accompagnement ajusté aux enfants comme aux adultes.', detail: 'Soutien émotionnel, thérapie individuelle, difficultés comportementales et accompagnement familial.' },
        motion: { title: 'Psychomotricité', description: 'Faire grandir la coordination, l’équilibre et le lien entre le corps et les émotions, principalement chez l’enfant.', detail: 'Développement moteur, intégration sensorielle, graphomotricité et rééducation adaptée.' },
        leaf: { title: 'Diététique', description: 'Une nutrition concrète, personnalisée et sans jugement pour prendre soin de soi et de sa famille au quotidien.', detail: 'Plans alimentaires, gestion du poids, régimes thérapeutiques et conseils en nutrition familiale.' },
        physio: { title: 'Physiothérapie', description: 'Retrouver mobilité, force et confort après une blessure, une opération ou face à la douleur, avec des exercices adaptés à chaque âge.', detail: 'Rééducation, douleurs musculaires et articulaires, mal de dos, récupération après chirurgie et prévention.' },
      },
    },
    team: {
      eyebrow: 'Des personnes avant des titres',
      heading: ['Nos', 'co-fondatrices.'],
      copy: 'Chaque professionnel apporte son expertise, sa sensibilité et le temps nécessaire pour créer une relation de confiance.',
      founders: [
        {
          name: 'Marie-Ange Abou Chrouche',
          specialty: 'Orthophoniste trilingue',
          details: [
            'Marie-Ange est titulaire d’une licence en orthophonie de l’Université libanaise et d’un master de l’Université Saint-Joseph de Beyrouth (USJ). Forte de plus de cinq ans d’expérience en milieu scolaire, en cabinet et auprès d’ONG, elle est spécialisée dans les troubles des apprentissages, l’intervention précoce, les retards de langage oral et de communication, le bégaiement, ainsi que les troubles d’articulation et phonologiques.',
            'Elle est praticienne certifiée Hanen® – It Takes Two to Talk®, un programme qui aide les parents à favoriser la communication de leur enfant, et praticienne ADOS-2, expérimentée dans l’évaluation des troubles du spectre de l’autisme (TSA).',
          ],
        },
        {
          name: 'Nour Asmar',
          specialty: 'Psychomotricienne',
          details: [
            'Nour est titulaire d’une licence en psychomotricité de l’Université libanaise et prépare actuellement un master en handicap et neurologie à l’Université Saint-Joseph de Beyrouth (USJ).',
            'Forte d’une expérience en milieu scolaire, en cabinet et dans des centres d’éducation inclusive, elle accompagne le développement moteur, cognitif, émotionnel et social grâce à une prise en charge individualisée, adaptée aux besoins de chaque personne.',
          ],
        },
      ],
      founderRole: 'Co-fondatrice',
      teamHeading: ['Notre', 'équipe.'],
      members: [
        {
          name: 'Tracy Chamoun',
          specialty: 'Maître Praticienne en PNL',
          titles: ['Master en psychologie clinique en cours'],
          details: [
            'Tracy est Maître Praticienne en PNL et prépare actuellement un master en psychologie clinique.',
            'Au fil de stages cliniques variés à la prison de Roumieh, à l’Hôpital psychiatrique de la Croix (Deir El Salib) et au Children’s Cancer Center of Lebanon (CCCL), elle s’est familiarisée avec une grande diversité de besoins psychologiques et de contextes cliniques.',
            'Alliant sa formation en psychologie à la programmation neuro-linguistique (PNL), elle se passionne pour le bien-être émotionnel, le développement personnel et l’accompagnement de chacun vers des schémas de pensée et des stratégies d’adaptation plus sains.',
          ],
        },
        {
          name: 'Romy Moussa',
          specialty: 'Orthophoniste trilingue',
          details: [
            'Romy est titulaire d’une licence et d’un master en orthophonie de l’Université Saint-Joseph de Beyrouth (USJ).',
            'Forte d’une expérience en milieu scolaire, auprès d’ONG et en cabinet, elle accompagne des enfants présentant des retards de langage oral et des difficultés de communication. Elle est spécialisée dans les troubles du langage écrit et les compétences cognitives liées aux apprentissages.',
          ],
        },
        {
          name: 'Perla Boutros',
          specialty: 'Psychologue clinicienne agréée',
          titles: ['Spécialisation en TCC'],
          details: [
            'Perla est psychologue clinicienne agréée, spécialisée en thérapie cognitivo-comportementale (TCC), avec une expérience clinique à l’Hôpital psychiatrique de la Croix (Deir El Salib) et au Bellevue Medical Center.',
            'Formée aux évaluations WISC-V et TOVA, elle propose des séances de psychologie pour enfants, adolescents et adultes, des bilans neuropsychologiques et une guidance parentale. Elle anime également des formations en entreprise et des séances de soutien aux employés, pour favoriser le bien-être émotionnel, la conscience de soi et des stratégies d’adaptation plus saines.',
          ],
        },
        {
          name: 'Christian Abou Zahra',
          specialty: 'Physiothérapeute',
          titles: ['Master en thérapie manuelle ostéopathique', 'Praticien en dry needling'],
          details: [
            'Exerçant depuis 2021, Christian prend en charge au quotidien une grande variété de cas : affections orthopédiques, rhumatismales, gériatriques et neurologiques.',
            'Alliant son expérience à ses connaissances en thérapie manuelle ostéopathique, il aide ses patients à retrouver leur mobilité, à gérer leur douleur et à améliorer leur qualité de vie.',
            'Sa passion naît des progrès qu’il voit ses patients accomplir tout au long de leur rééducation, et de la conviction qu’il peut changer leur vie de manière significative.',
          ],
        },
        {
          name: 'Mervat Salem',
          specialty: 'Diététicienne clinicienne agréée',
          details: [
            'Mervat est titulaire d’une licence en nutrition humaine et diététique de l’USEK et certifiée en nutrition sportive avancée et aides ergogéniques par DICE.',
            'Forte d’une expérience en milieu hospitalier, elle assure la prise en charge nutritionnelle de nombreuses pathologies : gestion du poids, diabète, hypertension, maladies rénales, troubles gastro-intestinaux, SOPK, ainsi que les besoins nutritionnels des enfants et des adolescents.',
            'Elle est également spécialisée dans l’accompagnement nutritionnel avant et après une chirurgie bariatrique, avec des conseils individualisés, fondés sur les données scientifiques et adaptés aux besoins de chaque patient.',
          ],
        },
        {
          name: 'Fadia Mourad',
          specialty: 'Psychologue clinicienne agréée',
          titles: ['Psychothérapeute TCC'],
          details: [
            'Fadia est psychologue clinicienne agréée, spécialisée en thérapie cognitivo-comportementale (TCC), et membre de l’Ordre des psychologues du Liban (LOPsy).',
            'Forte d’une expérience en milieu scolaire et auprès d’ONG, elle propose des séances de psychothérapie, un soutien psychologique, des séances de sensibilisation et une guidance parentale à des personnes de tous âges et de tous horizons.',
            'Elle accompagne également des enfants aux besoins développementaux et comportementaux variés, notamment le TSA, la trisomie 21 et le TDAH, en séance au cabinet ou en ligne, dans un cadre sûr, accueillant et sans jugement.',
          ],
        },
      ],
      supportHeading: ['', 'Équipe de soutien.'],
      support: [
        {
          name: 'Frederic Nader',
          specialty: 'Coordinateur maintenance et services généraux',
          details: [
            'Frederic possède une formation technique en électricité, en électronique et en maintenance des installations.',
            'Compétent en installation, mise en place d’équipements, diagnostic et réparation, il veille à garantir un environnement sûr, efficace et bien entretenu, grâce à un sens pratique de la résolution de problèmes et à une grande attention aux détails.',
          ],
        },
        {
          name: 'Jeanne d’Arc Tannous',
          specialty: 'Ingénieure logiciel | Intelligence artificielle',
          details: [
            'Jeanne d’Arc est une professionnelle de l’informatique spécialisée en génie logiciel et en intelligence artificielle, formée à City, University of London et au King’s College London.',
            'Elle conçoit des solutions logicielles et des plateformes numériques, en alliant expertise technique et attention portée à la fonctionnalité, à l’accessibilité et à l’expérience utilisateur.',
          ],
        },
      ],
      viewProfile: 'Voir le profil',
      photo: 'Photo à ajouter',
      portraitAlt: 'Portrait placeholder du membre de l’équipe',
      foot: 'La famille NAMA grandit avec les besoins de la communauté.',
      professionalLink: 'Vous êtes un professionnel de santé ?',
      professionalMessage: 'Bonjour NAMA, je suis professionnel(le) de santé et j’aimerais échanger avec vous au sujet d’une collaboration.',
    },
    steps: {
      eyebrow: 'Votre première visite',
      heading: ['Pas à pas,', 'sans pression.'],
      copy: 'Vous n’avez pas besoin d’avoir toutes les réponses avant de venir. Nous les chercherons avec vous.',
      items: [
        { title: 'Prenez rendez vous', text: 'Par téléphone, WhatsApp ou via le formulaire. Dites nous simplement ce qui vous amène.' },
        { title: 'Bilan initial', text: 'La première séance est un temps d’écoute et d’observation, sans jugement.' },
        { title: 'Plan personnalisé', text: 'Nous vous expliquons nos observations et proposons des étapes claires.' },
        { title: 'Suivi régulier', text: 'Nous avançons à votre rythme, avec des points de repère pour mesurer les progrès.' },
      ],
    },
    testimonials: {
      eyebrow: 'Témoignages',
      heading: ['Des petits pas', 'qui comptent.'],
      reserved: 'Espace réservé',
      cards: [
        { quote: '« À venir »', text: 'Cet espace accueillera bientôt les mots de familles accompagnées par NAMA.', cite: 'Témoignage parent, bientôt disponible' },
        { quote: '« À venir »', text: 'Nous préparons une collection de témoignages sincères, avec l’accord de nos patients.', cite: 'Témoignage patient, bientôt disponible' },
        { quote: '« À venir »', text: 'Votre expérience pourra aider une autre famille à faire son premier pas.', cite: 'Témoignage famille, bientôt disponible' },
      ],
    },
    faq: {
      eyebrow: 'Questions fréquentes',
      heading: ['On peut', 'en parler.'],
      copy: 'Une question qui n’est pas ici ? Notre équipe vous répond avec plaisir.',
      contact: 'Nous contacter',
      items: [
        { question: 'Acceptez vous les assurances ?', answer: 'Les modalités de remboursement varient selon votre assurance et votre contrat. Notre équipe vous indiquera les documents généralement nécessaires et vous invitera à vérifier votre couverture auprès de votre assureur.' },
        { question: 'Ai je besoin d’une prescription médicale ?', answer: 'Une prescription n’est pas toujours nécessaire pour prendre un premier contact. Selon le motif de consultation et la spécialité, nous pourrons vous conseiller de demander l’avis de votre médecin.' },
        { question: 'Quels âges accompagnez vous ?', answer: 'NAMA accueille les enfants, les adolescents et les adultes. Nous prenons le temps d’orienter chaque personne vers le professionnel et le rythme qui lui correspondent.' },
        { question: 'Combien de temps dure une première séance ?', answer: 'La première rencontre dure habituellement entre 45 et 60 minutes. Elle permet de faire connaissance, de comprendre votre demande et d’imaginer la suite ensemble.' },
        { question: 'Proposez vous des séances en français, anglais ou arabe ?', answer: 'Oui. Notre accueil est pensé pour être accessible en français, en anglais et en arabe. Indiquez votre préférence au moment de la prise de rendez vous.' },
        { question: 'Quelle est votre politique d’annulation ?', answer: 'Nous vous remercions de prévenir le cabinet au moins 24 heures à l’avance lorsque cela est possible. Contactez nous directement afin de trouver un nouveau créneau.' },
      ],
    },
    contact: {
      eyebrow: 'Parlons de la suite',
      heading: ['Votre prochain', 'pas commence ici.'],
      intro: 'Expliquez nous ce dont vous avez besoin. Nous vous recontacterons pour trouver le professionnel et le moment les plus adaptés.',
      phone: 'Téléphone',
      whatsapp: 'Écrire directement à l’équipe',
      location: 'Nous trouver',
      address: ['WH5P+62F, Jal El Dib', 'Liban'],
      instagramAria: 'Instagram de NAMA Polyclinic',
      whatsappAria: 'WhatsApp de NAMA Polyclinic',
      directionsAria: 'Itinéraire vers NAMA Polyclinic',
      mapTitle: 'Localisation de NAMA Polyclinic à Jal El Dib',
      formHeading: 'Dites bonjour à NAMA.',
      name: 'Nom complet *',
      namePlaceholder: 'Votre nom',
      phoneLabel: 'Téléphone *',
      phonePlaceholder: 'Ex. 03 123 456',
      specialty: 'Je cherche *',
      specialtyPlaceholder: 'Choisir une spécialité',
      specialtyOptions: ['Orthophonie', 'Psychologie', 'Psychomotricité', 'Diététique / Nutrition', 'Physiothérapie', 'Je ne sais pas encore'],
      message: 'Votre message',
      messagePlaceholder: 'Quelques mots sur votre demande (facultatif)',
      errors: {
        summary: 'Merci de corriger les champs indiqués avant de continuer.',
        nameRequired: 'Indiquez votre nom.',
        nameShort: 'Votre nom doit contenir au moins 2 caractères.',
        phoneRequired: 'Indiquez un numéro pour que nous puissions vous rappeler.',
        phoneInvalid: 'Ce numéro semble incomplet. Exemple : 03 123 456 ou +961 3 123 456.',
        specialtyRequired: 'Choisissez une spécialité, ou « Je ne sais pas encore ».',
        messageTooLong: 'Votre message ne doit pas dépasser 1 000 caractères.',
      },
      privacyNote: 'Votre message est envoyé par e-mail à l’équipe NAMA. Il n’est pas enregistré sur ce site.',
      privacyLink: 'Politique de confidentialité',
      submit: 'Envoyer',
      submitting: 'Envoi en cours…',
      successHeading: 'Merci, votre message est bien arrivé.',
      successCopy: 'L’équipe NAMA vous recontactera très bientôt au numéro que vous avez indiqué.',
      errorHeading: 'Votre message n’a pas pu être envoyé.',
      errorCopy: 'Vérifiez votre connexion et réessayez, ou envoyez votre demande par WhatsApp. Vous pouvez aussi nous appeler au {phone}.',
      openWhatsApp: 'Ouvrir WhatsApp',
      whatsappRequestTitle: 'Demande pour NAMA',
      newMessage: 'Écrire un autre message',
      whatsappHeading: 'Vous préférez WhatsApp ?',
      whatsappNote: 'Votre message s’ouvrira dans WhatsApp.\nAppuyez ensuite sur Envoyer pour le transmettre à NAMA.',
      whatsappButton: 'Écrire sur WhatsApp',
      whatsappGreeting: 'Bonjour NAMA, ',
    },
    location: {
      eyebrow: 'Avant de venir',
      heading: 'On vous attend.',
      weekdays: 'Du lundi au samedi',
      weekdayHours: '08:00 à 20:00',
      sunday: 'Dimanche',
      closed: 'Fermé',
      link: 'Écrivez-nous',
      ariaLabel: 'Nous trouver et horaires',
    },
    footer: {
      copy: 'Une polyclinique médicale et paramédicale où chaque parcours est accueilli avec soin.',
      explore: 'Explorer',
      findUs: 'Nous trouver',
      whatsapp: 'WhatsApp',
      rights: 'Tous droits réservés.',
      tagline: 'Des soins médicaux et paramédicaux, porteurs de sens.',
      privacy: 'Confidentialité',
      legal: 'Mentions légales',
    },
    meta: {
      title: 'NAMA Polyclinic | Soins médicaux à Jal El Dib',
      description: 'NAMA Polyclinic, polyclinique médicale et paramédicale à Jal El Dib. Orthophonie, psychologie, psychomotricité, diététique et physiothérapie.',
      keywords: 'polyclinique Jal El Dib, orthophonie, psychologie, psychomotricité, diététique, nutrition, physiothérapie, Liban',
    },
  },
  en: {
    languageLabel: 'Website language',
    logoAlt: 'Original NAMA Polyclinic logo',
    nav: { home: 'Home', about: 'About', services: 'Services', team: 'Our team', visit: 'First visit', testimonials: 'Testimonials', faq: 'FAQ', contact: 'Contact' },
    hero: {
      eyebrow: 'Medical & paramedical clinic',
      heading: ['Because every journey', 'matters.'],
      lead: 'A warm, multidisciplinary place in Jal El Dib, where every person, child or adult, is welcomed with care.',
      book: 'Book an appointment',
      services: 'Discover our specialties',
      note: 'Moving forward, together.',
      markAlt: 'NAMA symbol representing an adult, a child and a growing plant',
    },
    about: {
      eyebrow: 'Why NAMA',
      heading: ['One roof.', 'Many paths.'],
      copy: 'NAMA brings medical and paramedical perspectives together to care for the whole person. We start by listening, then build meaningful support for you, your child or your family.',
      markAlt: 'NAMA symbol: an adult and a child gathered around a growing plant',
      trust: [
        { title: 'Multidisciplinary team', description: 'Connected expertise, all in one place.' },
        { title: 'Personalized approach', description: 'A thoughtful assessment before every step.' },
        { title: 'From child to adult', description: 'Support that grows and changes with you.' },
        { title: 'Flexible appointments', description: 'Time slots designed for real life.' },
      ],
    },
    clinic: {
      eyebrow: 'The NAMA space',
      heading: ['A place for', 'every step.'],
      copy: 'A bright, welcoming clinic designed so children, adults and their loved ones feel at home from their very first appointment.',
      link: 'Discover NAMA',
      photo: 'Building photo',
      photoNote: 'Coming soon',
    },
    services: {
      eyebrow: 'Our specialties',
      heading: ['Expertise that', 'works together.'],
      copy: 'One point of entry, then the right path. Our professionals work with precision, kindness and a shared vision of care.',
      index: '05 disciplines, 01 intention',
      nutritionSuffix: '/ Nutrition',
      specialties: {
        speech: { title: 'Speech therapy', description: 'Supporting speech, language and swallowing at every age. A space to rebuild confidence in your voice and your connections.', detail: 'Articulation, language delay, stuttering, communication and swallowing difficulties.' },
        mind: { title: 'Psychology', description: 'Making space for what you are experiencing, putting words to what weighs on you and moving forward with support tailored to children and adults.', detail: 'Emotional support, individual therapy, behavioral challenges and family support.' },
        motion: { title: 'Psychomotor therapy', description: 'Nurturing coordination, balance and the connection between body and emotions, especially in children.', detail: 'Motor development, sensory integration, graphomotor skills and adapted rehabilitation.' },
        leaf: { title: 'Dietetics', description: 'Practical, personalized and judgment-free nutrition to care for yourself and your family every day.', detail: 'Meal plans, weight management, therapeutic diets and family nutrition guidance.' },
        physio: { title: 'Physical therapy', description: 'Regaining mobility, strength and comfort after an injury or surgery, or when living with pain, with exercises adapted to every age.', detail: 'Rehabilitation, muscle and joint pain, back pain, post-surgery recovery and prevention.' },
      },
    },
    team: {
      eyebrow: 'People before titles',
      heading: ['Our', 'co-founders.'],
      copy: 'Every professional brings expertise, sensitivity and the time it takes to build a trusting relationship.',
      founders: [
        {
          name: 'Marie-Ange Abou Chrouche',
          specialty: 'Trilingual Speech and Language Therapist',
          details: [
            'Marie-Ange holds a Bachelor’s degree in Speech Therapy from the Lebanese University and a Master’s degree from Saint Joseph University of Beirut (USJ). With over five years of experience across schools, clinics and NGOs, she specializes in learning difficulties, early intervention, oral language and communication delays, stuttering, and articulation and phonological difficulties.',
            'She is a certified Hanen® – It Takes Two to Talk® practitioner, supporting parents in fostering their child’s communication, and an ADOS-2 practitioner experienced in autism spectrum disorder (ASD) assessment.',
          ],
        },
        {
          name: 'Nour Asmar',
          specialty: 'Psychomotor Therapist',
          details: [
            'Nour holds a Bachelor’s degree in Psychomotor Therapy from the Lebanese University and is currently pursuing a Master’s degree in Disability and Neurology at Saint Joseph University of Beirut (USJ).',
            'With experience across schools, clinics and inclusive education centres, she supports motor, cognitive, emotional and social development through individualized care tailored to each person’s needs.',
          ],
        },
      ],
      founderRole: 'Co-founder',
      teamHeading: ['Our', 'team.'],
      members: [
        {
          name: 'Tracy Chamoun',
          specialty: 'NLP Master Practitioner',
          titles: ['MA Candidate in Clinical Psychology'],
          details: [
            'Tracy is an NLP Master Practitioner currently pursuing a Master’s degree in Clinical Psychology.',
            'Through diverse clinical internships at Roumieh Prison, the Psychiatric Hospital of the Cross (Deir El Salib) and the Children’s Cancer Center of Lebanon (CCCL), she has gained exposure to a variety of psychological needs and clinical settings.',
            'Combining her background in psychology with Neuro-Linguistic Programming (NLP), she is passionate about emotional well-being, personal development, and helping individuals develop healthier thought patterns and coping strategies.',
          ],
        },
        {
          name: 'Romy Moussa',
          specialty: 'Trilingual Speech and Language Therapist',
          details: [
            'Romy holds a Bachelor’s degree and a Master’s degree in Speech and Language Therapy from Saint Joseph University of Beirut (USJ).',
            'With experience across schools, NGOs and clinics, she works with children presenting oral language delays and communication challenges. She specializes in written language difficulties and cognitive skills related to learning.',
          ],
        },
        {
          name: 'Perla Boutros',
          specialty: 'Licensed Clinical Psychologist',
          titles: ['CBT Specialization'],
          details: [
            'Perla is a licensed Clinical Psychologist specializing in Cognitive Behavioral Therapy (CBT), with clinical experience at the Psychiatric Hospital of the Cross (Deir El Salib) and Bellevue Medical Center.',
            'Trained in WISC-V and TOVA assessments, she provides psychological sessions for children, adolescents and adults, neuropsychological assessments, and parental guidance. She also delivers corporate training and employee support sessions, promoting emotional well-being, self-awareness and healthier coping strategies.',
          ],
        },
        {
          name: 'Christian Abou Zahra',
          specialty: 'Physiotherapist',
          titles: ['MPT in Osteopathic Manual Therapy', 'Dry Needling Practitioner'],
          details: [
            'With experience since 2021, Christian encounters a variety of cases on a daily basis, including orthopedic, rheumatic, geriatric and neurological conditions.',
            'Combining his experience with his knowledge in Osteopathic Manual Therapy, he helps patients restore their mobility, manage their pain and improve their quality of life.',
            'His passion comes from witnessing the progress patients make throughout their rehabilitation journey and knowing that he can make a meaningful difference in their lives.',
          ],
        },
        {
          name: 'Mervat Salem',
          specialty: 'Licensed Clinical Dietitian',
          details: [
            'Mervat holds a Bachelor’s degree in Human Nutrition and Dietetics from USEK and is certified in Advanced Sports Nutrition and Ergogenic Aids by DICE.',
            'With experience in hospital settings, she provides medical nutrition therapy for a wide range of conditions, including weight management, diabetes, hypertension, renal diseases, gastrointestinal disorders, PCOS, and pediatric and adolescent nutritional needs.',
            'She also specializes in nutritional care before and after bariatric surgery, offering individualized, evidence-based guidance tailored to each patient’s needs.',
          ],
        },
        {
          name: 'Fadia Mourad',
          specialty: 'Licensed Clinical Psychologist',
          titles: ['CBT Psychotherapist'],
          details: [
            'Fadia is a licensed Clinical Psychologist specializing in Cognitive Behavioral Therapy (CBT) and a member of the Lebanese Order of Psychologists (LOPsy).',
            'With experience across school and NGO settings, she provides psychotherapy sessions, psychological support, awareness sessions and parental guidance for individuals of different ages and backgrounds.',
            'She also supports children with diverse developmental and behavioral needs, including ASD, Down syndrome and ADHD, offering in-person and online sessions in a safe, welcoming and non-judgmental environment.',
          ],
        },
      ],
      supportHeading: ['', 'Support team.'],
      support: [
        {
          name: 'Frederic Nader',
          specialty: 'Maintenance & Facilities Coordinator',
          details: [
            'Frederic has a technical background in electricity, electronics and facilities maintenance.',
            'Skilled in installations, equipment setup, troubleshooting and repairs, he is committed to ensuring a safe, efficient and well-maintained environment through practical problem-solving and attention to detail.',
          ],
        },
        {
          name: 'Jeanne d’Arc Tannous',
          specialty: 'Software Engineer | Artificial Intelligence',
          details: [
            'Jeanne d’Arc is a Computer Science professional specialising in Software Engineering and Artificial Intelligence, with an academic background at City, University of London and King’s College London.',
            'She develops software solutions and digital platforms, combining technical expertise with a focus on functionality, accessibility and user experience.',
          ],
        },
      ],
      viewProfile: 'View profile',
      photo: 'Photo coming soon',
      portraitAlt: 'Team member portrait placeholder',
      foot: 'The NAMA family grows with the needs of our community.',
      professionalLink: 'Are you a healthcare professional?',
      professionalMessage: 'Hello NAMA, I am a healthcare professional and would like to talk with you about working together.',
    },
    steps: {
      eyebrow: 'Your first visit',
      heading: ['Step by step,', 'without pressure.'],
      copy: 'You do not need to have all the answers before you come. We will look for them together.',
      items: [
        { title: 'Book an appointment', text: 'By phone, WhatsApp or through the form. Simply tell us what brings you here.' },
        { title: 'Initial assessment', text: 'The first session is a time for listening and observation, without judgment.' },
        { title: 'Personalized plan', text: 'We explain our observations and suggest clear next steps.' },
        { title: 'Regular follow-up', text: 'We move at your pace, with milestones to help measure progress.' },
      ],
    },
    testimonials: {
      eyebrow: 'Testimonials',
      heading: ['Small steps', 'that matter.'],
      reserved: 'Reserved space',
      cards: [
        { quote: '“Coming soon”', text: 'This space will soon welcome words from families supported by NAMA.', cite: 'Parent testimonial, coming soon' },
        { quote: '“Coming soon”', text: 'We are preparing a collection of sincere testimonials, with our patients’ consent.', cite: 'Patient testimonial, coming soon' },
        { quote: '“Coming soon”', text: 'Your experience may help another family take their first step.', cite: 'Family testimonial, coming soon' },
      ],
    },
    faq: {
      eyebrow: 'Frequently asked questions',
      heading: ['Let’s', 'talk about it.'],
      copy: 'Have a question that is not here? Our team will be happy to help.',
      contact: 'Contact us',
      items: [
        { question: 'Do you accept insurance?', answer: 'Reimbursement terms vary depending on your insurance and policy. Our team can tell you which documents are generally needed and will invite you to confirm your coverage with your insurer.' },
        { question: 'Do I need a medical prescription?', answer: 'A prescription is not always required to make an initial enquiry. Depending on the reason for your visit and the specialty, we may suggest asking your doctor for advice.' },
        { question: 'What ages do you support?', answer: 'NAMA welcomes children, teenagers and adults. We take the time to guide each person to the professional and pace that fit them best.' },
        { question: 'How long is a first session?', answer: 'The first meeting usually lasts between 45 and 60 minutes. It gives us time to meet, understand your needs and imagine the next step together.' },
        { question: 'Do you offer sessions in French, English or Arabic?', answer: 'Yes. Our welcome is designed to be accessible in French, English and Arabic. Let us know your preference when you book.' },
        { question: 'What is your cancellation policy?', answer: 'When possible, please let the clinic know at least 24 hours in advance. Contact us directly so we can find a new time.' },
      ],
    },
    contact: {
      eyebrow: 'Let’s talk about what comes next',
      heading: ['Your next', 'step starts here.'],
      intro: 'Tell us what you need. We will get back to you to find the right professional and the right time.',
      phone: 'Phone',
      whatsapp: 'Message the team directly',
      location: 'Find us',
      address: ['WH5P+62F, Jal El Dib', 'Lebanon'],
      instagramAria: 'NAMA Polyclinic on Instagram',
      whatsappAria: 'NAMA Polyclinic on WhatsApp',
      directionsAria: 'Directions to NAMA Polyclinic',
      mapTitle: 'Location of NAMA Polyclinic in Jal El Dib',
      formHeading: 'Say hello to NAMA.',
      name: 'Full name *',
      namePlaceholder: 'Your name',
      phoneLabel: 'Phone *',
      phonePlaceholder: 'e.g. 03 123 456',
      specialty: 'I am looking for *',
      specialtyPlaceholder: 'Choose a specialty',
      specialtyOptions: ['Speech therapy', 'Psychology', 'Psychomotor therapy', 'Dietetics / Nutrition', 'Physical therapy', 'I am not sure yet'],
      message: 'Your message',
      messagePlaceholder: 'A few words about your request (optional)',
      errors: {
        summary: 'Please correct the highlighted fields before continuing.',
        nameRequired: 'Please enter your name.',
        nameShort: 'Your name must be at least 2 characters.',
        phoneRequired: 'Please enter a number so we can call you back.',
        phoneInvalid: 'This number looks incomplete. Example: 03 123 456 or +961 3 123 456.',
        specialtyRequired: 'Choose a specialty, or “I am not sure yet”.',
        messageTooLong: 'Your message must be 1,000 characters or fewer.',
      },
      privacyNote: 'Your message is emailed to the NAMA team. It is not stored on this website.',
      privacyLink: 'Privacy policy',
      submit: 'Send',
      submitting: 'Sending…',
      successHeading: 'Thank you, your message has been sent.',
      successCopy: 'The NAMA team will get back to you very soon on the number you gave us.',
      errorHeading: 'Your message could not be sent.',
      errorCopy: 'Check your connection and try again, or send your request on WhatsApp. You can also call us on {phone}.',
      openWhatsApp: 'Open WhatsApp',
      whatsappRequestTitle: 'Request for NAMA',
      newMessage: 'Write another message',
      whatsappHeading: 'Prefer WhatsApp?',
      whatsappNote: 'Your message will open in WhatsApp.\nThen tap Send to deliver it to NAMA.',
      whatsappButton: 'Message us on WhatsApp',
      whatsappGreeting: 'Hello NAMA, ',
    },
    location: {
      eyebrow: 'Before you visit',
      heading: 'We are here for you.',
      weekdays: 'Monday to Saturday',
      weekdayHours: '08:00 to 20:00',
      sunday: 'Sunday',
      closed: 'Closed',
      link: 'Reach out to us',
      ariaLabel: 'Find us and opening hours',
    },
    footer: {
      copy: 'A medical and paramedical clinic where every journey is welcomed with care.',
      explore: 'Explore',
      findUs: 'Find us',
      whatsapp: 'WhatsApp',
      rights: 'All rights reserved.',
      tagline: 'Medical and paramedical care, with meaning.',
      privacy: 'Privacy',
      legal: 'Legal notice',
    },
    meta: {
      title: 'NAMA Polyclinic | Medical care in Jal El Dib',
      description: 'NAMA Polyclinic, a medical and paramedical clinic in Jal El Dib. Speech therapy, psychology, psychomotor therapy, dietetics and physical therapy.',
      keywords: 'Jal El Dib clinic, speech therapy, psychology, psychomotor therapy, dietetics, nutrition, physical therapy, Lebanon',
    },
  },
  ar: {
    languageLabel: 'لغة الموقع',
    logoAlt: 'الشعار الأصلي لعيادة ناما',
    nav: { home: 'الرئيسية', about: 'عن ناما', services: 'خدماتنا', team: 'فريقنا', visit: 'الزيارة الأولى', testimonials: 'آراء وتجارب', faq: 'الأسئلة الشائعة', contact: 'تواصل معنا' },
    hero: {
      eyebrow: 'عيادة طبية وشبه طبية',
      heading: ['لأن كل مسيرة', 'تستحق الاهتمام.'],
      lead: 'مساحة دافئة ومتعددة الاختصاصات في جل الديب، نرحّب فيها بكل شخص، طفلاً كان أم بالغاً، بعناية واهتمام.',
      book: 'احجزوا موعداً',
      services: 'اكتشفوا اختصاصاتنا',
      note: 'نتقدّم، معاً.',
      markAlt: 'رمز ناما الذي يمثل شخصاً بالغاً وطفلاً ونبتة نامية',
    },
    about: {
      eyebrow: 'لماذا ناما',
      heading: ['سقف واحد.', 'مسارات متعددة.'],
      copy: 'تجمع ناما بين الرعاية الطبية وشبه الطبية للاهتمام بالإنسان ككل. نبدأ بالاستماع، ثم نبني معاً دعماً ينسجم معكم ومع طفلكم أو عائلتكم.',
      markAlt: 'رمز ناما: شخص بالغ وطفل يحيطان بنبتة نامية',
      trust: [
        { title: 'فريق متعدد الاختصاصات', description: 'خبرات متكاملة في مكان واحد.' },
        { title: 'مقاربة شخصية', description: 'تقييم دقيق قبل كل خطوة.' },
        { title: 'من الطفل إلى البالغ', description: 'رعاية تتطور معكم.' },
        { title: 'مواعيد مرنة', description: 'أوقات مصممة لتناسب حياتكم.' },
      ],
    },
    clinic: {
      eyebrow: 'مساحة ناما',
      heading: ['مساحة لكل', 'مرحلة.'],
      copy: 'عيادة مشرقة ومرحّبة، صُممت ليشعر الأطفال والبالغون وأحباؤهم بالراحة منذ الموعد الأول.',
      link: 'اكتشفوا ناما',
      photo: 'صورة المبنى',
      photoNote: 'ستُضاف قريباً',
    },
    services: {
      eyebrow: 'اختصاصاتنا',
      heading: ['خبرات', 'تتكامل.'],
      copy: 'نقطة بداية واحدة، ثم المسار المناسب. يعمل اختصاصيونا بدقة ولطف وبرؤية مشتركة للرعاية.',
      index: '05 اختصاصات، 01 غاية',
      nutritionSuffix: '/ التغذية',
      specialties: {
        speech: { title: 'علاج النطق واللغة', description: 'دعم الكلام واللغة والبلع في كل عمر، ضمن مساحة لاستعادة الثقة بالصوت والتواصل.', detail: 'النطق، تأخر اللغة، التأتأة، صعوبات التواصل والبلع.' },
        mind: { title: 'علم النفس', description: 'الإصغاء إلى ما تعيشونه، ووضع كلمات لما يثقل عليكم، والتقدم بدعم يناسب الأطفال والبالغين.', detail: 'الدعم العاطفي، العلاج الفردي، الصعوبات السلوكية والدعم العائلي.' },
        motion: { title: 'العلاج النفسي الحركي', description: 'تنمية التنسيق والتوازن والعلاقة بين الجسد والمشاعر، ولا سيما لدى الأطفال.', detail: 'النمو الحركي، التكامل الحسي، المهارات الحركية الدقيقة وإعادة التأهيل الملائمة.' },
        leaf: { title: 'علم التغذية', description: 'تغذية عملية وشخصية ومن دون أحكام للعناية بكم وبعائلتكم كل يوم.', detail: 'خطط غذائية، إدارة الوزن، حميات علاجية وإرشادات للتغذية العائلية.' },
        physio: { title: 'العلاج الفيزيائي', description: 'استعادة الحركة والقوة والراحة بعد إصابة أو عملية جراحية أو عند الشعور بالألم، من خلال تمارين ملائمة لكل عمر.', detail: 'إعادة التأهيل، آلام العضلات والمفاصل، آلام الظهر، التعافي بعد الجراحة والوقاية.' },
      },
    },
    team: {
      eyebrow: 'أشخاص قبل الألقاب',
      heading: ['مؤسِّستا', 'ناما.'],
      copy: 'يقدّم كل اختصاصي خبرته وحساسيته والوقت اللازم لبناء علاقة قائمة على الثقة.',
      founders: [
        {
          name: 'Marie-Ange Abou Chrouche',
          specialty: 'اختصاصية في علاج النطق واللغة بثلاث لغات',
          details: [
            'تحمل ماري-أنج إجازة في علاج النطق من الجامعة اللبنانية وشهادة ماستر من جامعة القديس يوسف في بيروت (USJ). تتمتع بخبرة تزيد على خمس سنوات في المدارس والعيادات والمنظمات غير الحكومية، وتتخصص في صعوبات التعلّم، والتدخل المبكر، وتأخر اللغة الشفهية والتواصل، والتأتأة، واضطرابات النطق والاضطرابات الفونولوجية.',
            'وهي ممارِسة معتمدة لبرنامج Hanen® – It Takes Two to Talk® الذي يساعد الأهل على تنمية تواصل طفلهم، وممارِسة لأداة ADOS-2 ذات خبرة في تقييم اضطراب طيف التوحد.',
          ],
        },
        {
          name: 'Nour Asmar',
          specialty: 'اختصاصية في العلاج النفسي الحركي',
          details: [
            'تحمل نور إجازة في العلاج النفسي الحركي من الجامعة اللبنانية، وتتابع حالياً دراسة الماستر في الإعاقة وعلم الأعصاب في جامعة القديس يوسف في بيروت (USJ).',
            'بفضل خبرتها في المدارس والعيادات ومراكز التعليم الدامج، ترافق النمو الحركي والمعرفي والعاطفي والاجتماعي من خلال رعاية فردية تتلاءم مع احتياجات كل شخص.',
          ],
        },
      ],
      founderRole: 'شريكة مؤسِّسة',
      teamHeading: ['فريق', 'ناما.'],
      members: [
        {
          name: 'Tracy Chamoun',
          specialty: 'ممارِسة متقدّمة في البرمجة اللغوية العصبية',
          titles: ['طالبة ماستر في علم النفس العيادي'],
          details: [
            'تريسي ممارِسة متقدّمة (Master Practitioner) في البرمجة اللغوية العصبية (NLP)، وتتابع حالياً دراسة الماستر في علم النفس العيادي.',
            'من خلال تدريبات عيادية متنوّعة في سجن رومية، ومستشفى الصليب للأمراض النفسية (دير الصليب)، ومركز سرطان الأطفال في لبنان (CCCL)، اكتسبت خبرة في احتياجات نفسية وبيئات عيادية متعددة.',
            'تجمع بين خلفيتها في علم النفس والبرمجة اللغوية العصبية، وهي شغوفة بالرفاه العاطفي والتطوّر الشخصي ومساعدة الأفراد على بناء أنماط تفكير واستراتيجيات تكيّف أكثر صحة.',
          ],
        },
        {
          name: 'Romy Moussa',
          specialty: 'اختصاصية في علاج النطق واللغة بثلاث لغات',
          details: [
            'تحمل رومي إجازة وماستر في علاج النطق واللغة من جامعة القديس يوسف في بيروت (USJ).',
            'بفضل خبرتها في المدارس والمنظمات غير الحكومية والعيادات، تعمل مع الأطفال الذين يعانون من تأخر في اللغة الشفهية وصعوبات في التواصل. وتتخصص في صعوبات اللغة المكتوبة والمهارات المعرفية المرتبطة بالتعلّم.',
          ],
        },
        {
          name: 'Perla Boutros',
          specialty: 'اختصاصية مرخّصة في علم النفس العيادي',
          titles: ['تخصص في العلاج المعرفي السلوكي'],
          details: [
            'بيرلا اختصاصية مرخّصة في علم النفس العيادي، متخصصة في العلاج المعرفي السلوكي (CBT)، ولديها خبرة عيادية في مستشفى الصليب للأمراض النفسية (دير الصليب) وفي Bellevue Medical Center.',
            'وهي مدرّبة على اختبارات WISC-V وTOVA، وتقدّم جلسات نفسية للأطفال والمراهقين والبالغين، وتقييمات نفسية عصبية، وإرشاداً للأهل. كما تقدّم تدريبات للشركات وجلسات دعم للموظفين تعزّز الرفاه العاطفي والوعي الذاتي واستراتيجيات تكيّف أكثر صحة.',
          ],
        },
        {
          name: 'Christian Abou Zahra',
          specialty: 'اختصاصي في العلاج الفيزيائي',
          titles: ['ماستر في العلاج اليدوي التقويمي العظمي', 'ممارس لتقنية الإبر الجافة'],
          details: [
            'يمارس كريستيان مهنته منذ عام 2021، ويتعامل يومياً مع حالات متنوعة، منها الحالات العظمية والروماتيزمية وحالات كبار السن والحالات العصبية.',
            'ومن خلال الجمع بين خبرته ومعرفته بالعلاج اليدوي التقويمي العظمي، يساعد المرضى على استعادة حركتهم والتحكم في آلامهم وتحسين جودة حياتهم.',
            'ينبع شغفه من رؤية التقدّم الذي يحققه المرضى طوال مسيرة إعادة تأهيلهم، ومن إدراكه أنه قادر على إحداث فرق حقيقي في حياتهم.',
          ],
        },
        {
          name: 'Mervat Salem',
          specialty: 'اختصاصية تغذية عيادية مرخّصة',
          details: [
            'تحمل ميرفت إجازة في التغذية البشرية وعلم الحميات من جامعة الروح القدس - الكسليك (USEK)، وهي حائزة شهادة في التغذية الرياضية المتقدمة والمكمّلات المحسّنة للأداء من DICE.',
            'بفضل خبرتها في المستشفيات، تقدّم العلاج الغذائي الطبي لمجموعة واسعة من الحالات، منها إدارة الوزن، والسكري، وارتفاع ضغط الدم، وأمراض الكلى، واضطرابات الجهاز الهضمي، ومتلازمة تكيّس المبايض، والاحتياجات الغذائية للأطفال والمراهقين.',
            'كما تتخصص في الرعاية الغذائية قبل جراحات السمنة وبعدها، وتقدّم إرشادات فردية مبنية على الأدلة العلمية ومتلائمة مع احتياجات كل مريض.',
          ],
        },
        {
          name: 'Fadia Mourad',
          specialty: 'اختصاصية مرخّصة في علم النفس العيادي',
          titles: ['معالِجة نفسية بالعلاج المعرفي السلوكي'],
          details: [
            'فاديا اختصاصية مرخّصة في علم النفس العيادي، متخصصة في العلاج المعرفي السلوكي (CBT)، وعضو في نقابة النفسانيين في لبنان (LOPsy).',
            'بفضل خبرتها في المدارس والمنظمات غير الحكومية، تقدّم جلسات علاج نفسي ودعماً نفسياً وجلسات توعية وإرشاداً للأهل لأشخاص من مختلف الأعمار والخلفيات.',
            'كما ترافق الأطفال ذوي الاحتياجات النمائية والسلوكية المتنوعة، ومنها اضطراب طيف التوحد ومتلازمة داون واضطراب فرط الحركة وتشتت الانتباه، من خلال جلسات حضورية أو عبر الإنترنت، ضمن بيئة آمنة ومرحّبة وخالية من الأحكام.',
          ],
        },
      ],
      supportHeading: ['', 'فريق الدعم.'],
      support: [
        {
          name: 'Frederic Nader',
          specialty: 'منسّق الصيانة والمرافق',
          details: [
            'يتمتع فريدريك بخلفية تقنية في الكهرباء والإلكترونيات وصيانة المرافق.',
            'بفضل مهاراته في التركيبات وتجهيز المعدات وتشخيص الأعطال وإصلاحها، يحرص على توفير بيئة آمنة وفعّالة ومُعتنى بها من خلال حلول عملية واهتمام بالتفاصيل.',
          ],
        },
        {
          name: 'Jeanne d’Arc Tannous',
          specialty: 'مهندسة برمجيات | الذكاء الاصطناعي',
          details: [
            'جان دارك متخصصة في علوم الحاسوب، في مجالَي هندسة البرمجيات والذكاء الاصطناعي، وقد تابعت دراستها في City, University of London وKing’s College London.',
            'تطوّر حلولاً برمجية ومنصات رقمية، وتجمع بين الخبرة التقنية والاهتمام بالوظائف وسهولة الوصول وتجربة المستخدم.',
          ],
        },
      ],
      viewProfile: 'عرض الملف',
      photo: 'ستُضاف الصورة قريباً',
      portraitAlt: 'صورة مؤقتة لأحد أعضاء الفريق',
      foot: 'تنمو عائلة ناما مع احتياجات مجتمعنا.',
      professionalLink: 'هل أنتم من العاملين في مجال الرعاية الصحية؟',
      professionalMessage: 'مرحباً ناما، أنا من العاملين في مجال الرعاية الصحية وأودّ التحدث معكم بشأن تعاون محتمل.',
    },
    steps: {
      eyebrow: 'زيارتكم الأولى',
      heading: ['خطوة خطوة،', 'من دون ضغط.'],
      copy: 'لا تحتاجون إلى كل الإجابات قبل زيارتنا. سنبحث عنها معاً.',
      items: [
        { title: 'احجزوا موعداً', text: 'عبر الهاتف أو واتساب أو النموذج. أخبرونا ببساطة ما الذي أتى بكم.' },
        { title: 'التقييم الأولي', text: 'الجلسة الأولى مساحة للإصغاء والملاحظة، من دون أحكام.' },
        { title: 'خطة شخصية', text: 'نشرح لكم ملاحظاتنا ونقترح خطوات واضحة.' },
        { title: 'متابعة منتظمة', text: 'نتقدم بالوتيرة التي تناسبكم، مع نقاط تساعد على قياس التقدم.' },
      ],
    },
    testimonials: {
      eyebrow: 'آراء وتجارب',
      heading: ['خطوات صغيرة', 'تصنع فرقاً.'],
      reserved: 'مساحة محجوزة',
      cards: [
        { quote: '« قريباً »', text: 'ستستقبل هذه المساحة قريباً كلمات العائلات التي رافقتها ناما.', cite: 'رأي أحد الوالدين، قريباً' },
        { quote: '« قريباً »', text: 'نحضّر مجموعة من الشهادات الصادقة بموافقة مرضانا.', cite: 'رأي أحد المرضى، قريباً' },
        { quote: '« قريباً »', text: 'قد تساعد تجربتكم عائلة أخرى على اتخاذ خطوتها الأولى.', cite: 'رأي عائلة، قريباً' },
      ],
    },
    faq: {
      eyebrow: 'الأسئلة الشائعة',
      heading: ['يمكننا', 'التحدث عنها.'],
      copy: 'لديكم سؤال غير موجود هنا؟ يسرّ فريقنا أن يجيبكم.',
      contact: 'تواصلوا معنا',
      items: [
        { question: 'هل تقبلون التأمين؟', answer: 'تختلف شروط الاسترداد بحسب شركة التأمين والعقد. سيخبركم فريقنا بالمستندات المطلوبة عادةً، وننصحكم بالتأكد من التغطية مع شركة التأمين.' },
        { question: 'هل أحتاج إلى وصفة طبية؟', answer: 'لا تكون الوصفة ضرورية دائماً للتواصل الأول. وبحسب سبب الزيارة والاختصاص، قد ننصحكم باستشارة طبيبكم.' },
        { question: 'ما الأعمار التي تستقبلونها؟', answer: 'تستقبل ناما الأطفال والمراهقين والبالغين. نأخذ الوقت لتوجيه كل شخص إلى الاختصاصي والوتيرة الأنسب له.' },
        { question: 'ما مدة الجلسة الأولى؟', answer: 'تستغرق الجلسة الأولى عادةً بين 45 و60 دقيقة، ما يتيح لنا التعارف وفهم طلبكم وتخيّل الخطوة التالية معاً.' },
        { question: 'هل تقدمون جلسات بالفرنسية أو الإنكليزية أو العربية؟', answer: 'نعم. صُمم استقبالنا ليكون متاحاً بالفرنسية والإنكليزية والعربية. أخبرونا بتفضيلكم عند حجز الموعد.' },
        { question: 'ما سياسة إلغاء الموعد؟', answer: 'نرجو، عندما يكون ذلك ممكناً، إبلاغ العيادة قبل 24 ساعة على الأقل. تواصلوا معنا مباشرةً لإيجاد موعد جديد.' },
      ],
    },
    contact: {
      eyebrow: 'لنتحدث عن الخطوة التالية',
      heading: ['خطوتكم القادمة', 'تبدأ من هنا.'],
      intro: 'أخبرونا بما تحتاجون إليه. سنتواصل معكم لإيجاد الاختصاصي والوقت الأنسب.',
      phone: 'الهاتف',
      whatsapp: 'اكتبوا مباشرةً إلى الفريق',
      location: 'موقعنا',
      address: ['WH5P+62F، جل الديب', 'لبنان'],
      instagramAria: 'حساب ناما على إنستغرام',
      whatsappAria: 'حساب ناما على واتساب',
      directionsAria: 'الاتجاهات إلى عيادة ناما',
      mapTitle: 'موقع عيادة ناما في جل الديب',
      formHeading: 'ألقوا التحية على ناما.',
      name: 'الاسم الكامل *',
      namePlaceholder: 'اسمكم',
      phoneLabel: 'الهاتف *',
      phonePlaceholder: 'مثال: 03 123 456',
      specialty: 'أبحث عن *',
      specialtyPlaceholder: 'اختاروا اختصاصاً',
      specialtyOptions: ['علاج النطق واللغة', 'علم النفس', 'العلاج النفسي الحركي', 'التغذية / علم التغذية', 'العلاج الفيزيائي', 'لست متأكداً بعد'],
      message: 'رسالتكم',
      messagePlaceholder: 'بضع كلمات عن طلبكم (اختياري)',
      errors: {
        summary: 'يرجى تصحيح الحقول المشار إليها قبل المتابعة.',
        nameRequired: 'يرجى إدخال اسمكم.',
        nameShort: 'يجب أن يتكوّن الاسم من حرفين على الأقل.',
        phoneRequired: 'يرجى إدخال رقم هاتف لنتمكّن من الاتصال بكم.',
        phoneInvalid: 'يبدو أن الرقم غير مكتمل. مثال: \u206603 123 456\u2069 أو \u2066+961 3 123 456\u2069.',
        specialtyRequired: 'اختاروا اختصاصاً، أو «لست متأكداً بعد».',
        messageTooLong: 'يجب ألا تتجاوز الرسالة 1000 حرف.',
      },
      privacyNote: 'تُرسَل رسالتكم بالبريد الإلكتروني إلى فريق ناما، ولا تُحفَظ على هذا الموقع.',
      privacyLink: 'سياسة الخصوصية',
      submit: 'إرسال',
      submitting: 'جارٍ الإرسال…',
      successHeading: 'شكراً، وصلتنا رسالتكم.',
      successCopy: 'سيتواصل معكم فريق ناما قريباً جداً على الرقم الذي أدخلتموه.',
      errorHeading: 'تعذّر إرسال رسالتكم.',
      errorCopy: 'تحققوا من اتصالكم بالإنترنت وحاولوا مجدداً، أو أرسلوا طلبكم عبر واتساب. ويمكنكم أيضاً الاتصال بنا على {phone}.',
      openWhatsApp: 'فتح واتساب',
      whatsappRequestTitle: 'طلب إلى ناما',
      newMessage: 'كتابة رسالة أخرى',
      whatsappHeading: 'تفضّلون واتساب؟',
      whatsappNote: 'ستُفتح رسالتكم في واتساب.\nثم اضغطوا على إرسال لإيصالها إلى ناما.',
      whatsappButton: 'راسلونا على واتساب',
      whatsappGreeting: 'مرحباً ناما، ',
    },
    location: {
      eyebrow: 'قبل الزيارة',
      heading: 'نحن بانتظاركم.',
      weekdays: 'من الإثنين إلى السبت',
      weekdayHours: '08:00 حتى 20:00',
      sunday: 'الأحد',
      closed: 'مغلق',
      link: 'تواصلوا معنا',
      ariaLabel: 'موقعنا وساعات العمل',
    },
    footer: {
      copy: 'عيادة طبية وشبه طبية نرحّب فيها بكل مسيرة بعناية.',
      explore: 'استكشفوا',
      findUs: 'موقعنا',
      whatsapp: 'واتساب',
      rights: 'جميع الحقوق محفوظة.',
      tagline: 'رعاية طبية وشبه طبية، بمعنى.',
      privacy: 'الخصوصية',
      legal: 'إشعار قانوني',
    },
    meta: {
      title: 'عيادة ناما | رعاية طبية في جل الديب',
      description: 'عيادة ناما الطبية وشبه الطبية في جل الديب. علاج النطق واللغة، علم النفس، العلاج النفسي الحركي، التغذية والعلاج الفيزيائي.',
      keywords: 'عيادة جل الديب، علاج النطق واللغة، علم النفس، العلاج النفسي الحركي، التغذية، العلاج الفيزيائي، لبنان',
    },
  },
};

function BrandMark({ className = '', ariaLabel }: { className?: string; ariaLabel: string }) {
  return (
    <svg className={className} viewBox="0 0 260 250" role="img" aria-label={ariaLabel}>
      <path d="M37 203c47-20 105-18 164 0 13 4 25 4 38-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M94 197c-8-25-10-59 3-87 8-17 17-25 24-24 9 1 15 15 23 32 8 16 18 25 37 33 17 7 24 17 22 30-2 15-17 20-33 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="121" cy="68" r="14" fill="currentColor" />
      <path d="M144 123c12 5 21 6 32 5 17-1 28 5 30 16 3 15-8 31-24 39" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
      <circle cx="184" cy="105" r="9" fill="#A8815B" />
      <path d="M157 194c-3-25-2-46 7-64M158 159c-13-6-20-15-23-25M158 159c11-7 16-14 18-24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M158 194c-1-17-1-29 0-37" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SpecialtyIcon({ kind }: { kind: string }) {
  if (kind === 'speech') {
    return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M7 10.5c0-2.2 1.8-4 4-4h18c2.2 0 4 1.8 4 4v10c0 2.2-1.8 4-4 4H18l-7 6v-6h0c-2.2 0-4-1.8-4-4v-10Z" stroke="currentColor" /><path d="M14 16c1.8 2.7 3.8 2.7 5.5 0 1.8 2.7 3.8 2.7 5.5 0" stroke="currentColor" strokeLinecap="round" /></svg>;
  }
  if (kind === 'mind') {
    return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 32c-7.4 0-12-4.5-12-11.4C8 13.5 13 8 20 8s12 5.5 12 12.6C32 27.5 27.4 32 20 32Z" stroke="currentColor" /><path d="M16 32v-5c-2.8-.4-4.5-2.3-4.5-4.7M24 32v-5c2.8-.4 4.5-2.3 4.5-4.7M16 17c1.7 1.5 2.5 3.1 2.3 5M24 17c-1.7 1.5-2.5 3.1-2.3 5M17 14c1 1 2 1.4 3 1.3 1 .1 2-.3 3-1.3" stroke="currentColor" strokeLinecap="round" /></svg>;
  }
  if (kind === 'physio') {
    return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect x="15" y="4" width="10" height="5" rx="2" stroke="currentColor" /><rect x="16" y="11" width="10" height="5" rx="2" stroke="currentColor" /><rect x="16.5" y="18" width="10" height="5" rx="2" stroke="currentColor" /><rect x="16" y="25" width="10" height="5" rx="2" stroke="currentColor" /><rect x="15" y="32" width="10" height="5" rx="2" stroke="currentColor" /><path d="M11 13c-2 4-2 10 0 14M31 13c2 4 2 10 0 14" stroke="currentColor" strokeLinecap="round" /></svg>;
  }
  if (kind === 'motion') {
    return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="24" cy="8" r="3.5" stroke="currentColor" /><path d="m22 13-5 8 5 4 4 8M17 21l-8 2M22 25l-8 8M26 16l7 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /><path d="M7 34h27" stroke="currentColor" strokeLinecap="round" /></svg>;
  }
  return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 34c-2-8-7-13-12-17 5-1 10 1 12 6 2-5 7-7 12-6-5 4-10 9-12 17Z" stroke="currentColor" strokeLinejoin="round" /><path d="M20 34V17M20 24c-3-4-6-5-10-5M20 21c3-3 6-4 10-3" stroke="currentColor" strokeLinecap="round" /></svg>;
}

function Portrait({ index, ariaLabel }: { index: number; ariaLabel: string }) {
  return (
    <svg viewBox="0 0 120 140" fill="none" role="img" aria-label={ariaLabel}>
      <circle cx="60" cy="43" r="22" stroke="currentColor" strokeWidth="1.2" />
      <path d="M20 130c2-28 17-44 40-44s38 16 40 44" stroke="currentColor" strokeWidth="1.2" />
      <path d="M45 43c3 2 7 3 15 3s12-1 15-3M51 57c6 4 12 4 18 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      {index === 1 && <path d="M38 35c4-16 38-22 45 1-8-7-15-10-25-8-6 1-13 3-20 7Z" fill="currentColor" opacity=".35" />}
      {index === 2 && <path d="M38 39c0-18 40-25 45 0-10-5-18-7-25-7-7 0-13 3-20 7Z" fill="currentColor" opacity=".3" />}
    </svg>
  );
}

function PersonPortrait({ name, index, copy }: { name: string; index: number; copy: LocaleCopy['team'] }) {
  const photo = teamPhoto(name);
  if (photo) {
    return (
      <div className="person-portrait has-photo">
        <img className="person-photo" src={photo.src} alt={name} loading="lazy" style={{ objectPosition: `center ${photo.focus}` }} />
      </div>
    );
  }
  return (
    <div className="person-portrait" aria-label={`${copy.photo}: ${name}`}>
      <div className="photo-slot-icon"><ImagePlus size={20} /></div>
      <Portrait index={index} ariaLabel={copy.portraitAlt} />
      <span className="photo-slot-label">{copy.photo}</span>
    </div>
  );
}

type PersonGroup = 'founder' | 'team' | 'support';
const personCardClass: Record<PersonGroup, string> = { founder: 'founder-card', team: 'person-card', support: 'support-card' };

// Name and specialty under the photo; anything else (details) slides up over the photo
// on hover (mouse), on keyboard focus of the "Voir le profil" badge, or on tap (touch).
// Tap again, tap elsewhere or press Escape to close. Only transforms and opacity
// change, so an open card never moves or resizes the cards around it.
function PersonCard({ person, group, index, copy, open, onToggle }: {
  person: TeamMember; group: PersonGroup; index: number; copy: LocaleCopy['team']; open: boolean; onToggle: () => void;
}) {
  const details = person.details ?? [];
  const hasDetails = details.length > 0;
  const detailsId = `person-details-${group}-${index}`;
  const role = person.role ?? (group === 'founder' ? copy.founderRole : undefined);
  const lines = [...(role ? [role] : []), ...details];
  return (
    <article
      // Keep this className stable: the reveal animation adds `is-visible` to it directly,
      // and React would drop that class if the string changed. Open state lives on the inner wrapper.
      className={`${personCardClass[group]} reveal reveal-delay-${(index % 3) + 1}${hasDetails ? ' has-details' : ''}`}
      data-person={person.name}
      data-testid={`card-${group}-${index}`}
    >
      <div className={`person-card-inner${open ? ' is-open' : ''}`} onClick={hasDetails ? onToggle : undefined}>
        <div className="person-media">
          <PersonPortrait name={person.name} index={index} copy={copy} />
          {hasDetails && (
            <>
              <div className="person-details" id={detailsId} data-testid={`details-${group}-${index}`}>
                <div className="person-details-inner">
                  {lines.map((line, i) => (
                    <p key={i} className={role && i === 0 ? 'person-details-role' : undefined} style={{ '--i': i } as CSSProperties}>{line}</p>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="person-badge"
                aria-expanded={open}
                aria-controls={detailsId}
                aria-label={`${copy.viewProfile} – ${person.name}`}
                onClick={(event) => { event.stopPropagation(); onToggle(); }}
                data-testid={`toggle-${group}-${index}`}
              >
                <span className="person-badge-icon"><Plus size={16} strokeWidth={1.8} /></span>
                <span className="person-badge-label">{copy.viewProfile}</span>
              </button>
            </>
          )}
        </div>
        <div className="person-text">
          <h3>{person.name}</h3>
          {person.specialty && <div className="person-specialty">{person.specialty}</div>}
          {person.titles?.map((title) => <div key={title} className="person-title">{title}</div>)}
        </div>
      </div>
    </article>
  );
}

function Home() {
  const [locale, setLocale] = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormField, FormErrorKey>>>({});
  const [failedRequest, setFailedRequest] = useState<Record<FormField, string> | null>(null);
  const [openPerson, setOpenPerson] = useState<string | null>(null);
  const [isLanguageSwitching, setIsLanguageSwitching] = useState(false);
  const revealRoot = useRef<HTMLDivElement>(null);
  const copy = translations[locale];

  useEffect(() => {
    document.title = copy.meta.title;

    const updateMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMeta('description', copy.meta.description);
    updateMeta('keywords', copy.meta.keywords);
  }, [locale, copy]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const root = revealRoot.current;
    if (!root) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    // Re-run on language change: elements rendered since the last scan must be observed too.
    root.querySelectorAll('.reveal:not(.is-visible)').forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [locale]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const target = document.getElementById(hash);
    if (!target) return;
    const headerOffset = window.innerWidth <= 760 ? 76 : 92;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, Math.max(0, targetTop));
    root.style.scrollBehavior = previousScrollBehavior;
    target.querySelectorAll('.reveal').forEach((node) => node.classList.add('is-visible'));
  }, []);

  useEffect(() => {
    if (!openPerson) return;
    const closeIfOutside = (event: PointerEvent) => {
      const card = (event.target as Element | null)?.closest('[data-person]');
      if (card?.getAttribute('data-person') !== openPerson) setOpenPerson(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpenPerson(null); };
    document.addEventListener('pointerdown', closeIfOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeIfOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [openPerson]);

  const togglePerson = (name: string) => setOpenPerson((current) => (current === name ? null : name));
  const closeMenu = () => setMenuOpen(false);
  const changeLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    setIsLanguageSwitching(true);
    setLocale(nextLocale);
    window.setTimeout(() => setIsLanguageSwitching(false), 180);
  };
  const clearFieldError = (event: FormEvent<HTMLFormElement>) => {
    const field = (event.target as HTMLInputElement).name as FormField;
    if (fieldErrors[field]) setFieldErrors(({ [field]: _removed, ...rest }) => rest);
  };
  const resetContactForm = () => {
    setFormStatus('idle');
    setFieldErrors({});
  };
  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formStatus === 'sending') return;
    const form = event.currentTarget;
    const data = new FormData(form);
    // Hidden field that people never see: if it is filled in, a bot sent the form.
    if (data.get('botcheck')) {
      setFormStatus('sent');
      return;
    }
    const values = Object.fromEntries(
      formFields.map((field) => [field, String(data.get(field) || '').trim()]),
    ) as Record<FormField, string>;
    const errors = validateContactForm(values);
    setFieldErrors(errors);
    const firstInvalid = formFields.find((field) => errors[field]);
    if (firstInvalid) {
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    setFormStatus('sending');
    setFailedRequest(null);
    try {
      if (!WEB3FORMS_KEY) throw new Error('VITE_WEB3FORMS_KEY is not set, so the form cannot send email.');
      const response = await fetch(WEB3FORMS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        signal: AbortSignal.timeout(15000),
        // Field names are in French: they label the email the clinic receives.
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          // Fixed French subject so the clinic can scan its inbox at a glance.
          subject: `Nouvelle demande – ${values.name} – ${values.specialty}`,
          from_name: 'Site NAMA Polyclinic',
          'Nom': values.name,
          'Téléphone': values.phone,
          'Spécialité': values.specialty,
          'Message': values.message || '—',
          'Langue du site': locale.toUpperCase(),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) throw new Error(result.message || `Web3Forms returned ${response.status}`);
      form.reset();
      setFormStatus('sent');
    } catch (error) {
      console.error('Contact form could not be sent:', error);
      setFailedRequest(values);
      setFormStatus('error');
    }
  };
  const requestWhatsappLink = (values: Record<FormField, string>) => whatsappLink([
    copy.contact.whatsappRequestTitle,
    `${copy.contact.name.replace(/\s*\*$/, '')}: ${values.name}`,
    `${copy.contact.phoneLabel.replace(/\s*\*$/, '')}: ${values.phone}`,
    `${copy.contact.specialty.replace(/\s*\*$/, '')}: ${values.specialty}`,
    ...(values.message ? [`${copy.contact.message}: ${values.message}`] : []),
  ].join('\n'));
  const fieldErrorProps = (field: FormField) => fieldErrors[field]
    ? { 'aria-invalid': true, 'aria-describedby': `${field}-error` }
    : {};
  const fieldError = (field: FormField) => fieldErrors[field] && (
    <span className="field-error" id={`${field}-error`}>{copy.contact.errors[fieldErrors[field]!]}</span>
  );
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  return (
    <div ref={revealRoot} className={`site ${isLanguageSwitching ? 'is-language-switching' : ''}`}>
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-shell">
          <a href="#accueil" className="brand-lockup" onClick={closeMenu} data-testid="link-logo-home" aria-label={copy.logoAlt}>
              <img src={topLogo} alt={copy.logoAlt} />
          </a>
          <nav className={`nav-links ${menuOpen ? 'open' : ''}`} aria-label={copy.nav.home}>
            {navItems.map(({ key, href, testId }) => (
              <a key={href} href={href} onClick={closeMenu} data-testid={`link-nav-${testId}`}>{copy.nav[key]}</a>
            ))}
          </nav>
          <div className="header-actions">
            <div className="language-switcher" role="group" aria-label={copy.languageLabel}>
              {locales.map((option) => (
                <button key={option} type="button" className={locale === option ? 'active' : ''} onClick={() => changeLocale(option)} aria-pressed={locale === option}>
                  {option === 'ar' ? 'عربي' : option.toUpperCase()}
                </button>
              ))}
            </div>
            <a className="phone-link" href={CLINIC_PHONE.tel} data-testid="link-header-phone">{phoneText}</a>
            <a href="#contact" className="button button-primary" data-testid="button-header-book">{copy.hero.book} <ArrowUpRight size={14} /></a>
            <button className="menu-button" type="button" onClick={() => setMenuOpen((value) => !value)} data-testid="button-mobile-menu" aria-expanded={menuOpen} aria-label={menuOpen ? (locale === 'ar' ? 'إغلاق القائمة' : locale === 'en' ? 'Close menu' : 'Fermer le menu') : (locale === 'ar' ? 'فتح القائمة' : locale === 'en' ? 'Open menu' : 'Ouvrir le menu')}>
              {menuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section id="accueil" className="hero">
          <div className="container hero-grid">
            <div className="reveal">
              <div className="eyebrow">{copy.hero.eyebrow}</div>
              <h1 className="display">{copy.hero.heading[0]}<br /><em>{copy.hero.heading[1]}</em></h1>
              <p className="hero-lead">{copy.hero.lead}</p>
              <div className="hero-ctas">
                <a className="button button-primary" href="#contact" data-testid="button-hero-book">{copy.hero.book} <ArrowUpRight size={15} /></a>
                <a className="button button-outline" href="#services" data-testid="button-hero-services">{copy.hero.services} <ChevronRight size={15} /></a>
              </div>
              <div className="hero-note"><span><HeartHandshake size={16} /></span> {copy.hero.note}</div>
            </div>
             <div className="hero-visual reveal reveal-delay-2">
               <div className="hero-organic-art">
                 <img className="hero-mark" src={namaIcon} alt={copy.hero.markAlt} />
               </div>
             </div>
          </div>
        </section>

        <section id="a-propos" className="section about olive-band">
          <div className="container about-grid">
            <div className="about-mark reveal">
               <BrandMark ariaLabel={copy.about.markAlt} />
            </div>
            <div className="reveal reveal-delay-1">
               <div className="eyebrow">{copy.about.eyebrow}</div>
               <h2 className="display">{copy.about.heading[0]}<br />{copy.about.heading[1]}</h2>
               <p className="about-copy">{copy.about.copy}</p>
              <div className="trust-grid">
                 {copy.about.trust.map(({ title, description }, index) => {
                   const TrustIcon = [ShieldCheck, HeartHandshake, Stethoscope, Clock3][index];
                   return <div className="trust-item" key={index}><TrustIcon size={19} /><strong>{title}</strong><span>{description}</span></div>;
                 })}
              </div>
            </div>
          </div>
        </section>

        <section className="section clinic-story" aria-labelledby="clinic-title">
          <div className="container clinic-grid">
            <div className="clinic-copy reveal">
               <div className="eyebrow">{copy.clinic.eyebrow}</div>
               <h2 id="clinic-title">{copy.clinic.heading[0]}<br /><em>{copy.clinic.heading[1]}</em></h2>
               <p>{copy.clinic.copy}</p>
               <a href="#a-propos" className="mini-link" data-testid="link-clinic-about">{copy.clinic.link} <ArrowUpRight size={13} /></a>
            </div>
            <div className="clinic-visual reveal reveal-delay-1">
               <div className="building-photo-slot" data-testid="photo-slot-building" aria-label={copy.clinic.photo}>
                <div className="photo-slot-icon"><ImagePlus size={22} /></div>
                 <span>{copy.clinic.photo}</span>
                 <small>{copy.clinic.photoNote}</small>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="section services">
          <div className="container">
            <div className="services-header reveal">
              <div className="section-heading">
                 <div className="eyebrow">{copy.services.eyebrow}</div>
                 <h2>{copy.services.heading[0]}<br /><em>{copy.services.heading[1]}</em></h2>
                 <p>{copy.services.copy}</p>
              </div>
                <div className="service-index">{copy.services.index}</div>
            </div>
            <div className="service-grid">
               {specialtyKeys.map((key, index) => {
                 const specialty = copy.services.specialties[key];
                 return <article className={`service-card reveal reveal-delay-${(index % 3) + 1}`} key={key} data-testid={`card-service-${index}`}>
                   <span className="service-index">{String(index + 1).padStart(2, '0')}</span>
                   <div className="icon-circle"><SpecialtyIcon kind={key} /></div>
                   <h3>{specialty.title}{key === 'leaf' && <><br /><span>{copy.services.nutritionSuffix}</span></>}</h3>
                  <p className="service-desc">{specialty.description}</p>
                  <span className="sr-only">{specialty.detail}</span>
                 </article>;
               })}
            </div>
          </div>
        </section>

        <section id="equipe" className="section team">
          <div className="container">
            <div className="section-heading reveal">
               <div className="eyebrow">{copy.team.eyebrow}</div>
               <h2>{copy.team.heading[0]}<br /><em>{copy.team.heading[1]}</em></h2>
               <p>{copy.team.copy}</p>
            </div>
            <div className="founders-grid">
              {copy.team.founders.map((person, index) => (
                <PersonCard key={person.name} person={person} group="founder" index={index} copy={copy.team} open={openPerson === person.name} onToggle={() => togglePerson(person.name)} />
              ))}
            </div>
            {copy.team.members.length > 0 && (
              <div className="team-members">
                <div className="section-heading reveal"><h2>{copy.team.teamHeading[0]} <em>{copy.team.teamHeading[1]}</em></h2></div>
                <div className="team-grid">
                  {copy.team.members.map((person, index) => (
                    <PersonCard key={person.name} person={person} group="team" index={index} copy={copy.team} open={openPerson === person.name} onToggle={() => togglePerson(person.name)} />
                  ))}
                </div>
              </div>
            )}
            {copy.team.support.length > 0 && (
              <div className="team-members support-members">
                <div className="section-heading reveal"><h2>{copy.team.supportHeading[0] && <>{copy.team.supportHeading[0]} </>}<em>{copy.team.supportHeading[1]}</em></h2></div>
                <div className="support-grid">
                  {copy.team.support.map((person, index) => (
                    <PersonCard key={person.name} person={person} group="support" index={index} copy={copy.team} open={openPerson === person.name} onToggle={() => togglePerson(person.name)} />
                  ))}
                </div>
              </div>
            )}
              <div className="team-foot reveal"><span>{copy.team.foot}</span><a href={whatsappLink(copy.team.professionalMessage)} target="_blank" rel="noreferrer" className="mini-link" data-testid="link-team-professional">{copy.team.professionalLink} <ArrowUpRight size={13} /></a></div>
          </div>
        </section>

        <section id="parcours" className="section steps" aria-labelledby="steps-title">
          <div className="container">
            <div className="section-heading reveal">
               <div className="eyebrow">{copy.steps.eyebrow}</div>
               <h2 id="steps-title">{copy.steps.heading[0]}<br />{copy.steps.heading[1]}</h2>
               <p>{copy.steps.copy}</p>
            </div>
            <div className="steps-grid">
               {copy.steps.items.map(({ title, text }, index) => (
                 <div className={`step reveal reveal-delay-${(index % 3) + 1}`} key={index}><div className="step-number">{String(index + 1).padStart(2, '0')}</div><h3>{title}</h3><p>{text}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section id="temoignages" className="section testimonials" aria-labelledby="testimonials-title">
          <div className="container">
            <div className="section-heading reveal">
               <div className="eyebrow">{copy.testimonials.eyebrow}</div>
               <h2 id="testimonials-title">{copy.testimonials.heading[0]}<br /><em>{copy.testimonials.heading[1]}</em></h2>
            </div>
            <div className="testimonial-grid">
               {copy.testimonials.cards.map(({ quote, text, cite }, index) => (
                 <article className={`quote-card reveal reveal-delay-${index + 1}`} key={index} data-testid={`card-testimonial-${index}`}>
                   <div><span className="placeholder-label">{copy.testimonials.reserved}</span><div className="quote-mark">“</div><blockquote>{quote}<br /><small>{text}</small></blockquote></div><cite>{cite}</cite>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="section faq">
          <div className="container faq-grid">
            <div className="faq-intro reveal"><div className="eyebrow">{copy.faq.eyebrow}</div><h2 className="display">{copy.faq.heading[0]}<br /><em>{copy.faq.heading[1]}</em></h2><p>{copy.faq.copy}</p><a href="#contact" className="button button-outline" data-testid="button-faq-contact">{copy.faq.contact} <ArrowUpRight size={14} /></a></div>
            <div className="faq-list reveal reveal-delay-1">
              {copy.faq.items.map(({ question, answer }, index) => (
                <details className="faq-item" key={index} open={index === 0}>
                  <summary data-testid={`button-faq-${index}`}>{question}<Plus size={19} strokeWidth={1.5} /></summary>
                  <div className="faq-answer">{answer}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="section contact">
          <div className="container contact-grid">
            <div className="reveal">
              <div className="eyebrow">{copy.contact.eyebrow}</div>
              <h2 className="display">{copy.contact.heading[0]}<br />{copy.contact.heading[1]}</h2>
              <p className="contact-intro">{copy.contact.intro}</p>
              <div className="contact-details">
                <div className="contact-detail"><Phone size={18} /><div><strong>{copy.contact.phone}</strong><a href={CLINIC_PHONE.tel} data-testid="link-contact-phone">{phoneText}</a></div></div>
                <div className="contact-detail"><MessageCircle size={18} /><div><strong>{copy.footer.whatsapp}</strong><a href={CLINIC_PHONE.whatsapp} target="_blank" rel="noreferrer" data-testid="link-contact-whatsapp">{copy.contact.whatsapp}</a></div></div>
                <div className="contact-detail"><MapPin size={18} /><div><strong>{copy.contact.location}</strong><span>{copy.contact.address.join(', ')}</span></div></div>
              </div>
              <div className="contact-socials"><a href="https://www.instagram.com/namapolyclinic" target="_blank" rel="noreferrer" className="social-link" aria-label={copy.contact.instagramAria} data-testid="link-instagram"><Instagram size={17} /></a><a href={CLINIC_PHONE.whatsapp} target="_blank" rel="noreferrer" className="social-link" aria-label={copy.contact.whatsappAria} data-testid="link-whatsapp"><MessageCircle size={17} /></a><a href="https://maps.google.com/?q=WH5P%2B62F%20Jal%20El%20Dib%20Lebanon" target="_blank" rel="noreferrer" className="social-link" aria-label={copy.contact.directionsAria} data-testid="link-directions"><Navigation size={17} /></a></div>
            </div>
            <div className="contact-column reveal reveal-delay-1">
              <div className="contact-form">
                {formStatus === 'sent' ? (
                  <div className="form-success" role="status" data-testid="status-form-success">
                    <Check size={28} />
                    <h3 className="display">{copy.contact.successHeading}</h3>
                    <p>{copy.contact.successCopy}</p>
                    <div className="form-success-actions">
                      <button type="button" className="button button-outline" onClick={resetContactForm} data-testid="button-form-new">{copy.contact.newMessage}</button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={submitForm} onChange={clearFieldError} noValidate aria-busy={formStatus === 'sending'} data-testid="form-contact">
                    <h3 className="display">{copy.contact.formHeading}</h3>
                    <div className="form-grid">
                      <div className="field"><label htmlFor="name">{copy.contact.name}</label><input id="name" name="name" type="text" autoComplete="name" maxLength={NAME_MAX} placeholder={copy.contact.namePlaceholder} data-testid="input-name" required {...fieldErrorProps('name')} />{fieldError('name')}</div>
                      <div className="field"><label htmlFor="phone">{copy.contact.phoneLabel}</label><input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder={copy.contact.phonePlaceholder} data-testid="input-phone" required {...fieldErrorProps('phone')} />{fieldError('phone')}</div>
                      <div className="field"><label htmlFor="specialty">{copy.contact.specialty}</label><select id="specialty" name="specialty" defaultValue="" data-testid="select-specialty" required {...fieldErrorProps('specialty')}><option value="" disabled>{copy.contact.specialtyPlaceholder}</option>{copy.contact.specialtyOptions.map((option) => <option key={option}>{option}</option>)}</select>{fieldError('specialty')}</div>
                      <div className="field full"><label htmlFor="message">{copy.contact.message}</label><textarea id="message" name="message" placeholder={copy.contact.messagePlaceholder} data-testid="textarea-message" {...fieldErrorProps('message')} />{fieldError('message')}</div>
                      <input type="checkbox" name="botcheck" className="sr-only" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                    </div>
                    {hasFieldErrors && <div className="form-error-summary" role="alert" data-testid="status-form-error">{copy.contact.errors.summary}</div>}
                    {formStatus === 'error' && (
                      <div className="form-send-error" role="alert" data-testid="status-form-send-error">
                        <AlertCircle size={18} />
                        <div>
                          <strong>{copy.contact.errorHeading}</strong>
                          <span>{withPhone(copy.contact.errorCopy)}</span>
                          {failedRequest && <a href={requestWhatsappLink(failedRequest)} target="_blank" rel="noreferrer" className="button button-primary form-send-error-whatsapp" data-testid="link-form-error-whatsapp"><MessageCircle size={14} /> {copy.contact.openWhatsApp}</a>}
                        </div>
                      </div>
                    )}
                    <div className="form-actions"><span className="form-note" data-testid="text-form-privacy">{copy.contact.privacyNote} <a href={legalHref('privacy')} data-testid="link-form-privacy">{copy.contact.privacyLink}</a></span><button type="submit" className="button button-primary" disabled={formStatus === 'sending'} data-testid="button-submit-contact">{formStatus === 'sending' ? <>{copy.contact.submitting} <Loader2 size={14} className="spin" /></> : <>{copy.contact.submit} <Send size={14} /></>}</button></div>
                  </form>
                )}
              </div>
              <div className="contact-whatsapp" data-testid="block-contact-whatsapp">
                <div>
                  <strong>{copy.contact.whatsappHeading}</strong>
                  <p>{copy.contact.whatsappNote.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</p>
                </div>
                <a href={whatsappLink(copy.contact.whatsappGreeting)} target="_blank" rel="noreferrer" className="button button-light" data-testid="link-contact-form-whatsapp"><MessageCircle size={15} /> {copy.contact.whatsappButton}</a>
              </div>
            </div>
          </div>
        </section>

        <section className="location" aria-label={copy.location.ariaLabel}>
          <div className="container location-grid">
            <iframe className="map-frame" title={copy.contact.mapTitle} src="https://www.google.com/maps?q=WH5P%2B62F%20Jal%20El%20Dib%20Lebanon&output=embed" loading="lazy" data-testid="map-location" />
            <div className="hours-card reveal"><div className="eyebrow">{copy.location.eyebrow}</div><h3>{copy.location.heading}</h3><div className="hours-row"><span>{copy.location.weekdays}</span><span>{copy.location.weekdayHours}</span></div><div className="hours-row"><span>{copy.location.sunday}</span><span>{copy.location.closed}</span></div><a href="#contact" className="mini-link" data-testid="link-hours-book">{copy.location.link} <ArrowUpRight size={13} /></a></div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div><img className="footer-logo" src={topLogo} alt={copy.logoAlt} /><p className="footer-copy">{copy.footer.copy}</p></div>
            <div><h3>{copy.footer.explore}</h3><div className="footer-links">{navItems.slice(0, 6).map(({ key, href, testId }) => <a key={href} href={href} data-testid={`link-footer-${testId}`}>{copy.nav[key]}</a>)}</div></div>
            <div><h3>{copy.footer.findUs}</h3><div className="footer-contact"><a href={CLINIC_PHONE.tel} data-testid="link-footer-phone">{phoneText}</a><a href={CLINIC_PHONE.whatsapp} target="_blank" rel="noreferrer" data-testid="link-footer-whatsapp">{copy.footer.whatsapp}</a><a href="https://www.instagram.com/namapolyclinic" target="_blank" rel="noreferrer" data-testid="link-footer-instagram">@namapolyclinic</a><span>{copy.contact.address[0]}<br />{copy.contact.address[1]}</span></div></div>
          </div>
          <div className="footer-bottom"><span>© {new Date().getFullYear()} NAMA Polyclinic. {copy.footer.rights}</span><span className="footer-legal"><a href={legalHref('privacy')} data-testid="link-footer-privacy">{copy.footer.privacy}</a><a href={legalHref('legal')} data-testid="link-footer-legal">{copy.footer.legal}</a></span><span>{copy.footer.tagline}</span></div>
        </div>
      </footer>
      <a href="#contact" className="button button-primary mobile-book" data-testid="button-mobile-book"><MessageCircle size={17} /> {copy.hero.book}</a>
    </div>
  );
}

export default function App() {
  const legalPage = legalPageFromLocation();
  return legalPage ? <LegalPage page={legalPage} /> : <Home />;
}
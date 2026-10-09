import { useEffect, useRef, useState, type FormEvent } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Clock3,
  HeartHandshake,
  ImagePlus,
  Instagram,
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
import { TooltipProvider } from '@/components/ui/tooltip';

import topLogo from './assets/nama-top-logo.png';
import namaIcon from './assets/nama-icon.png';
import './index.css';

const queryClient = new QueryClient();

type Locale = 'fr' | 'en' | 'ar';
type NavKey = 'home' | 'about' | 'services' | 'team' | 'testimonials' | 'faq' | 'contact';
type SpecialtyKey = 'speech' | 'mind' | 'motion' | 'leaf';

const navItems: { key: NavKey; href: string; testId: string }[] = [
  { key: 'home', href: '#accueil', testId: 'accueil' },
  { key: 'about', href: '#a-propos', testId: 'à-propos' },
  { key: 'services', href: '#services', testId: 'nos-services' },
  { key: 'team', href: '#equipe', testId: 'notre-équipe' },
  { key: 'testimonials', href: '#temoignages', testId: 'témoignages' },
  { key: 'faq', href: '#faq', testId: 'faq' },
  { key: 'contact', href: '#contact', testId: 'contact' },
];

const specialtyKeys: SpecialtyKey[] = ['speech', 'mind', 'motion', 'leaf'];

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
    action: string;
    specialties: Record<SpecialtyKey, { title: string; description: string; detail: string }>;
  };
  team: {
    eyebrow: string;
    heading: [string, string];
    copy: string;
    members: { name: string; specialty: string; bio: string }[];
    photo: string;
    portraitAlt: string;
    foot: string;
    professionalLink: string;
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
    requiredError: string;
    formNote: string;
    whatsappMessageTitle: string;
    submit: string;
    successHeading: string;
    successCopy: string;
    openWhatsApp: string;
    newMessage: string;
  };
  location: {
    eyebrow: string;
    heading: string;
    weekdays: string;
    weekdayHours: string;
    sunday: string;
    closed: string;
    link: string;
  };
  footer: {
    copy: string;
    explore: string;
    findUs: string;
    whatsapp: string;
    rights: string;
    tagline: string;
  };
  meta: { title: string; description: string; keywords: string };
}

const translations: Record<Locale, LocaleCopy> = {
  fr: {
    languageLabel: 'Langue du site',
    logoAlt: 'Logo original de NAMA Polyclinic',
    nav: { home: 'Accueil', about: 'À propos', services: 'Nos services', team: 'Notre équipe', testimonials: 'Témoignages', faq: 'FAQ', contact: 'Contact' },
    hero: {
      eyebrow: 'Polyclinique médicale & paramédicale',
      heading: ['Avancer,', 'ensemble.'],
      lead: 'Un lieu doux et pluridisciplinaire à Jal El Dib, où chaque personne, enfant ou adulte, est accueillie avec attention.',
      book: 'Prendre rendez vous',
      services: 'Découvrir nos spécialités',
      note: 'Parce que chaque parcours compte.',
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
      index: '04 disciplines, 01 intention',
      action: 'Parler à un spécialiste',
      specialties: {
        speech: { title: 'Orthophonie', description: 'Accompagner la parole, le langage et la déglutition, à chaque âge. Un espace pour retrouver confiance dans sa voix et ses échanges.', detail: 'Articulation, retard de langage, bégaiement, troubles de la communication et de la déglutition.' },
        mind: { title: 'Psychologie', description: 'Écouter ce qui se vit, mettre des mots sur ce qui pèse et avancer avec un accompagnement ajusté aux enfants comme aux adultes.', detail: 'Soutien émotionnel, thérapie individuelle, difficultés comportementales et accompagnement familial.' },
        motion: { title: 'Psychomotricité', description: 'Faire grandir la coordination, l’équilibre et le lien entre le corps et les émotions, principalement chez l’enfant.', detail: 'Développement moteur, intégration sensorielle, graphomotricité et rééducation adaptée.' },
        leaf: { title: 'Diététique', description: 'Une nutrition concrète, personnalisée et sans jugement pour prendre soin de soi et de sa famille au quotidien.', detail: 'Plans alimentaires, gestion du poids, régimes thérapeutiques et conseils en nutrition familiale.' },
      },
    },
    team: {
      eyebrow: 'Notre équipe',
      heading: ['Des personnes', 'avant des titres.'],
      copy: 'Chaque professionnel apporte son expertise, sa sensibilité et le temps nécessaire pour créer une relation de confiance.',
      members: [
        { name: 'Marie-Ange Abou Chrouche', specialty: 'Orthophoniste', bio: 'Langage, communication et apprentissages dans un cadre encourageant.' },
        { name: 'Nour Asmar', specialty: 'Psychomotricienne', bio: 'Le mouvement comme point de départ pour grandir et retrouver son équilibre.' },
      ],
      photo: 'Photo à ajouter',
      portraitAlt: 'Portrait placeholder du membre de l’équipe',
      foot: 'La famille NAMA grandit avec les besoins de la communauté.',
      professionalLink: 'Vous êtes un professionnel de santé ?',
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
      instagramAria: 'Instagram de NAMA Polyclinic',
      whatsappAria: 'WhatsApp de NAMA Polyclinic',
      directionsAria: 'Itinéraire vers NAMA Polyclinic',
      mapTitle: 'Localisation de NAMA Polyclinic à Jal El Dib',
      formHeading: 'Dites bonjour à NAMA.',
      name: 'Nom complet *',
      namePlaceholder: 'Votre nom',
      phoneLabel: 'Téléphone *',
      phonePlaceholder: '78 87 68 25',
      specialty: 'Je cherche *',
      specialtyPlaceholder: 'Choisir une spécialité',
      specialtyOptions: ['Orthophonie', 'Psychologie', 'Psychomotricité', 'Diététique / Nutrition', 'Je ne sais pas encore'],
      message: 'Votre message',
      messagePlaceholder: 'Quelques mots sur votre demande (facultatif)',
      requiredError: 'Merci de compléter les champs obligatoires.',
      formNote: 'Votre demande s’ouvrira dans WhatsApp.\nAppuyez sur Envoyer pour la transmettre à NAMA.',
      whatsappMessageTitle: 'Demande de rendez-vous — NAMA',
      submit: 'Continuer sur WhatsApp',
      successHeading: 'Votre demande est prête sur WhatsApp.',
      successCopy: 'Le message est prérempli. Appuyez sur Envoyer dans WhatsApp pour transmettre votre demande à NAMA.',
      openWhatsApp: 'Ouvrir WhatsApp',
      newMessage: 'Envoyer un autre message',
    },
    location: {
      eyebrow: 'Avant de venir',
      heading: 'On vous attend.',
      weekdays: 'Du lundi au samedi',
      weekdayHours: '08:00 à 20:00',
      sunday: 'Dimanche',
      closed: 'Fermé',
      link: 'Choisir un créneau',
    },
    footer: {
      copy: 'Une polyclinique médicale et paramédicale où chaque parcours est accueilli avec soin.',
      explore: 'Explorer',
      findUs: 'Nous trouver',
      whatsapp: 'WhatsApp',
      rights: 'Tous droits réservés.',
      tagline: 'Medical and paramedical care, with meaning.',
    },
    meta: {
      title: 'NAMA Polyclinic | Soins médicaux à Jal El Dib',
      description: 'NAMA Polyclinic, polyclinique médicale et paramédicale à Jal El Dib. Orthophonie, psychologie, psychomotricité et diététique.',
      keywords: 'polyclinique Jal El Dib, orthophonie, psychologie, psychomotricité, diététique, nutrition, Lebanon',
    },
  },
  en: {
    languageLabel: 'Website language',
    logoAlt: 'Original NAMA Polyclinic logo',
    nav: { home: 'Home', about: 'About', services: 'Services', team: 'Our team', testimonials: 'Testimonials', faq: 'FAQ', contact: 'Contact' },
    hero: {
      eyebrow: 'Medical & paramedical clinic',
      heading: ['Moving forward,', 'together.'],
      lead: 'A warm, multidisciplinary place in Jal El Dib, where every person, child or adult, is welcomed with care.',
      book: 'Book an appointment',
      services: 'Discover our specialties',
      note: 'Because every journey matters.',
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
      index: '04 disciplines, 01 intention',
      action: 'Talk to a specialist',
      specialties: {
        speech: { title: 'Speech therapy', description: 'Supporting speech, language and swallowing at every age. A space to rebuild confidence in your voice and your connections.', detail: 'Articulation, language delay, stuttering, communication and swallowing difficulties.' },
        mind: { title: 'Psychology', description: 'Making space for what you are experiencing, putting words to what weighs on you and moving forward with support tailored to children and adults.', detail: 'Emotional support, individual therapy, behavioral challenges and family support.' },
        motion: { title: 'Psychomotor therapy', description: 'Nurturing coordination, balance and the connection between body and emotions, especially in children.', detail: 'Motor development, sensory integration, graphomotor skills and adapted rehabilitation.' },
        leaf: { title: 'Dietetics', description: 'Practical, personalized and judgment-free nutrition to care for yourself and your family every day.', detail: 'Meal plans, weight management, therapeutic diets and family nutrition guidance.' },
      },
    },
    team: {
      eyebrow: 'Our team',
      heading: ['People', 'before titles.'],
      copy: 'Every professional brings expertise, sensitivity and the time it takes to build a trusting relationship.',
      members: [
        { name: 'Marie-Ange Abou Chrouche', specialty: 'Speech therapist', bio: 'Language, communication and learning in an encouraging setting.' },
        { name: 'Nour Asmar', specialty: 'Psychomotor therapist', bio: 'Movement as a starting point to grow and find balance again.' },
      ],
      photo: 'Photo coming soon',
      portraitAlt: 'Team member portrait placeholder',
      foot: 'The NAMA family grows with the needs of our community.',
      professionalLink: 'Are you a healthcare professional?',
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
      instagramAria: 'NAMA Polyclinic on Instagram',
      whatsappAria: 'NAMA Polyclinic on WhatsApp',
      directionsAria: 'Directions to NAMA Polyclinic',
      mapTitle: 'Location of NAMA Polyclinic in Jal El Dib',
      formHeading: 'Say hello to NAMA.',
      name: 'Full name *',
      namePlaceholder: 'Your name',
      phoneLabel: 'Phone *',
      phonePlaceholder: '78 87 68 25',
      specialty: 'I am looking for *',
      specialtyPlaceholder: 'Choose a specialty',
      specialtyOptions: ['Speech therapy', 'Psychology', 'Psychomotor therapy', 'Dietetics / Nutrition', 'I am not sure yet'],
      message: 'Your message',
      messagePlaceholder: 'A few words about your request (optional)',
      requiredError: 'Please complete the required fields.',
      formNote: 'Your request will open in WhatsApp.\nTap Send to deliver it to NAMA.',
      whatsappMessageTitle: 'Appointment request — NAMA',
      submit: 'Continue to WhatsApp',
      successHeading: 'Your request is ready in WhatsApp.',
      successCopy: 'The message is prefilled. Tap Send in WhatsApp to deliver your request to NAMA.',
      openWhatsApp: 'Open WhatsApp',
      newMessage: 'Send another message',
    },
    location: {
      eyebrow: 'Before you visit',
      heading: 'We are here for you.',
      weekdays: 'Monday to Saturday',
      weekdayHours: '08:00 to 20:00',
      sunday: 'Sunday',
      closed: 'Closed',
      link: 'Choose a time',
    },
    footer: {
      copy: 'A medical and paramedical clinic where every journey is welcomed with care.',
      explore: 'Explore',
      findUs: 'Find us',
      whatsapp: 'WhatsApp',
      rights: 'All rights reserved.',
      tagline: 'Medical and paramedical care, with meaning.',
    },
    meta: {
      title: 'NAMA Polyclinic | Medical care in Jal El Dib',
      description: 'NAMA Polyclinic, a medical and paramedical clinic in Jal El Dib. Speech therapy, psychology, psychomotor therapy and dietetics.',
      keywords: 'Jal El Dib clinic, speech therapy, psychology, psychomotor therapy, dietetics, nutrition, Lebanon',
    },
  },
  ar: {
    languageLabel: 'لغة الموقع',
    logoAlt: 'الشعار الأصلي لعيادة ناما',
    nav: { home: 'الرئيسية', about: 'عن ناما', services: 'خدماتنا', team: 'فريقنا', testimonials: 'آراء وتجارب', faq: 'الأسئلة الشائعة', contact: 'تواصل معنا' },
    hero: {
      eyebrow: 'عيادة طبية وشبه طبية',
      heading: ['نتقدّم،', 'معاً.'],
      lead: 'مساحة دافئة ومتعددة الاختصاصات في جل الديب، نرحّب فيها بكل شخص، طفلاً كان أم بالغاً، بعناية واهتمام.',
      book: 'احجزوا موعداً',
      services: 'اكتشفوا اختصاصاتنا',
      note: 'لأن كل مسيرة تستحق الاهتمام.',
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
      index: '04 اختصاصات، 01 غاية',
      action: 'تحدثوا إلى اختصاصي',
      specialties: {
        speech: { title: 'علاج النطق واللغة', description: 'دعم الكلام واللغة والبلع في كل عمر، ضمن مساحة لاستعادة الثقة بالصوت والتواصل.', detail: 'النطق، تأخر اللغة، التأتأة، صعوبات التواصل والبلع.' },
        mind: { title: 'علم النفس', description: 'الإصغاء إلى ما تعيشونه، ووضع كلمات لما يثقل عليكم، والتقدم بدعم يناسب الأطفال والبالغين.', detail: 'الدعم العاطفي، العلاج الفردي، الصعوبات السلوكية والدعم العائلي.' },
        motion: { title: 'العلاج النفسي الحركي', description: 'تنمية التنسيق والتوازن والعلاقة بين الجسد والمشاعر، ولا سيما لدى الأطفال.', detail: 'النمو الحركي، التكامل الحسي، المهارات الحركية الدقيقة وإعادة التأهيل الملائمة.' },
        leaf: { title: 'علم التغذية', description: 'تغذية عملية وشخصية ومن دون أحكام للعناية بكم وبعائلتكم كل يوم.', detail: 'خطط غذائية، إدارة الوزن، حميات علاجية وإرشادات للتغذية العائلية.' },
      },
    },
    team: {
      eyebrow: 'فريقنا',
      heading: ['أشخاص', 'قبل الألقاب.'],
      copy: 'يقدّم كل اختصاصي خبرته وحساسيته والوقت اللازم لبناء علاقة قائمة على الثقة.',
      members: [
        { name: 'Marie-Ange Abou Chrouche', specialty: 'اختصاصية في علاج النطق واللغة', bio: 'اللغة والتواصل والتعلّم ضمن بيئة مشجّعة.' },
        { name: 'Nour Asmar', specialty: 'اختصاصية في العلاج النفسي الحركي', bio: 'الحركة كنقطة انطلاق للنمو واستعادة التوازن.' },
      ],
      photo: 'ستُضاف الصورة قريباً',
      portraitAlt: 'صورة مؤقتة لأحد أعضاء الفريق',
      foot: 'تنمو عائلة ناما مع احتياجات مجتمعنا.',
      professionalLink: 'هل أنتم من العاملين في مجال الرعاية الصحية؟',
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
      instagramAria: 'حساب ناما على إنستغرام',
      whatsappAria: 'حساب ناما على واتساب',
      directionsAria: 'الاتجاهات إلى عيادة ناما',
      mapTitle: 'موقع عيادة ناما في جل الديب',
      formHeading: 'ألقوا التحية على ناما.',
      name: 'الاسم الكامل *',
      namePlaceholder: 'اسمكم',
      phoneLabel: 'الهاتف *',
      phonePlaceholder: '78 87 68 25',
      specialty: 'أبحث عن *',
      specialtyPlaceholder: 'اختاروا اختصاصاً',
      specialtyOptions: ['علاج النطق واللغة', 'علم النفس', 'العلاج النفسي الحركي', 'التغذية / علم التغذية', 'لست متأكداً بعد'],
      message: 'رسالتكم',
      messagePlaceholder: 'بضع كلمات عن طلبكم (اختياري)',
      requiredError: 'يرجى إكمال الحقول المطلوبة.',
      formNote: 'سيتم فتح طلبكم في واتساب.\nاضغطوا على إرسال لإيصاله إلى ناما.',
      whatsappMessageTitle: 'طلب موعد — ناما',
      submit: 'المتابعة إلى واتساب',
      successHeading: 'طلبكم جاهز في واتساب.',
      successCopy: 'الرسالة مُعبأة مسبقاً. اضغطوا على إرسال في واتساب لإيصال طلبكم إلى ناما.',
      openWhatsApp: 'فتح واتساب',
      newMessage: 'إرسال رسالة أخرى',
    },
    location: {
      eyebrow: 'قبل الزيارة',
      heading: 'نحن بانتظاركم.',
      weekdays: 'من الإثنين إلى السبت',
      weekdayHours: '08:00 حتى 20:00',
      sunday: 'الأحد',
      closed: 'مغلق',
      link: 'اختيار موعد',
    },
    footer: {
      copy: 'عيادة طبية وشبه طبية نرحّب فيها بكل مسيرة بعناية.',
      explore: 'استكشفوا',
      findUs: 'موقعنا',
      whatsapp: 'واتساب',
      rights: 'جميع الحقوق محفوظة.',
      tagline: 'رعاية طبية وشبه طبية، بمعنى.',
    },
    meta: {
      title: 'عيادة ناما | رعاية طبية في جل الديب',
      description: 'عيادة ناما الطبية وشبه الطبية في جل الديب. علاج النطق واللغة، علم النفس، العلاج النفسي الحركي والتغذية.',
      keywords: 'عيادة جل الديب، علاج النطق واللغة، علم النفس، العلاج النفسي الحركي، التغذية، لبنان',
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

function Home() {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'fr';
    const queryLocale = new URLSearchParams(window.location.search).get('lang');
    if (queryLocale === 'fr' || queryLocale === 'en' || queryLocale === 'ar') return queryLocale;
    const savedLocale = window.localStorage.getItem('nama-locale');
    return savedLocale === 'en' || savedLocale === 'ar' ? savedLocale : 'fr';
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [isLanguageSwitching, setIsLanguageSwitching] = useState(false);
  const revealRoot = useRef<HTMLDivElement>(null);
  const copy = translations[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    window.localStorage.setItem('nama-locale', locale);
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
    root.querySelectorAll('.reveal').forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

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

  const closeMenu = () => setMenuOpen(false);
  const changeLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    setIsLanguageSwitching(true);
    setLocale(nextLocale);
    window.setTimeout(() => setIsLanguageSwitching(false), 180);
  };
  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const specialty = String(data.get('specialty') || '').trim();
    const message = String(data.get('message') || '').trim();
    if (!name || !phone || !specialty) {
      setFormError(copy.contact.requiredError);
      return;
    }
    const whatsappMessage = [
      copy.contact.whatsappMessageTitle,
      `${copy.contact.name.replace(/\s*\*$/, '')}: ${name}`,
      `${copy.contact.phoneLabel.replace(/\s*\*$/, '')}: ${phone}`,
      `${copy.contact.specialty.replace(/\s*\*$/, '')}: ${specialty}`,
      ...(message ? [`${copy.contact.message}: ${message}`] : []),
    ].join('\n');
    const nextWhatsAppUrl = `https://wa.me/96178876825?text=${encodeURIComponent(whatsappMessage)}`;
    setWhatsappUrl(nextWhatsAppUrl);
    setSubmitted(true);
    form.reset();
    window.open(nextWhatsAppUrl, '_blank', 'noopener,noreferrer');
  };

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
              {(['fr', 'en', 'ar'] as Locale[]).map((option) => (
                <button key={option} type="button" className={locale === option ? 'active' : ''} onClick={() => changeLocale(option)} aria-pressed={locale === option}>
                  {option === 'ar' ? 'عربي' : option.toUpperCase()}
                </button>
              ))}
            </div>
            <a className="phone-link" href="tel:+96178876825" data-testid="link-header-phone">78 87 68 25</a>
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
                   return <div className="trust-item" key={title}><TrustIcon size={19} /><strong>{title}</strong><span>{description}</span></div>;
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
               <a href="#contact" className="mini-link" data-testid="link-clinic-contact">{copy.clinic.link} <ArrowUpRight size={13} /></a>
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
                   <h3>{specialty.title}{key === 'leaf' && <><br /><span>/ Nutrition</span></>}</h3>
                  <p className="service-desc">{specialty.description}</p>
                   <a href="#contact" className="mini-link" data-testid={`link-service-book-${index}`}>{copy.services.action} <ArrowUpRight size={13} /></a>
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
            <div className="team-grid">
               {copy.team.members.map(({ name, specialty, bio }, index) => (
                 <article className={`person-card reveal reveal-delay-${(index % 3) + 1}`} key={name} data-testid={`card-practitioner-${index}`}>
                   <div className="person-portrait" data-testid={`photo-slot-practitioner-${index}`} aria-label={`${copy.team.photo}: ${name}`}>
                    <div className="photo-slot-icon"><ImagePlus size={20} /></div>
                     <Portrait index={index} ariaLabel={copy.team.portraitAlt} />
                     <span className="photo-slot-label">{copy.team.photo}</span>
                  </div>
                  <h3>{name}</h3>
                  <div className="person-specialty">{specialty}</div>
                  <p className="person-bio">{bio}</p>
                </article>
              ))}
            </div>
              <div className="team-foot reveal"><span>{copy.team.foot}</span><a href="#contact" className="mini-link" data-testid="link-team-contact">{copy.team.professionalLink} <ArrowUpRight size={13} /></a></div>
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
                 <div className={`step reveal reveal-delay-${(index % 3) + 1}`} key={title}><div className="step-number">{String(index + 1).padStart(2, '0')}</div><h3>{title}</h3><p>{text}</p></div>
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
                 <article className={`quote-card reveal reveal-delay-${index + 1}`} key={cite} data-testid={`card-testimonial-${index}`}>
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
                <details className="faq-item" key={question} open={index === 0}>
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
                <div className="contact-detail"><Phone size={18} /><div><strong>{copy.contact.phone}</strong><a href="tel:+96178876825" data-testid="link-contact-phone">78 87 68 25</a></div></div>
                <div className="contact-detail"><MessageCircle size={18} /><div><strong>WhatsApp</strong><a href="https://wa.me/96178876825" target="_blank" rel="noreferrer" data-testid="link-contact-whatsapp">{copy.contact.whatsapp}</a></div></div>
                <div className="contact-detail"><MapPin size={18} /><div><strong>{copy.contact.location}</strong><span>WH5P+62F, Jal El Dib, Lebanon</span></div></div>
              </div>
              <div className="contact-socials"><a href="https://www.instagram.com/namapolyclinic" target="_blank" rel="noreferrer" className="social-link" aria-label={copy.contact.instagramAria} data-testid="link-instagram"><Instagram size={17} /></a><a href="https://wa.me/96178876825" target="_blank" rel="noreferrer" className="social-link" aria-label={copy.contact.whatsappAria} data-testid="link-whatsapp"><MessageCircle size={17} /></a><a href="https://maps.google.com/?q=WH5P%2B62F%20Jal%20El%20Dib%20Lebanon" target="_blank" rel="noreferrer" className="social-link" aria-label={copy.contact.directionsAria} data-testid="link-directions"><Navigation size={17} /></a></div>
            </div>
            <div className="contact-form reveal reveal-delay-1">
              {submitted ? (
                <div className="form-success" role="status" data-testid="status-form-success"><Check size={28} /><h3 className="display">{copy.contact.successHeading}</h3><p>{copy.contact.successCopy}</p><a href={whatsappUrl} target="_blank" rel="noreferrer" className="button button-primary" data-testid="link-form-open-whatsapp">{copy.contact.openWhatsApp} <MessageCircle size={14} /></a><button type="button" className="button button-outline" onClick={() => { setSubmitted(false); setWhatsappUrl(''); }} data-testid="button-form-new">{copy.contact.newMessage}</button></div>
              ) : (
                <form onSubmit={submitForm} noValidate data-testid="form-contact">
                  <h3 className="display">{copy.contact.formHeading}</h3>
                  <div className="form-grid">
                    <div className="field"><label htmlFor="name">{copy.contact.name}</label><input id="name" name="name" type="text" autoComplete="name" placeholder={copy.contact.namePlaceholder} data-testid="input-name" required /></div>
                    <div className="field"><label htmlFor="phone">{copy.contact.phoneLabel}</label><input id="phone" name="phone" type="tel" autoComplete="tel" placeholder={copy.contact.phonePlaceholder} data-testid="input-phone" required /></div>
                    <div className="field"><label htmlFor="specialty">{copy.contact.specialty}</label><select id="specialty" name="specialty" defaultValue="" data-testid="select-specialty" required><option value="" disabled>{copy.contact.specialtyPlaceholder}</option>{copy.contact.specialtyOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
                    <div className="field full"><label htmlFor="message">{copy.contact.message}</label><textarea id="message" name="message" placeholder={copy.contact.messagePlaceholder} data-testid="textarea-message" /></div>
                  </div>
                  {formError && <div className="field-error" role="alert" data-testid="status-form-error">{formError}</div>}
                  <div className="form-actions"><span className="form-note">{copy.contact.formNote.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</span><button type="submit" className="button button-primary" data-testid="button-submit-contact">{copy.contact.submit} <Send size={14} /></button></div>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="location" aria-label={`${copy.contact.location} et horaires`}>
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
            <div><h3>{copy.footer.explore}</h3><div className="footer-links">{navItems.slice(0, 5).map(({ key, href, testId }) => <a key={href} href={href} data-testid={`link-footer-${testId}`}>{copy.nav[key]}</a>)}</div></div>
            <div><h3>{copy.footer.findUs}</h3><div className="footer-contact"><a href="tel:+96178876825" data-testid="link-footer-phone">78 87 68 25</a><a href="https://wa.me/96178876825" target="_blank" rel="noreferrer" data-testid="link-footer-whatsapp">{copy.footer.whatsapp}</a><a href="https://www.instagram.com/namapolyclinic" target="_blank" rel="noreferrer" data-testid="link-footer-instagram">@namapolyclinic</a><span>WH5P+62F, Jal El Dib<br />Lebanon</span></div></div>
          </div>
          <div className="footer-bottom"><span>© {new Date().getFullYear()} NAMA Polyclinic. {copy.footer.rights}</span><span>{copy.footer.tagline}</span></div>
        </div>
      </footer>
      <a href="#contact" className="button button-primary mobile-book" data-testid="button-mobile-book"><MessageCircle size={17} /> {copy.hero.book}</a>
    </div>
  );
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><Home /></TooltipProvider></QueryClientProvider>;
}

export default App;
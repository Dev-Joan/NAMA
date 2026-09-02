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

const navItems = [
  ['Accueil', '#accueil'],
  ['À propos', '#a-propos'],
  ['Nos services', '#services'],
  ['Notre équipe', '#equipe'],
  ['Témoignages', '#temoignages'],
  ['FAQ', '#faq'],
  ['Contact', '#contact'],
];

const specialties = [
  {
    number: '01',
    title: 'Orthophonie',
    description: 'Accompagner la parole, le langage et la déglutition, à chaque âge. Un espace pour retrouver confiance dans sa voix et ses échanges.',
    detail: 'Articulation, retard de langage, bégaiement, troubles de la communication et de la déglutition.',
    icon: 'speech',
  },
  {
    number: '02',
    title: 'Psychologie',
    description: 'Écouter ce qui se vit, mettre des mots sur ce qui pèse et avancer avec un accompagnement ajusté aux enfants comme aux adultes.',
    detail: 'Soutien émotionnel, thérapie individuelle, difficultés comportementales et accompagnement familial.',
    icon: 'mind',
  },
  {
    number: '03',
    title: 'Psychomotricité',
    description: 'Faire grandir la coordination, l’équilibre et le lien entre le corps et les émotions, principalement chez l’enfant.',
    detail: 'Développement moteur, intégration sensorielle, graphomotricité et rééducation adaptée.',
    icon: 'motion',
  },
  {
    number: '04',
    title: 'Diététique',
    description: 'Une nutrition concrète, personnalisée et sans jugement pour prendre soin de soi et de sa famille au quotidien.',
    detail: 'Plans alimentaires, gestion du poids, régimes thérapeutiques et conseils en nutrition familiale.',
    icon: 'leaf',
  },
];

const faqs = [
  ['Acceptez vous les assurances ?', 'Les modalités de remboursement varient selon votre assurance et votre contrat. Notre équipe vous indiquera les documents généralement nécessaires et vous invitera à vérifier votre couverture auprès de votre assureur.'],
  ['Ai je besoin d’une prescription médicale ?', 'Une prescription n’est pas toujours nécessaire pour prendre un premier contact. Selon le motif de consultation et la spécialité, nous pourrons vous conseiller de demander l’avis de votre médecin.'],
  ['Quels âges accompagnez vous ?', 'NAMA accueille les enfants, les adolescents et les adultes. Nous prenons le temps d’orienter chaque personne vers le professionnel et le rythme qui lui correspondent.'],
  ['Combien de temps dure une première séance ?', 'La première rencontre dure habituellement entre 45 et 60 minutes. Elle permet de faire connaissance, de comprendre votre demande et d’imaginer la suite ensemble.'],
  ['Proposez vous des séances en français, anglais ou arabe ?', 'Oui. Notre accueil est pensé pour être accessible en français, en anglais et en arabe. Indiquez votre préférence au moment de la prise de rendez vous.'],
  ['Quelle est votre politique d’annulation ?', 'Nous vous remercions de prévenir le cabinet au moins 24 heures à l’avance lorsque cela est possible. Contactez nous directement afin de trouver un nouveau créneau.'],
];

function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 260 250" role="img" aria-label="Symbole NAMA : un adulte et un enfant autour d'une pousse">
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

function Portrait({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 120 140" fill="none" role="img" aria-label="Portrait placeholder du membre de l'équipe">
      <circle cx="60" cy="43" r="22" stroke="currentColor" strokeWidth="1.2" />
      <path d="M20 130c2-28 17-44 40-44s38 16 40 44" stroke="currentColor" strokeWidth="1.2" />
      <path d="M45 43c3 2 7 3 15 3s12-1 15-3M51 57c6 4 12 4 18 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      {index === 1 && <path d="M38 35c4-16 38-22 45 1-8-7-15-10-25-8-6 1-13 3-20 7Z" fill="currentColor" opacity=".35" />}
      {index === 2 && <path d="M38 39c0-18 40-25 45 0-10-5-18-7-25-7-7 0-13 3-20 7Z" fill="currentColor" opacity=".3" />}
    </svg>
  );
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const revealRoot = useRef<HTMLDivElement>(null);

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

  const closeMenu = () => setMenuOpen(false);
  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const email = String(data.get('email') || '').trim();
    const specialty = String(data.get('specialty') || '').trim();
    if (!name || !phone || !email || !specialty) {
      setFormError('Merci de compléter les champs obligatoires.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Merci de vérifier votre adresse e-mail.');
      return;
    }
    setSubmitted(true);
    form.reset();
  };

  return (
    <div ref={revealRoot} className="site">
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-shell">
          <a href="#accueil" className="brand-lockup" onClick={closeMenu} data-testid="link-logo-home" aria-label="NAMA Polyclinic, retour à l'accueil">
              <img src={topLogo} alt="Logo original de NAMA Polyclinic" />
          </a>
          <nav className={`nav-links ${menuOpen ? 'open' : ''}`} aria-label="Navigation principale">
            {navItems.map(([label, href]) => (
              <a key={href} href={href} onClick={closeMenu} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</a>
            ))}
          </nav>
          <div className="header-actions">
            <a className="phone-link" href="tel:+96178876825" data-testid="link-header-phone">78 87 68 25</a>
            <a href="#contact" className="button button-primary" data-testid="button-header-book">Prendre rendez vous <ArrowUpRight size={14} /></a>
            <button className="menu-button" type="button" onClick={() => setMenuOpen((value) => !value)} data-testid="button-mobile-menu" aria-expanded={menuOpen} aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}>
              {menuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section id="accueil" className="hero">
          <div className="container hero-grid">
            <div className="reveal">
              <div className="eyebrow">Polyclinique médicale & paramédicale</div>
              <h1 className="display">Avancer,<br /><em>ensemble.</em></h1>
               <p className="hero-lead">Un lieu doux et pluridisciplinaire à Jal El Dib, où chaque personne, enfant ou adulte, est accueillie avec attention.</p>
              <div className="hero-ctas">
                <a className="button button-primary" href="#contact" data-testid="button-hero-book">Prendre rendez vous <ArrowUpRight size={15} /></a>
                <a className="button button-outline" href="#services" data-testid="button-hero-services">Découvrir nos spécialités <ChevronRight size={15} /></a>
              </div>
              <div className="hero-note"><span><HeartHandshake size={16} /></span> Parce que chaque parcours compte.</div>
            </div>
             <div className="hero-visual reveal reveal-delay-2">
               <div className="hero-organic-art">
                 <img className="hero-mark" src={namaIcon} alt="Symbole NAMA représentant un adulte, un enfant et une pousse" />
                 <svg className="hero-vine" viewBox="0 0 180 150" fill="none" aria-hidden="true">
                   <path d="M12 142c28-35 34-76 22-126M30 92c25-13 47-14 68-2M22 116c-12-8-18-18-20-31M81 90c19-17 42-22 69-15M99 82c2-18 11-31 27-42" />
                   <path d="M26 57c10-11 19-15 30-15-5 11-14 17-30 15ZM65 92c7-13 17-19 29-20-3 13-12 21-29 20ZM136 41c8-9 17-12 26-11-4 10-12 14-26 11Z" />
                 </svg>
               </div>
             </div>
          </div>
        </section>

        <section id="a-propos" className="section about olive-band">
          <div className="container about-grid">
            <div className="about-mark reveal">
              <BrandMark />
            </div>
            <div className="reveal reveal-delay-1">
              <div className="eyebrow">Pourquoi NAMA</div>
              <h2 className="display">Un même toit.<br />Plusieurs chemins.</h2>
               <p className="about-copy">NAMA réunit des regards médicaux et paramédicaux pour prendre soin de la personne dans son ensemble. Ici, on commence par écouter, puis on construit un accompagnement qui a du sens pour vous, votre enfant ou votre famille.</p>
              <div className="trust-grid">
                <div className="trust-item"><ShieldCheck size={19} /><strong>Équipe pluridisciplinaire</strong><span>Des compétences qui se répondent, au même endroit.</span></div>
                <div className="trust-item"><HeartHandshake size={19} /><strong>Approche personnalisée</strong><span>Un bilan attentif avant chaque étape.</span></div>
                <div className="trust-item"><Stethoscope size={19} /><strong>De l’enfant à l’adulte</strong><span>Un accompagnement qui évolue avec vous.</span></div>
                <div className="trust-item"><Clock3 size={19} /><strong>Rendez vous flexibles</strong><span>Des créneaux pensés pour la vraie vie.</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="section clinic-story" aria-labelledby="clinic-title">
          <div className="container clinic-grid">
            <div className="clinic-copy reveal">
              <div className="eyebrow">Le lieu NAMA</div>
              <h2 id="clinic-title">Un espace pour<br /><em>chaque étape.</em></h2>
              <p>Un cabinet lumineux et accueillant, pensé pour que les enfants, les adultes et leurs proches se sentent à leur place dès le premier rendez vous.</p>
              <a href="#contact" className="mini-link" data-testid="link-clinic-contact">Découvrir NAMA <ArrowUpRight size={13} /></a>
            </div>
            <div className="clinic-visual reveal reveal-delay-1">
              <div className="building-photo-slot" data-testid="photo-slot-building" aria-label="Emplacement réservé à la photo du bâtiment">
                <div className="photo-slot-icon"><ImagePlus size={22} /></div>
                <span>Photo du bâtiment</span>
                <small>À ajouter prochainement</small>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="section services">
          <div className="container">
            <div className="services-header reveal">
              <div className="section-heading">
                <div className="eyebrow">Nos spécialités</div>
                <h2>Des expertises qui<br /><em>se complètent.</em></h2>
                <p>Une porte d’entrée, puis le bon chemin. Nos professionnels travaillent avec précision, bienveillance et une vision commune du soin.</p>
              </div>
               <div className="service-index">04 disciplines, 01 intention</div>
            </div>
            <div className="service-grid">
              {specialties.map((specialty, index) => (
                <article className={`service-card reveal reveal-delay-${(index % 3) + 1}`} key={specialty.title} data-testid={`card-service-${index}`}>
                  <span className="service-index">{specialty.number}</span>
                  <div className="icon-circle"><SpecialtyIcon kind={specialty.icon} /></div>
                  <h3>{specialty.title}{specialty.title === 'Diététique' && <><br /><span>/ Nutrition</span></>}</h3>
                  <p className="service-desc">{specialty.description}</p>
                  <a href="#contact" className="mini-link" data-testid={`link-service-book-${index}`}>Parler à un spécialiste <ArrowUpRight size={13} /></a>
                  <span className="sr-only">{specialty.detail}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="equipe" className="section team">
          <div className="container">
            <div className="section-heading reveal">
              <div className="eyebrow">Notre équipe</div>
              <h2>Des personnes<br /><em>avant des titres.</em></h2>
              <p>Chaque professionnel apporte son expertise, sa sensibilité et le temps nécessaire pour créer une relation de confiance.</p>
            </div>
            <div className="team-grid">
              {[
                ['Dr. Maya Haddad', 'Psychologue clinicienne', 'Écoute attentive et accompagnement émotionnel de l’enfant à l’adulte.'],
                 ['M. Karim Khoury', 'Orthophoniste', 'Langage, communication et apprentissages dans un cadre encourageant.'],
                ['Mme Lara Nassar', 'Psychomotricienne', 'Le mouvement comme point de départ pour grandir et retrouver son équilibre.'],
                 ['Mme Rita Saad', 'Diététicienne et nutrition', 'Une approche simple, réaliste et personnalisée de la nutrition.'],
              ].map(([name, specialty, bio], index) => (
                <article className={`person-card reveal reveal-delay-${(index % 3) + 1}`} key={name} data-testid={`card-practitioner-${index}`}>
                  <div className="person-portrait" data-testid={`photo-slot-practitioner-${index}`} aria-label={`Emplacement photo pour ${name}`}>
                    <div className="photo-slot-icon"><ImagePlus size={20} /></div>
                    <Portrait index={index} />
                    <span className="photo-slot-label">Photo à ajouter</span>
                  </div>
                  <h3>{name}</h3>
                  <div className="person-specialty">{specialty}</div>
                  <p className="person-bio">{bio}</p>
                </article>
              ))}
            </div>
             <div className="team-foot reveal"><span>La famille NAMA grandit avec les besoins de la communauté.</span><a href="#contact" className="mini-link" data-testid="link-team-contact">Vous êtes un professionnel de santé ? <ArrowUpRight size={13} /></a></div>
          </div>
        </section>

        <section id="parcours" className="section steps">
          <div className="container">
            <div className="section-heading reveal">
              <div className="eyebrow">Votre première visite</div>
              <h2>Pas à pas,<br />sans pression.</h2>
              <p>Vous n’avez pas besoin d’avoir toutes les réponses avant de venir. Nous les chercherons avec vous.</p>
            </div>
            <div className="steps-grid">
              {[
                 ['01', 'Prenez rendez vous', 'Par téléphone, WhatsApp ou via le formulaire. Dites nous simplement ce qui vous amène.'],
                ['02', 'Bilan initial', 'La première séance est un temps d’écoute et d’observation, sans jugement.'],
                ['03', 'Plan personnalisé', 'Nous vous expliquons nos observations et proposons des étapes claires.'],
                 ['04', 'Suivi régulier', 'Nous avançons à votre rythme, avec des points de repère pour mesurer les progrès.'],
              ].map(([number, title, text], index) => (
                <div className={`step reveal reveal-delay-${(index % 3) + 1}`} key={number}><div className="step-number">{number}</div><h3>{title}</h3><p>{text}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section id="temoignages" className="section testimonials">
          <div className="container">
            <div className="section-heading reveal">
              <div className="eyebrow">Témoignages</div>
              <h2>Des petits pas<br /><em>qui comptent.</em></h2>
            </div>
            <div className="testimonial-grid">
              {[
                 ['« À venir »', 'Cet espace accueillera bientôt les mots de familles accompagnées par NAMA.', 'Témoignage parent, bientôt disponible'],
                 ['« À venir »', 'Nous préparons une collection de témoignages sincères, avec l’accord de nos patients.', 'Témoignage patient, bientôt disponible'],
                 ['« À venir »', 'Votre expérience pourra aider une autre famille à faire son premier pas.', 'Témoignage famille, bientôt disponible'],
              ].map(([quote, text, cite], index) => (
                <article className={`quote-card reveal reveal-delay-${index + 1}`} key={cite} data-testid={`card-testimonial-${index}`}>
                  <div><span className="placeholder-label">Espace réservé</span><div className="quote-mark">“</div><blockquote>{quote}<br /><small>{text}</small></blockquote></div><cite>{cite}</cite>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="section faq">
          <div className="container faq-grid">
            <div className="faq-intro reveal"><div className="eyebrow">Questions fréquentes</div><h2 className="display">On peut<br /><em>en parler.</em></h2><p>Une question qui n’est pas ici ? Notre équipe vous répond avec plaisir.</p><a href="#contact" className="button button-outline" data-testid="button-faq-contact">Nous contacter <ArrowUpRight size={14} /></a></div>
            <div className="faq-list reveal reveal-delay-1">
              {faqs.map(([question, answer], index) => (
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
              <div className="eyebrow">Parlons de la suite</div>
              <h2 className="display">Votre prochain<br />pas commence ici.</h2>
              <p className="contact-intro">Expliquez nous ce dont vous avez besoin. Nous vous recontacterons pour trouver le professionnel et le moment les plus adaptés.</p>
              <div className="contact-details">
                <div className="contact-detail"><Phone size={18} /><div><strong>Téléphone</strong><a href="tel:+96178876825" data-testid="link-contact-phone">78 87 68 25</a></div></div>
                <div className="contact-detail"><MessageCircle size={18} /><div><strong>WhatsApp</strong><a href="https://wa.me/96178876825" target="_blank" rel="noreferrer" data-testid="link-contact-whatsapp">Écrire directement à l’équipe</a></div></div>
                <div className="contact-detail"><MapPin size={18} /><div><strong>Nous trouver</strong><span>WH5P+62F, Jal El Dib, Lebanon</span></div></div>
              </div>
              <div className="contact-socials"><a href="https://www.instagram.com/namapolyclinic" target="_blank" rel="noreferrer" className="social-link" aria-label="Instagram de NAMA Polyclinic" data-testid="link-instagram"><Instagram size={17} /></a><a href="https://wa.me/96178876825" target="_blank" rel="noreferrer" className="social-link" aria-label="WhatsApp de NAMA Polyclinic" data-testid="link-whatsapp"><MessageCircle size={17} /></a><a href="https://maps.google.com/?q=WH5P%2B62F%20Jal%20El%20Dib%20Lebanon" target="_blank" rel="noreferrer" className="social-link" aria-label="Itinéraire vers NAMA Polyclinic" data-testid="link-directions"><Navigation size={17} /></a></div>
            </div>
            <div className="contact-form reveal reveal-delay-1">
              {submitted ? (
                <div className="form-success" role="status" data-testid="status-form-success"><Check size={28} /><h3 className="display">Message bien reçu.</h3><p>Merci pour votre confiance. L’équipe NAMA vous répondra prochainement. Si votre demande est urgente, appelez nous au <a href="tel:+96178876825">78 87 68 25</a>.</p><button type="button" className="button button-outline" onClick={() => setSubmitted(false)} data-testid="button-form-new">Envoyer un autre message</button></div>
              ) : (
                <form onSubmit={submitForm} noValidate data-testid="form-contact">
                  <h3 className="display">Dites bonjour à NAMA.</h3>
                  <div className="form-grid">
                    <div className="field"><label htmlFor="name">Nom complet *</label><input id="name" name="name" type="text" autoComplete="name" placeholder="Votre nom" data-testid="input-name" required /></div>
                    <div className="field"><label htmlFor="phone">Téléphone *</label><input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="78 87 68 25" data-testid="input-phone" required /></div>
                     <div className="field"><label htmlFor="email">Courriel *</label><input id="email" name="email" type="email" autoComplete="email" placeholder="vous@exemple.com" data-testid="input-email" required /></div>
                    <div className="field"><label htmlFor="specialty">Je cherche *</label><select id="specialty" name="specialty" defaultValue="" data-testid="select-specialty" required><option value="" disabled>Choisir une spécialité</option><option>Orthophonie</option><option>Psychologie</option><option>Psychomotricité</option><option>Diététique / Nutrition</option><option>Je ne sais pas encore</option></select></div>
                    <div className="field full"><label htmlFor="message">Votre message</label><textarea id="message" name="message" placeholder="Quelques mots sur votre demande (facultatif)" data-testid="textarea-message" /></div>
                  </div>
                  {formError && <div className="field-error" role="alert" data-testid="status-form-error">{formError}</div>}
                  <div className="form-actions"><span className="form-note">Vos informations restent confidentielles.<br />Nous vous répondons dans les meilleurs délais.</span><button type="submit" className="button button-primary" data-testid="button-submit-contact">Envoyer la demande <Send size={14} /></button></div>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="location" aria-label="Localisation et horaires">
          <div className="container location-grid">
            <iframe className="map-frame" title="Localisation de NAMA Polyclinic à Jal El Dib" src="https://www.google.com/maps?q=WH5P%2B62F%20Jal%20El%20Dib%20Lebanon&output=embed" loading="lazy" data-testid="map-location" />
            <div className="hours-card reveal"><div className="eyebrow">Avant de venir</div><h3>On vous attend.</h3><div className="hours-row"><span>Du lundi au vendredi</span><span>08:00 à 18:00</span></div><div className="hours-row"><span>Samedi</span><span>09:00 à 14:00</span></div><div className="hours-row"><span>Dimanche</span><span>Fermé</span></div><a href="#contact" className="mini-link" data-testid="link-hours-book">Choisir un créneau <ArrowUpRight size={13} /></a></div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div><img className="footer-logo" src={topLogo} alt="Logo original de NAMA Polyclinic" /><p className="footer-copy">Une polyclinique médicale et paramédicale où chaque parcours est accueilli avec soin.</p></div>
            <div><h3>Explorer</h3><div className="footer-links">{navItems.slice(0, 5).map(([label, href]) => <a key={href} href={href} data-testid={`link-footer-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</a>)}</div></div>
            <div><h3>Nous trouver</h3><div className="footer-contact"><a href="tel:+96178876825" data-testid="link-footer-phone">78 87 68 25</a><a href="https://wa.me/96178876825" target="_blank" rel="noreferrer" data-testid="link-footer-whatsapp">WhatsApp</a><a href="https://www.instagram.com/namapolyclinic" target="_blank" rel="noreferrer" data-testid="link-footer-instagram">@namapolyclinic</a><span>WH5P+62F, Jal El Dib<br />Lebanon</span></div></div>
          </div>
          <div className="footer-bottom"><span>© {new Date().getFullYear()} NAMA Polyclinic. Tous droits réservés.</span><span>Medical and paramedical care, with meaning.</span></div>
        </div>
      </footer>
      <a href="#contact" className="button button-primary mobile-book" data-testid="button-mobile-book"><MessageCircle size={17} /> Prendre rendez vous</a>
    </div>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.lang = 'fr';
    document.title = 'NAMA Polyclinic | Soins médicaux à Jal El Dib';
    const description = 'NAMA Polyclinic, polyclinique médicale et paramédicale à Jal El Dib. Orthophonie, psychologie, psychomotricité et diététique.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
    let keywords = document.querySelector('meta[name="keywords"]');
    if (!keywords) {
      keywords = document.createElement('meta');
      keywords.setAttribute('name', 'keywords');
      document.head.appendChild(keywords);
    }
    keywords.setAttribute('content', 'polyclinique Jal El Dib, orthophonie, psychologie, psychomotricité, diététique, nutrition, Lebanon');
  }, []);
  return <QueryClientProvider client={queryClient}><TooltipProvider><Home /></TooltipProvider></QueryClientProvider>;
}

export default App;
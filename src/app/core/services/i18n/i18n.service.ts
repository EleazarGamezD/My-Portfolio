import { Injectable, signal } from '@angular/core';
import { AppLanguage, DEFAULT_LANGUAGE, isSupportedLanguage } from '@core/i18n/i18n.config';

type TranslationKey = string;

const TRANSLATIONS: Record<AppLanguage, Record<TranslationKey, string>> = {
  es: {
    'common.loading': 'Cargando...',

    'nav.home': 'Inicio',
    'nav.about': 'Perfil',
    'nav.skills': 'Habilidades',
    'nav.projects': 'Proyectos',
    'nav.path': 'Trayectoria',
    'nav.contact': 'Contacto',
    'nav.cv': 'Curriculum Vitae',

    'page.home': 'Inicio',
    'page.projectDetails': 'Detalle de Proyecto',
    'page.cv': 'Curriculum Vitae',
    'site.title': 'Portafolio',

    'home.features.title': 'Stack tecnológico',

    'home.about.badge': 'Sobre mi',

    'home.projects.badge': 'Proyectos',
    'home.projects.title': 'Un vistazo a algunos proyectos recientes.',

    'home.career.badge': 'Trayectoria',
    'home.career.title': 'Trayectoria profesional.',

    'home.contactHello.title': 'Di hola!, Say hello!, Say hi!',
    'home.contactHello.body': '¿Listo para crear algo extraordinario juntos? Si tienes un proyecto en mente, buscas colaboración o simplemente quieres charlar sobre desarrollo web, conversemos. Estoy siempre abierto a nuevas oportunidades y desafíos que nos permitan transformar ideas en experiencias digitales memorables. Hablemos de cómo puedo aportar valor a tu próximo proyecto.',

    'home.contactForm.badge': 'Creemos juntos',
    'home.contactForm.title': '¿En qué puedo ayudarte?',
    'home.contactForm.name.label': 'Tu nombre*',
    'home.contactForm.name.placeholder': '¿Cuál es tu nombre?',
    'home.contactForm.email.label': 'Tu correo*',
    'home.contactForm.email.placeholder': 'Ingresa tu dirección de correo',
    'home.contactForm.phone.label': 'Tu teléfono*',
    'home.contactForm.phone.placeholder': 'Ingresa tu teléfono',
    'home.contactForm.subject.label': 'Tu asunto*',
    'home.contactForm.subject.placeholder': '¿En qué puedo ayudarte?',
    'home.contactForm.message.label': 'Tu mensaje*',
    'home.contactForm.message.placeholder': 'Ingresa tu mensaje',
    'home.contactForm.privacy': 'Cumpliendo con el compromiso de proteger tu privacidad. Nunca se recopilará información sobre ti sin tu consentimiento explícito.',
    'home.contactForm.submit': 'Enviar email',
    'home.contactForm.submitting': 'Enviando email',
    'toast.error.title': 'Error',
    'toast.error.invalidForm': 'Formulario inválido',
    'toast.success.title': 'Éxito',
    'toast.success.sent': 'Email enviado con éxito',
    'toast.error.recaptcha': 'Falló reCAPTCHA',
    'toast.error.process': 'Error en el proceso',

    'footer.location.title': 'Ubicación',
    'footer.location.line1': 'Trabajando remotamente',
    'footer.location.line2': 'desde Colombia',
    'footer.availability.title': 'Disponibilidad',
    'footer.availability.projects': 'Abierto a nuevos proyectos',
    'footer.availability.contact': 'Colaboraciones y consultas',
    'footer.rights': 'Todos los derechos reservados.',
    'footer.powered': 'Desarrollado con orgullo por',

    'workReferences.prev': 'anterior',
    'workReferences.next': 'siguiente',

    'scroll.label': 'Desplazar',

    'cv.title': 'Curriculum Vitae',
    'cv.office1': 'Londres',
    'cv.office2': 'Francia',
    'cv.viewMap': 'Ver en Google Maps',
    'cv.emailPrefix': 'E:',
    'cv.phonePrefix': 'T:',
    'cv.resumes': 'Hojas de vida',
    'cv.download': 'Descargar CV',
    'cv.noResumes': 'No hay hojas de vida disponibles',
    'cv.loadError': 'No se pudieron cargar las hojas de vida.',

    'project.card.category': 'Proyecto',
    'project.card.featured': 'Destacado',
    'project.details.technologies': 'Tecnologías',
    'project.details.description': 'Descripción',
    'project.details.featured': 'Proyecto destacado',
    'project.details.featuredDescription': 'Este proyecto forma parte de la selección destacada del portfolio.',
    'project.details.liveDemo': 'Ver demo',
    'project.details.sourceCode': 'Ver código fuente',
    'project.details.backHome': 'Volver al inicio',
    'project.details.notFound': 'No se encontró el proyecto seleccionado.',
  },
  en: {
    'common.loading': 'Loading...',

    'nav.home': 'Home',
    'nav.about': 'Profile',
    'nav.skills': 'Skills',
    'nav.projects': 'Projects',
    'nav.path': 'Career',
    'nav.contact': 'Contact',
    'nav.cv': 'Resume',

    'page.home': 'Home',
    'page.projectDetails': 'Project Details',
    'page.cv': 'Resume',
    'site.title': 'Portfolio',

    'home.features.title': 'Technology stack',

    'home.about.badge': 'About me',

    'home.projects.badge': 'Projects',
    'home.projects.title': 'A quick look at some recent projects.',

    'home.career.badge': 'Career path',
    'home.career.title': 'Professional career path.',

    'home.contactHello.title': "Di hola!, Say hello!, Say hi!",
    'home.contactHello.body': 'Ready to build something extraordinary together? If you have a project in mind, are looking for collaboration, or just want to talk about web development, let’s talk. I am always open to new opportunities and challenges that transform ideas into memorable digital experiences. Let’s discuss how I can add value to your next project.',

    'home.contactForm.badge': 'Let’s build together',
    'home.contactForm.title': 'How can I help you?',
    'home.contactForm.name.label': 'Your name*',
    'home.contactForm.name.placeholder': 'What is your name?',
    'home.contactForm.email.label': 'Your email*',
    'home.contactForm.email.placeholder': 'Enter your email address',
    'home.contactForm.phone.label': 'Your phone*',
    'home.contactForm.phone.placeholder': 'Enter your phone number',
    'home.contactForm.subject.label': 'Subject*',
    'home.contactForm.subject.placeholder': 'How can I help you?',
    'home.contactForm.message.label': 'Your message*',
    'home.contactForm.message.placeholder': 'Enter your message',
    'home.contactForm.privacy': 'Committed to protecting your privacy. Information about you will never be collected without your explicit consent.',
    'home.contactForm.submit': 'Send email',
    'home.contactForm.submitting': 'Sending email',
    'toast.error.title': 'Error',
    'toast.error.invalidForm': 'Invalid form',
    'toast.success.title': 'Success',
    'toast.success.sent': 'Email sent successfully',
    'toast.error.recaptcha': 'reCAPTCHA failed',
    'toast.error.process': 'Process error',

    'footer.location.title': 'Location',
    'footer.location.line1': 'Working remotely',
    'footer.location.line2': 'from Colombia',
    'footer.availability.title': 'Availability',
    'footer.availability.projects': 'Open to new projects',
    'footer.availability.contact': 'Collaborations and consulting',
    'footer.rights': 'All rights reserved.',
    'footer.powered': 'Proudly powered by',

    'workReferences.prev': 'prev',
    'workReferences.next': 'next',

    'scroll.label': 'Scroll',

    'cv.title': 'Resume',
    'cv.office1': 'London',
    'cv.office2': 'France',
    'cv.viewMap': 'View on google map',
    'cv.emailPrefix': 'E:',
    'cv.phonePrefix': 'T:',
    'cv.resumes': 'Resumes',
    'cv.download': 'Download CV',
    'cv.noResumes': 'No resumes available',
    'cv.loadError': 'The resumes could not be loaded.',

    'project.card.category': 'Project',
    'project.card.featured': 'Featured',
    'project.details.technologies': 'Technologies',
    'project.details.description': 'Description',
    'project.details.featured': 'Featured project',
    'project.details.featuredDescription': 'This project is part of the featured portfolio selection.',
    'project.details.liveDemo': 'Live demo',
    'project.details.sourceCode': 'View source code',
    'project.details.backHome': 'Back to home',
    'project.details.notFound': 'The selected project was not found.',
  },
};

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private readonly currentLanguageSignal = signal<AppLanguage>(DEFAULT_LANGUAGE);

  currentLanguage() {
    return this.currentLanguageSignal();
  }

  setCurrentLanguage(language: AppLanguage) {
    this.currentLanguageSignal.set(language);
  }

  syncLanguageFromUrl(url: string) {
    this.currentLanguageSignal.set(this.getLanguageFromUrl(url));
  }

  getLanguageFromUrl(url: string): AppLanguage {
    const firstSegment = this.getPathSegments(url)[0];
    return isSupportedLanguage(firstSegment) ? firstSegment : DEFAULT_LANGUAGE;
  }

  isHomeUrl(url: string): boolean {
    const normalizedPath = this.stripLanguageFromUrl(url).split('?')[0].split('#')[0];
    return normalizedPath === '/' || normalizedPath === '/home';
  }

  localizedPath(path = ''): string {
    const normalizedPath = path
      ? (path.startsWith('/') ? path : `/${path}`)
      : '';
    return `/${this.currentLanguageSignal()}${normalizedPath}`;
  }

  replaceLanguageInUrl(url: string, nextLanguage: AppLanguage): string {
    const normalizedPath = this.stripLanguageFromUrl(url);
    return `/${nextLanguage}${normalizedPath === '/' ? '' : normalizedPath}`;
  }

  stripLanguageFromUrl(url: string): string {
    const queryOrHashIndex = url.search(/[?#]/);
    const hasQueryOrHash = queryOrHashIndex >= 0;
    const pathPart = hasQueryOrHash ? url.slice(0, queryOrHashIndex) : url;
    const queryAndHash = hasQueryOrHash ? url.slice(queryOrHashIndex) : '';
    const segments = this.getPathSegments(pathPart);
    const hasLanguagePrefix = isSupportedLanguage(segments[0]);
    const remainingSegments = hasLanguagePrefix ? segments.slice(1) : segments;
    const normalizedPath = `/${remainingSegments.join('/')}`.replace(/\/+$/, '') || '/';
    return `${normalizedPath}${queryAndHash}`;
  }

  t(key: TranslationKey): string {
    const languageMap = TRANSLATIONS[this.currentLanguageSignal()];
    return languageMap[key] ?? key;
  }

  selectText(textEs: string, textEn: string): string {
    return this.currentLanguageSignal() === 'en' ? textEn : textEs;
  }

  private getPathSegments(url: string): string[] {
    const cleanPath = url.split('?')[0].split('#')[0];
    return cleanPath.split('/').filter(Boolean);
  }
}

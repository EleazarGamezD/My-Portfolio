import { Injectable, signal } from '@angular/core';
import { DEFAULT_LANGUAGE, AppLanguage, isSupportedLanguage } from '@core/i18n/i18n.config';

type TranslationKey = string;

const TRANSLATIONS: Record<AppLanguage, Record<TranslationKey, string>> = {
  es: {
    'nav.home': 'Inicio',
    'nav.about': 'Sobre mi',
    'nav.skills': 'Habilidades',
    'nav.projects': 'Proyectos',
    'nav.path': 'Trayectoria',
    'nav.contact': 'Contacto',
    'nav.cv': 'Curriculum Vitae',

    'meta.description': 'Portfolio profesional de Eleazar Gamez, Fullstack Developer especializado en Angular, Node.js y mas tecnologias web.',
    'page.home': 'Inicio',
    'page.projectDetails': 'Detalle de Proyecto',
    'page.cv': 'Curriculum Vitae',
    'site.title': 'Eleazar Gamez Fullstack Developer',

    'home.features.title': 'Stack tecnologico',

    'home.about.badge': 'Sobre mi',
    'home.about.title.line1': 'Entre interfaces y logica:',
    'home.about.title.line2': 'transformando ideas en experiencias',
    'home.about.title.line3': 'con alma fullstack.',
    'home.about.p1': 'Soy un desarrollador FullStack con un corazon dividido entre la creatividad del frontend y la logica robusta del backend. Mi expertise abarca la construccion de aplicaciones web dinamicas y escalables, utilizando Angular para dar vida a interfaces intuitivas, mientras que en el backend domino el arte de disenar APIs eficientes con NestJS y Express, asegurando arquitecturas limpias y mantenibles.',
    'home.about.p2': 'Me apasiona transformar desafios tecnicos en soluciones elegantes, siempre con un enfoque colaborativo y un compromiso por la calidad. Disfruto aprender constantemente, explorar nuevas herramientas y contribuir a proyectos que dejen un impacto positivo. Para mi, el codigo no solo es funcionalidad, sino tambien la oportunidad de crear algo con proposito.',

    'home.projects.badge': 'Proyectos',
    'home.projects.title': 'Un vistazo a algunos de mis proyectos mas recientes.',

    'home.career.badge': 'Trayectoria',
    'home.career.title': 'Mi trayectoria profesional.',

    'home.contactHello.title': 'Di hola!',
    'home.contactHello.body': 'Listo para crear algo extraordinario juntos? Si tienes un proyecto en mente, buscas colaboracion o simplemente quieres charlar sobre desarrollo web, conversemos. Estoy siempre abierto a nuevas oportunidades y desafios que nos permitan transformar ideas en experiencias digitales memorables. Hablemos de como puedo aportar valor a tu proximo proyecto.',

    'home.contactForm.badge': 'Creemos juntos',
    'home.contactForm.title': 'En que puedo ayudarte?',
    'home.contactForm.name.label': 'Tu nombre*',
    'home.contactForm.name.placeholder': 'Cual es tu nombre?',
    'home.contactForm.email.label': 'Tu correo*',
    'home.contactForm.email.placeholder': 'Ingresa tu direccion de correo',
    'home.contactForm.phone.label': 'Tu telefono*',
    'home.contactForm.phone.placeholder': 'Ingresa tu telefono',
    'home.contactForm.subject.label': 'Tu asunto*',
    'home.contactForm.subject.placeholder': 'En que puedo ayudarte?',
    'home.contactForm.message.label': 'Tu mensaje*',
    'home.contactForm.message.placeholder': 'Ingresa tu mensaje',
    'home.contactForm.privacy': 'Cumpliendo con el compromiso de proteger tu privacidad. Nunca se recopilara informacion sobre ti sin tu consentimiento explicito.',
    'home.contactForm.submit': 'Enviar email',
    'home.contactForm.submitting': 'Enviando email',
    'toast.error.title': 'Error',
    'toast.error.invalidForm': 'Formulario invalido',
    'toast.success.title': 'Exito',
    'toast.success.sent': 'Email enviado con exito',
    'toast.error.recaptcha': 'reCAPTCHA fallo',
    'toast.error.process': 'Error en el proceso',

    'footer.location.title': 'Mi ubicacion',
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
    'cv.viewMap': 'Ver en google maps',
    'cv.emailPrefix': 'E:',
    'cv.phonePrefix': 'T:',

    'project.card.category': 'Proyecto',
    'project.details.technologies': 'Tecnologias',
    'project.details.liveDemo': 'Ver demo',
    'project.details.sourceCode': 'Ver codigo fuente',
    'project.details.backHome': 'Volver al inicio',
    'project.details.notFound': 'No se encontro el proyecto seleccionado.',
  },
  en: {
    'nav.home': 'Home',
    'nav.about': 'About me',
    'nav.skills': 'Skills',
    'nav.projects': 'Projects',
    'nav.path': 'Career',
    'nav.contact': 'Contact',
    'nav.cv': 'Resume',

    'meta.description': 'Professional portfolio of Eleazar Gamez, Fullstack Developer focused on Angular, Node.js, and modern web technologies.',
    'page.home': 'Home',
    'page.projectDetails': 'Project Details',
    'page.cv': 'Resume',
    'site.title': 'Eleazar Gamez Fullstack Developer',

    'home.features.title': 'Technology stack',

    'home.about.badge': 'About me',
    'home.about.title.line1': 'Between interfaces and logic:',
    'home.about.title.line2': 'transforming ideas into experiences',
    'home.about.title.line3': 'with a fullstack soul.',
    'home.about.p1': 'I am a FullStack developer with a heart split between frontend creativity and solid backend logic. My expertise covers building dynamic and scalable web applications, using Angular to craft intuitive interfaces, while on the backend I design efficient APIs with NestJS and Express, ensuring clean and maintainable architectures.',
    'home.about.p2': 'I enjoy turning technical challenges into elegant solutions, always with a collaborative mindset and quality focus. I like learning continuously, exploring new tools, and contributing to projects that create positive impact. For me, code is not only functionality, but also an opportunity to build with purpose.',

    'home.projects.badge': 'Projects',
    'home.projects.title': 'A quick look at some of my most recent projects.',

    'home.career.badge': 'Career path',
    'home.career.title': 'My professional career path.',

    'home.contactHello.title': 'Say hello!',
    'home.contactHello.body': 'Ready to build something extraordinary together? If you have a project in mind, are looking for collaboration, or just want to talk about web development, lets talk. I am always open to new opportunities and challenges that transform ideas into memorable digital experiences. Lets discuss how I can add value to your next project.',

    'home.contactForm.badge': 'Lets build together',
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

    'footer.location.title': 'My location',
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

    'project.card.category': 'Project',
    'project.details.technologies': 'Technologies',
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

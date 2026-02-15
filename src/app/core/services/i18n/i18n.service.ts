import { Injectable, signal } from '@angular/core';
import { DEFAULT_LANGUAGE, AppLanguage, isSupportedLanguage } from '@core/i18n/i18n.config';

type TranslationKey =
  | 'nav.home'
  | 'nav.about'
  | 'nav.skills'
  | 'nav.projects'
  | 'nav.path'
  | 'nav.contact'
  | 'nav.cv'
  | 'meta.description'
  | 'page.home'
  | 'page.projectDetails'
  | 'page.cv'
  | 'site.title';

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
    return TRANSLATIONS[this.currentLanguageSignal()][key];
  }

  private getPathSegments(url: string): string[] {
    const cleanPath = url.split('?')[0].split('#')[0];
    return cleanPath.split('/').filter(Boolean);
  }
}

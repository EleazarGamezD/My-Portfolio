import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  IApiContentItem,
  IApiProfile,
} from '@core/interfaces/content/content.interface';
import { AppLanguage } from '@core/i18n/i18n.config';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  profileContent: IApiProfile | null = null;
  social: IApiContentItem[] = [
    {
      label: { es: 'GitHub', en: 'GitHub' },
      icon: 'fa-brands fa-github',
      href: 'https://github.com/EleazarGamezD',
    },
    {
      label: { es: 'LinkedIn', en: 'LinkedIn' },
      icon: 'fa-brands fa-linkedin',
      href: 'https://www.linkedin.com/in/eleazar-gamez/',
    },
  ];
  isBrowser: boolean;

  constructor(
    private router: Router,
    public i18nService: I18nService,
    private readonly contentService: ContentService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit(): Promise<void> {
    this.i18nService.syncLanguageFromUrl(this.router.url);

    try {
      const [socialLinks, profile] = await Promise.all([
        this.contentService.getSocialLinks(),
        this.contentService.getProfile(),
      ]);

      this.social = socialLinks;
      this.profileContent = profile;
    } catch (error) {
      console.warn('Failed to load header content from API.', error);
    }

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.i18nService.syncLanguageFromUrl(event.urlAfterRedirects);
        const elementId = this.getScrollToFromUrl(event.urlAfterRedirects);
        if (elementId) {
          this.scrollToElement(elementId);
        }

        if (this.isBrowser && !elementId) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });

  }

  navigateTo(route: string) {
    const normalizedRoute = route === 'home' ? '' : route;
    this.router.navigateByUrl(this.i18nService.localizedPath(normalizedRoute));
  }

  navigateToAdminLogin() {
    this.router.navigateByUrl('/admin/login');
  }

  scrollTo(elementId: string) {
    if (!this.i18nService.isHomeUrl(this.router.url)) {
      this.router
        .navigate([`/${this.i18nService.currentLanguage()}`], { queryParams: { scrollTo: elementId } })
        .then(() => {
          this.scrollToElement(elementId);
        });
    } else {
      this.scrollToElement(elementId);
    }
  }

  scrollToElement(elementId: string) {
    if (this.isBrowser) {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  switchLanguage(language: AppLanguage) {
    if (language === this.i18nService.currentLanguage()) {
      return;
    }
    this.router.navigateByUrl(this.i18nService.replaceLanguageInUrl(this.router.url, language));
  }

  t(key: Parameters<I18nService['t']>[0]) {
    return this.i18nService.t(key);
  }

  private getScrollToFromUrl(url: string): string | null {
    const queryString = url.split('?')[1];
    if (!queryString) {
      return null;
    }

    return new URLSearchParams(queryString).get('scrollTo');
  }
}

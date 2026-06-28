import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { AppLanguage } from '@core/i18n/i18n.config';
import {
  IApiContentItem,
  IApiProfile,
} from '@core/interfaces/content/content.interface';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import { createPortfolioPlaceholder } from '@core/utils/image/portfolio-placeholder.utils';
import { resolvePortfolioSocialIcon } from '@core/utils/social/social-icon.utils';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  private router = inject(Router);
  i18nService = inject(I18nService);
  private readonly contentService = inject(ContentService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);

  profileContent: IApiProfile | null = null;
  social: IApiContentItem[] = [
    {
      label: { es: 'GitHub', en: 'GitHub' },
      icon: 'bi bi-github',
      href: 'https://github.com/',
    },
    {
      label: { es: 'LinkedIn', en: 'LinkedIn' },
      icon: 'bi bi-linkedin',
      href: 'https://www.linkedin.com/',
    },
  ];
  isBrowser: boolean;

  constructor() {
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
    } finally {
      this.cdr.markForCheck();
    }

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.i18nService.syncLanguageFromUrl(event.urlAfterRedirects);
        const elementId = this.getScrollToFromUrl(event.urlAfterRedirects);
        if (elementId) {
          this.scrollToElement(elementId);
        }
      });
  }

  navigateTo(route: string) {
    const normalizedRoute = route === 'home' ? '' : route;

    if (!normalizedRoute && this.i18nService.isHomeUrl(this.router.url)) {
      if (this.isBrowser) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    this.router.navigateByUrl(this.i18nService.localizedPath(normalizedRoute));
  }

  navigateToAdminLogin() {
    this.router.navigateByUrl('/admin/login');
  }

  scrollTo(elementId: string) {
    if (!this.i18nService.isHomeUrl(this.router.url)) {
      void this.router
        .navigate([`/${this.i18nService.currentLanguage()}`], {
          queryParams: { scrollTo: elementId },
        })
        .then(() => {
          this.scrollToElement(elementId);
        });
    } else {
      this.scrollToElement(elementId);
    }
  }

  scrollToElement(elementId: string) {
    if (this.isBrowser) {
      const attemptScroll = (retries = 12) => {
        const element = document.getElementById(elementId);
        if (!element) {
          if (retries > 0) {
            window.setTimeout(() => attemptScroll(retries - 1), 60);
          }
          return;
        }

        const headerOffset = this.getHeaderOffset();
        const elementTop = element.getBoundingClientRect().top + window.scrollY;
        const targetTop = Math.max(elementTop - headerOffset, 0);

        this.animateWindowScroll(targetTop);
      };

      window.requestAnimationFrame(() => attemptScroll());
    }
  }

  switchLanguage(language: AppLanguage) {
    if (language === this.i18nService.currentLanguage()) {
      return;
    }
    this.router.navigateByUrl(
      this.i18nService.replaceLanguageInUrl(this.router.url, language),
    );
  }

  get alternateLanguage(): AppLanguage {
    return this.i18nService.currentLanguage() === 'es' ? 'en' : 'es';
  }

  get alternateLanguageLabel(): string {
    return this.alternateLanguage.toUpperCase();
  }

  t(key: Parameters<I18nService['t']>[0]) {
    return this.i18nService.t(key);
  }

  get headerLogo() {
    return (
      resolveImageAssetUrl(
        this.profileContent?.metadata?.portfolioMedia?.headerLogo,
      ) || createPortfolioPlaceholder('Logo', 640, 240)
    );
  }

  trackSocial(_: number, item: IApiContentItem): string {
    return item.slug || item.value || item.href || `${_}`;
  }

  socialIconName(item: IApiContentItem): string {
    return resolvePortfolioSocialIcon(item);
  }

  private getScrollToFromUrl(url: string): string | null {
    const queryString = url.split('?')[1];
    if (!queryString) {
      return null;
    }

    return new URLSearchParams(queryString).get('scrollTo');
  }

  private getHeaderOffset(): number {
    if (!this.isBrowser) {
      return 0;
    }

    const header = document.querySelector('header');
    const headerHeight =
      header instanceof HTMLElement ? header.offsetHeight : 0;

    return headerHeight > 0 ? headerHeight + 12 : 24;
  }

  private animateWindowScroll(targetTop: number): void {
    if (!this.isBrowser) {
      return;
    }

    const startTop = window.scrollY;
    const distance = targetTop - startTop;

    if (Math.abs(distance) < 2) {
      window.scrollTo(0, targetTop);
      return;
    }

    const duration = 700;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, startTop + distance * easedProgress);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }
}

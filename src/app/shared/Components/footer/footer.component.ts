import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import {
  IApiContentItem,
  IApiProfile,
} from '@core/interfaces/content/content.interface';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import { createPortfolioPlaceholder } from '@core/utils/image/portfolio-placeholder.utils';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent implements OnInit {
  date = new Date().getFullYear();
  profileContent: IApiProfile | null = null;
  social: IApiContentItem[] = [
    {
      label: { es: 'GitHub', en: 'GitHub' },
      icon: 'fa-brands fa-github',
      href: 'https://github.com/',
    },
    {
      label: { es: 'LinkedIn', en: 'LinkedIn' },
      icon: 'fa-brands fa-linkedin',
      href: 'https://www.linkedin.com/',
    },
  ];

  constructor(
    private readonly router: Router,
    public i18nService: I18nService,
    private readonly contentService: ContentService,
    private readonly cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) { }

  async ngOnInit(): Promise<void> {
    try {
      const [socialLinks, profile] = await Promise.all([
        this.contentService.getSocialLinks(),
        this.contentService.getProfile(),
      ]);

      this.social = socialLinks;
      this.profileContent = profile;
    } catch (error) {
      console.warn('Failed to load footer content from API.', error);
    } finally {
      this.cdr.markForCheck();
    }
  }

  scrollTo(elementId: string) {
    if (!this.i18nService.isHomeUrl(this.router.url)) {
      void this.router.navigate([`/${this.i18nService.currentLanguage()}`], {
        queryParams: { scrollTo: elementId },
      });
      return;
    }

    this.scrollToElement(elementId);
  }

  t(key: Parameters<I18nService['t']>[0]) {
    return this.i18nService.t(key);
  }

  get footerCenterImage() {
    return (
      resolveImageAssetUrl(this.profileContent?.metadata?.portfolioMedia?.footerCenterImage) ||
      createPortfolioPlaceholder('Footer Badge', 480, 480)
    );
  }

  get profileOwnerName() {
    return this.profileContent?.label?.es || this.profileContent?.label?.en || 'Portfolio Owner';
  }

  trackSocial(_: number, item: IApiContentItem): string {
    return item.slug || item.value || item.href || `${_}`;
  }

  private scrollToElement(elementId: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.requestAnimationFrame(() => {
      const element = document.getElementById(elementId);
      if (!element) {
        return;
      }

      const header = document.querySelector('header');
      const headerHeight = header instanceof HTMLElement ? header.offsetHeight : 0;
      const headerOffset = headerHeight > 0 ? headerHeight + 12 : 24;
      const elementTop = element.getBoundingClientRect().top + window.scrollY;
      const targetTop = Math.max(elementTop - headerOffset, 0);

      this.animateWindowScroll(targetTop);
    });
  }

  private animateWindowScroll(targetTop: number): void {
    if (!isPlatformBrowser(this.platformId)) {
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

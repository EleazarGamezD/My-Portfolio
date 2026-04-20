import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import {
  IApiContentItem,
  IApiProfile,
} from '@core/interfaces/content/content.interface';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  date = new Date().getFullYear();
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

  constructor(
    private readonly router: Router,
    public i18nService: I18nService,
    private readonly contentService: ContentService,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

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
    }
  }

  scrollTo(elementId: string) {
    if (!this.i18nService.isHomeUrl(this.router.url)) {
      this.router
        .navigate([`/${this.i18nService.currentLanguage()}`], { queryParams: { scrollTo: elementId } })
        .then(() => {
          this.scrollToElement(elementId);
        });
      return;
    }

    this.scrollToElement(elementId);
  }

  t(key: Parameters<I18nService['t']>[0]) {
    return this.i18nService.t(key);
  }

  private scrollToElement(elementId: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

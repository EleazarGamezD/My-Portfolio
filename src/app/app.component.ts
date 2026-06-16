import {
  Component,
  DestroyRef,
  OnInit,
  DOCUMENT,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgStorage } from '@core/enum/ngStorage/ngStorage.enum';
import { IApiProfile } from '@core/interfaces/content/content.interface';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { StorageService } from '@core/services/storage/storage.service';
import { TemplateScriptsService } from '@core/services/template-scripts/template-scripts.service';
import { ThemeService } from '@core/services/theme/theme.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private meta = inject(Meta);
  private titleService = inject(Title);
  private router = inject(Router);
  private i18nService = inject(I18nService);
  private readonly storageService = inject(StorageService);
  private readonly contentService = inject(ContentService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly themeService = inject(ThemeService);
  private readonly templateScriptsService = inject(TemplateScriptsService);
  private document = inject<Document>(DOCUMENT);

  private profileContent: IApiProfile | null = null;

  ngOnInit(): void {
    void this.themeService.loadAndApplyActiveTheme();
    void this.loadProfileSeoContent();
    void this.templateScriptsService.loadWhenIdle();

    this.i18nService.syncLanguageFromUrl(this.router.url);
    this.updateSeo(this.router.url);
    this.syncGlobalLoader(this.router.url);

    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event: NavigationEnd) => {
        this.updateSeo(event.urlAfterRedirects);
        this.syncGlobalLoader(event.urlAfterRedirects);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('router-navigation-end', {
              detail: { url: this.router.url },
            }),
          );
        }
      });
  }

  private getRouteTitle(url: string): string {
    const normalizedPath = this.i18nService.stripLanguageFromUrl(url);

    if (normalizedPath.startsWith('/admin')) {
      return 'Portfolio Admin';
    }

    if (normalizedPath === '/' || normalizedPath === '/home') {
      return this.i18nService.t('page.home');
    } else if (normalizedPath.includes('/projectDetails')) {
      return this.i18nService.t('page.projectDetails');
    } else if (normalizedPath.includes('/cv')) {
      return this.i18nService.t('page.cv');
    }

    return this.i18nService.t('site.title');
  }

  private updateSeo(url: string) {
    this.i18nService.syncLanguageFromUrl(url);
    const routeTitle = this.getRouteTitle(url);
    const siteTitle = this.getSiteTitle();
    this.titleService.setTitle(`${routeTitle} | ${siteTitle}`);
    const description = this.getSiteDescription();
    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
    }
    this.document.documentElement.lang = this.i18nService.currentLanguage();
  }

  private async loadProfileSeoContent(): Promise<void> {
    try {
      this.profileContent = await this.contentService.getProfile();
      this.updateSeo(this.router.url);
    } catch (error) {
      console.warn('Failed to load profile SEO content.', error);
    }
  }

  private getSiteTitle(): string {
    if (!this.profileContent) {
      return this.i18nService.t('site.title');
    }

    return (
      this.i18nService.selectText(
        this.profileContent.label?.es ?? this.profileContent.title?.es ?? '',
        this.profileContent.label?.en ??
          this.profileContent.title?.en ??
          this.profileContent.label?.es ??
          this.profileContent.title?.es ??
          '',
      ) || this.i18nService.t('site.title')
    );
  }

  private getSiteDescription(): string {
    if (!this.profileContent) {
      return '';
    }

    return this.i18nService.selectText(
      this.profileContent.description?.es ?? '',
      this.profileContent.description?.en ??
        this.profileContent.description?.es ??
        '',
    );
  }

  private syncGlobalLoader(url: string): void {
    if (this.i18nService.isHomeUrl(url)) {
      return;
    }

    void this.storageService.setStorage(NgStorage.LOADER, false);
  }
}

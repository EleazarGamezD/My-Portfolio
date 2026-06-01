import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, Inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgStorage } from '@core/enum/ngStorage/ngStorage.enum';
import { adminIconSubset } from '@core/icons/admin-icon-subset';
import { I18nService } from '@core/services/i18n/i18n.service';
import { ThemeService } from '@core/services/theme/theme.service';
import { StorageService } from '@core/services/storage/storage.service';
import { IconSetService } from '@coreui/icons-angular';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(
    private meta: Meta,
    private titleService: Title,
    private router: Router,
    private i18nService: I18nService,
    private readonly storageService: StorageService,
    private iconSetService: IconSetService,
    private readonly destroyRef: DestroyRef,
    private readonly themeService: ThemeService,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.iconSetService.icons = { ...adminIconSubset };
  }

  ngOnInit(): void {
    void this.themeService.loadAndApplyActiveTheme();

    this.meta.addTag({ name: 'author', content: 'Eleazar Gamez' });
    this.i18nService.syncLanguageFromUrl(this.router.url);
    this.updateSeo(this.router.url);
    this.syncGlobalLoader(this.router.url);

    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((event: NavigationEnd) => {
      this.updateSeo(event.urlAfterRedirects);
      this.syncGlobalLoader(event.urlAfterRedirects);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('router-navigation-end', {
          detail: { url: this.router.url },
        }));
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
    const siteTitle = this.i18nService.t('site.title');
    this.titleService.setTitle(`${routeTitle} | ${siteTitle}`);
    this.meta.updateTag({ name: 'description', content: this.i18nService.t('meta.description') });
    this.document.documentElement.lang = this.i18nService.currentLanguage();
  }

  private syncGlobalLoader(url: string): void {
    if (this.i18nService.isHomeUrl(url)) {
      return;
    }

    void this.storageService.setStorage(NgStorage.LOADER, false);
  }
}

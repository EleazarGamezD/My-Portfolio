import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { NgStorage } from '@core/enum/ngStorage/ngStorage.enum';
import { StorageService } from '@core/services/storage/storage.service';
import { ThemeService } from '@core/services/theme/theme.service';
import { CareerPathComponent } from '../../shared/Components/career-path/career-path.component';
import { ContactMeHelloComponent } from '../../shared/Components/contact-me-hello/contact-me-hello.component';
import { ContactMeComponent } from '../../shared/Components/contact-me/contact-me.component';
import { CvComponent } from '../../shared/Components/cv/cv.component';
import { FeaturesComponent } from '../../shared/Components/features/features.component';
import { HomeBannerSliderComponent } from '../../shared/Components/home-banner-slider/home-banner-slider.component';
import { SliderProjectsComponent } from '../../shared/Components/slider-projects/slider-projects.component';
import { SmallAboutResumeComponent } from '../../shared/Components/small-about-resume/small-about-resume.component';
import { WorkReferencesComponent } from '../../shared/Components/work-references/work-references.component';

@Component({
  selector: 'app-home',
  standalone: true, // Asegúrate de que sea standalone
  imports: [
    HomeBannerSliderComponent,
    FeaturesComponent,
    SmallAboutResumeComponent,
    SliderProjectsComponent,
    CareerPathComponent,
    WorkReferencesComponent,
    ContactMeHelloComponent,
    ContactMeComponent,
    CvComponent,
  ],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly storageService = inject(StorageService);
  private readonly themeService = inject(ThemeService);

  private static readonly reloadScrollHandledStorageKey =
    'home-reload-scroll-handled';
  private destroyed = false;
  private shouldScrollToTopOnReload = false;

  async ngOnInit(): Promise<void> {
    await this.storageService.setStorage(NgStorage.LOADER, true);

    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }

      this.shouldScrollToTopOnReload = this.isReloadNavigation();
    }
  }

  async ngAfterViewInit(): Promise<void> {
    await this.releaseViewWhenReady();
    if (this.shouldScrollToTopOnReload) {
      this.scrollToTopSmooth();
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    void this.storageService.setStorage(NgStorage.LOADER, false);
  }

  private async releaseViewWhenReady(): Promise<void> {
    try {
      await this.themeService.loadAndApplyActiveTheme();
      await this.waitForNextPaint();
    } catch (error) {
      console.warn('Home loader fallback triggered.', error);
    } finally {
      if (!this.destroyed) {
        await this.storageService.setStorage(NgStorage.LOADER, false);
      }
    }
  }

  private waitForNextPaint(): Promise<void> {
    if (typeof window === 'undefined') {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => resolve());
      });
    });
  }

  private scrollToTopSmooth(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.animateWindowScroll(0);
  }

  private isReloadNavigation(): boolean {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return false;
    }

    const alreadyHandled =
      window.sessionStorage.getItem(
        HomeComponent.reloadScrollHandledStorageKey,
      ) === '1';
    if (alreadyHandled) {
      return false;
    }

    const navigationEntries = window.performance.getEntriesByType(
      'navigation',
    ) as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0) {
      const isReload = navigationEntries[0].type === 'reload';
      if (isReload) {
        window.sessionStorage.setItem(
          HomeComponent.reloadScrollHandledStorageKey,
          '1',
        );
      }
      return isReload;
    }

    const legacyNavigation = (
      window.performance as Performance & { navigation?: { type?: number } }
    ).navigation;
    const isReload = legacyNavigation?.type === 1;
    if (isReload) {
      window.sessionStorage.setItem(
        HomeComponent.reloadScrollHandledStorageKey,
        '1',
      );
    }
    return isReload;
  }

  private animateWindowScroll(targetTop: number): void {
    if (typeof window === 'undefined') {
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

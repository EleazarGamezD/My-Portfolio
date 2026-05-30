import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgStorage } from '@core/enum/ngStorage/ngStorage.enum';
import { RequestStateService } from '@core/services/request-state/request-state.service';
import { StorageService } from '@core/services/storage/storage.service';
import { requestTemplateReinit } from '@core/utils/template/template-reinit.utils';
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
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('portfolioView', { static: true }) private portfolioView?: ElementRef<HTMLElement>;

  private destroyed = false;
  private readonly viewportQuietWindowMs = 420;

  constructor(
    private readonly storageService: StorageService,
    private readonly requestStateService: RequestStateService,
  ) { }

  async ngOnInit(): Promise<void> {
    await this.storageService.setStorage(NgStorage.LOADER, true);

    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });
    }
  }

  async ngAfterViewInit(): Promise<void> {
    await this.releaseViewWhenReady();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    void this.storageService.setStorage(NgStorage.LOADER, false);
  }

  private async releaseViewWhenReady(): Promise<void> {
    await this.waitForNextPaint();
    await requestTemplateReinit();
    await this.requestStateService.waitForIdle();
    // Extra paint frames so Angular can process HTTP responses and re-render
    await this.waitForNextPaint();
    await this.waitForNextPaint();
    await this.waitForNextPaint();
    await this.waitForFonts();
    await this.waitForViewportStability();
    await this.waitForCriticalImages(this.portfolioView?.nativeElement);
    await this.waitForRealImages(8000);

    if (this.destroyed) {
      return;
    }

    await this.waitForNextPaint();
    await this.storageService.setStorage(NgStorage.LOADER, false);
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

  private async waitForFonts(): Promise<void> {
    if (typeof document === 'undefined' || !('fonts' in document)) {
      return;
    }

    await (document.fonts as FontFaceSet).ready.catch(() => undefined);
  }

  private async waitForCriticalImages(root?: HTMLElement): Promise<void> {
    if (!root || typeof window === 'undefined') {
      return;
    }

    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>('img[data-loader-critical="true"], img.hero-slide-preload'),
    ).filter((image) => this.isInInitialViewport(image) && !image.complete);

    if (!images.length) {
      return;
    }

    await Promise.all(images.map((image) => this.waitForImage(image)));
  }

  private async waitForRealImages(maxWaitMs = 8000): Promise<void> {
    if (typeof document === 'undefined') return;
    const images = Array.from(document.querySelectorAll<HTMLImageElement>('img'))
      .filter(
        (img) =>
          this.isInInitialViewport(img) &&
          img.src &&
          !img.src.startsWith('data:') &&
          !img.complete,
      );
    if (!images.length) return;
    await Promise.race([
      Promise.all(images.map((img) => this.waitForImage(img))),
      new Promise<void>((resolve) => setTimeout(resolve, maxWaitMs)),
    ]);
  }

  private waitForImage(image: HTMLImageElement): Promise<void> {
    return new Promise((resolve) => {
      function finish(): void {
        image.removeEventListener('load', finish);
        image.removeEventListener('error', finish);
        resolve();
      }

      image.addEventListener('load', finish, { once: true });
      image.addEventListener('error', finish, { once: true });
    });
  }

  private readonly viewportStabilityMaxWaitMs = 5000;

  private waitForViewportStability(): Promise<void> {
    if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let resolved = false;
      let quietTimerId: ReturnType<typeof setTimeout> | null = null;

      // Safety net: always resolve after max wait to prevent infinite hang
      // caused by continuous DOM mutations (animations, sliders, particles, etc.)
      const maxTimerId = setTimeout(() => finish(), this.viewportStabilityMaxWaitMs);

      const finish = () => {
        if (resolved) {
          return;
        }

        resolved = true;
        observer.disconnect();
        clearTimeout(maxTimerId);

        if (quietTimerId) {
          clearTimeout(quietTimerId);
        }

        resolve();
      };

      const scheduleQuietWindow = () => {
        if (quietTimerId) {
          clearTimeout(quietTimerId);
        }

        quietTimerId = setTimeout(() => {
          if (!this.hasPendingViewportImages()) {
            finish();
            return;
          }

          scheduleQuietWindow();
        }, this.viewportQuietWindowMs);
      };

      const observer = new MutationObserver(() => {
        scheduleQuietWindow();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['src', 'style', 'class'],
      });

      scheduleQuietWindow();
    });
  }

  private hasPendingViewportImages(): boolean {
    if (typeof document === 'undefined') {
      return false;
    }

    const viewportImages = Array.from(document.querySelectorAll<HTMLImageElement>('img')).filter((image) =>
      this.isInInitialViewport(image),
    );

    return viewportImages.some((image) => !image.complete);
  }

  private isInInitialViewport(element: Element): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const rect = element.getBoundingClientRect();
    return rect.bottom >= 0 && rect.top <= window.innerHeight;
  }
}

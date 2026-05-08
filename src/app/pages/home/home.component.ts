import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgStorage } from '@core/enum/ngStorage/ngStorage.enum';
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
  private readonly criticalImageTimeoutMs = 4000;

  constructor(private readonly storageService: StorageService) {}

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
    await this.waitForFonts();
    await this.waitForCriticalImages(this.portfolioView?.nativeElement);

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
    if (!root) {
      return;
    }

    const images = Array.from(
      root.querySelectorAll<HTMLImageElement>('img[data-loader-critical="true"], img.hero-slide-preload'),
    ).filter((image) => !image.complete);

    if (!images.length) {
      return;
    }

    await Promise.all(images.map((image) => this.waitForImage(image)));
  }

  private waitForImage(image: HTMLImageElement): Promise<void> {
    return new Promise((resolve) => {
      const timeoutId = globalThis.setTimeout(finish, this.criticalImageTimeoutMs);

      function finish(): void {
        globalThis.clearTimeout(timeoutId);
        image.removeEventListener('load', finish);
        image.removeEventListener('error', finish);
        resolve();
      }

      image.addEventListener('load', finish, { once: true });
      image.addEventListener('error', finish, { once: true });
    });
  }
}

import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { NgStorage } from '@core/enum/ngStorage/ngStorage.enum';
import { ContentService } from '@core/services/content/content.service';
import { ThemeService } from '@core/services/theme/theme.service';
import { ProjectsService } from '@services/projects/projects.service';
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
  private destroyed = false;
  private readonly criticalImageTimeoutMs = 2500;
  private readonly criticalAssetSelectors = [
    'header .default-logo',
    '.hero-slide-image',
  ];

  constructor(
    private readonly storageService: StorageService,
    private readonly contentService: ContentService,
    private readonly projectsService: ProjectsService,
    private readonly themeService: ThemeService,
  ) { }

  async ngOnInit(): Promise<void> {
    await this.storageService.setStorage(NgStorage.LOADER, true);
    this.prefetchBackgroundContent();

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
    try {
      await this.waitForNextPaint();
      await this.themeService.loadAndApplyActiveTheme();
      await requestTemplateReinit();
      await this.waitForNextPaint();
      await this.waitForCriticalAssets();
      await this.waitForNextPaint();
    } catch (error) {
      console.warn('Home loader fallback triggered.', error);
    }
    finally {
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

  private async waitForCriticalAssets(): Promise<void> {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    await Promise.all(this.criticalAssetSelectors.map((selector) => this.waitForCriticalImageSelector(selector)));
  }

  private waitForCriticalImageSelector(selector: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof document === 'undefined' || typeof window === 'undefined') {
        resolve();
        return;
      }

      const deadline = window.performance.now() + this.criticalImageTimeoutMs;

      const finish = (): void => {
        if (pollId) {
          window.clearTimeout(pollId);
        }
        window.clearTimeout(timeoutId);
        if (currentImage) {
          currentImage.removeEventListener('load', finish);
          currentImage.removeEventListener('error', finish);
        }
        resolve();
      };

      const bindImage = (image: HTMLImageElement): void => {
        currentImage = image;
        if (image.complete) {
          finish();
          return;
        }

        image.addEventListener('load', finish, { once: true });
        image.addEventListener('error', finish, { once: true });
      };

      const pollForImage = (): void => {
        const image = document.querySelector<HTMLImageElement>(selector);
        if (image) {
          bindImage(image);
          return;
        }

        if (window.performance.now() >= deadline) {
          finish();
          return;
        }

        pollId = window.setTimeout(pollForImage, 80);
      };

      let currentImage: HTMLImageElement | null = null;
      let pollId: number | null = null;
      const timeoutId = window.setTimeout(finish, this.criticalImageTimeoutMs);

      pollForImage();
    });
  }

  private prefetchBackgroundContent(): void {
    const backgroundRequests = [
      this.contentService.getProfile(),
      this.contentService.getTechSkills(),
      this.contentService.getExperience(),
      this.contentService.getTestimonials(),
      this.contentService.getSocialLinks(),
      this.contentService.getResumes(),
      this.projectsService.getProjects(),
    ];

    void Promise.allSettled(backgroundRequests);
  }
}

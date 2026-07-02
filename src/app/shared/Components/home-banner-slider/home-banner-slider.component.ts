import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { IApiHeroSlide } from '@core/interfaces/content/content.interface';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { requestTemplateReinit } from '@core/utils/template/template-reinit.utils';
import { HomeSwiperSlideElementComponent } from '../home-swiper-slide-element/home-swiper-slide-element.component';

@Component({
  selector: 'app-home-banner-slider',
  imports: [HomeSwiperSlideElementComponent],
  templateUrl: './home-banner-slider.component.html',
  styleUrl: './home-banner-slider.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeBannerSliderComponent implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly i18nService = inject(I18nService);
  private lastLanguage = this.i18nService.currentLanguage();

  private readonly languageRefresh = effect(() => {
    const language = this.i18nService.currentLanguage();
    if (language === this.lastLanguage) {
      return;
    }

    this.lastLanguage = language;
    this.changeDetectorRef.detectChanges();
    this.resetSliderAfterLanguageChange();
  });

  sliderContentArray: IApiHeroSlide[] = [];

  async ngOnInit() {
    try {
      const profile = await this.contentService.getProfile();
      this.sliderContentArray = profile?.metadata?.heroSlides ?? [];
    } catch (error) {
      console.warn('Failed to load hero slides from API.', error);
      this.sliderContentArray = [];
    } finally {
      this.changeDetectorRef.detectChanges();
      requestTemplateReinit();
    }
  }

  trackSlide(index: number, slide: IApiHeroSlide): string {
    const imageKey =
      typeof slide.image === 'string' ? slide.image : slide.image?.url || '';

    return imageKey || slide.title?.es || slide.title?.en || `${index}`;
  }

  private resetSliderAfterLanguageChange(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.setTimeout(() => {
      window.templateBridge?.resetSwipers?.();
      requestTemplateReinit([0, 120, 420]);
    });
  }
}

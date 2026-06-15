import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IApiHeroSlide } from '@core/interfaces/content/content.interface';
import { ContentService } from '@core/services/content/content.service';
import {HomeSwiperSlideElementComponent} from '../home-swiper-slide-element/home-swiper-slide-element.component';
import { requestTemplateReinit } from '@core/utils/template/template-reinit.utils';

@Component({
  selector: 'app-home-banner-slider',
  imports: [HomeSwiperSlideElementComponent],
  templateUrl: './home-banner-slider.component.html',
  styleUrl: './home-banner-slider.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeBannerSliderComponent implements OnInit {
  sliderContentArray: IApiHeroSlide[] = [];

  constructor(
    private readonly contentService: ContentService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

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
      typeof slide.image === 'string'
        ? slide.image
        : slide.image?.url || '';

    return imageKey || slide.title?.es || slide.title?.en || `${index}`;
  }
}

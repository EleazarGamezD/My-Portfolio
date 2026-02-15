import { Component, Input } from '@angular/core';
import { IHomeBannerSlider } from '@core/interfaces/home-banner-slider/home-banner-slider.interface';
import { I18nService } from '@core/services/i18n/i18n.service';

@Component({
  selector: 'app-home-swiper-slide-element',
  imports: [],
  templateUrl: './home-swiper-slide-element.component.html',
  styleUrl: './home-swiper-slide-element.component.scss',
})
export class HomeSwiperSlideElementComponent {
  constructor(public i18nService: I18nService) {}

  @Input({ required: true }) sliderContent: IHomeBannerSlider =
    {} as IHomeBannerSlider;

  get description() {
    return this.i18nService.selectText(
      this.sliderContent.descriptionEs,
      this.sliderContent.descriptionEn,
    );
  }

  get title() {
    return this.i18nService.selectText(
      this.sliderContent.titleEs,
      this.sliderContent.titleEn,
    );
  }
}

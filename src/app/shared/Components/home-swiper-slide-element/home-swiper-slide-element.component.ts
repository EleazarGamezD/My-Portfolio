import { Component, Input } from '@angular/core';
import { IApiHeroSlide } from '@core/interfaces/content/content.interface';
import { I18nService } from '@core/services/i18n/i18n.service';

@Component({
  selector: 'app-home-swiper-slide-element',
  imports: [],
  templateUrl: './home-swiper-slide-element.component.html',
  styleUrl: './home-swiper-slide-element.component.scss',
})
export class HomeSwiperSlideElementComponent {
  constructor(public i18nService: I18nService) {}

  @Input({ required: true }) sliderContent: IApiHeroSlide = {};

  get description() {
    return this.i18nService.selectText(
      this.sliderContent.description?.es ?? '',
      this.sliderContent.description?.en ?? this.sliderContent.description?.es ?? '',
    );
  }

  get title() {
    return this.i18nService.selectText(
      this.sliderContent.title?.es ?? '',
      this.sliderContent.title?.en ?? this.sliderContent.title?.es ?? '',
    );
  }
}

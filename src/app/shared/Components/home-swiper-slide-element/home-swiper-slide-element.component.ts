import { Component, Input } from '@angular/core';
import { IHomeBannerSlider } from '@core/interfaces/home-banner-slider/home-banner-slider.interface';

@Component({
  selector: 'app-home-swiper-slide-element',
  imports: [],
  templateUrl: './home-swiper-slide-element.component.html',
  styleUrl: './home-swiper-slide-element.component.scss',
})
export class HomeSwiperSlideElementComponent {
  @Input({ required: true }) sliderContent: IHomeBannerSlider =
    {} as IHomeBannerSlider;
}

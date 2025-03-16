import {Component} from '@angular/core';
import {IHomeBannerSlider} from '@core/interfaces/home-banner-slider/home-banner-slider.interface';
import {sliderContent} from '@shared/Json/homeBanner';
import {HomeSwiperSlideElementComponent} from '../home-swiper-slide-element/home-swiper-slide-element.component';

@Component({
  selector: 'app-home-banner-slider',
  imports: [HomeSwiperSlideElementComponent],
  templateUrl: './home-banner-slider.component.html',
  styleUrl: './home-banner-slider.component.scss',
})
export class HomeBannerSliderComponent {
  sliderContentArray: IHomeBannerSlider[] = sliderContent
}

import { Component } from '@angular/core';
import { HomeBannerSlider } from '@core/interfaces/home-banner-slider/home-banner-slider.interface';
import { HomeSwiperSlideElementComponent } from '../home-swiper-slide-element/home-swiper-slide-element.component';

@Component({
  selector: 'app-home-banner-slider',
  imports: [HomeSwiperSlideElementComponent],
  templateUrl: './home-banner-slider.component.html',
  styleUrl: './home-banner-slider.component.scss',
})
export class HomeBannerSliderComponent {
  sliderContentArray: HomeBannerSlider[] = [
    {
      title: 'Software Developer',
      description:
        'I am a software developer with a passion for creating innovative solutions that make a difference.',
      image: '/assets/images/home-banner-slider/bg-1.webp',
    },
    {
      title: 'Web Developer',
      description:
        'I am a web developer with a passion for creating beautiful and functional websites.',
      image: '/assets/images/home-banner-slider/keyboard.webp',
    },
    {
      title: 'Mobile Developer',
      description:
        'I am a mobile developer with a passion for creating beautiful and functional mobile applications.',
      image: '/assets/images/home-banner-slider/desktop-v3.webp',
    },
  ];
}

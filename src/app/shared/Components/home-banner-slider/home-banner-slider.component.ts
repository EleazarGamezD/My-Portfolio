import { Component } from '@angular/core';
import { IHomeBannerSlider } from '@core/interfaces/home-banner-slider/home-banner-slider.interface';
import { HomeSwiperSlideElementComponent } from '../home-swiper-slide-element/home-swiper-slide-element.component';

@Component({
  selector: 'app-home-banner-slider',
  imports: [HomeSwiperSlideElementComponent],
  templateUrl: './home-banner-slider.component.html',
  styleUrl: './home-banner-slider.component.scss',
})
export class HomeBannerSliderComponent {
  sliderContentArray: IHomeBannerSlider[] = [
    {
      title: 'Web Developer',
      description:
        'I am a software developer with a passion for creating innovative solutions that make a difference.',
      image: '/assets/images/backgrounds/bg-1.webp',
    },
    {
      title: 'Backend Developer',
      description:
        'I am a web developer with a passion for creating beautiful and functional websites.',
      image: '/assets/images/backgrounds/keyboard.webp',
    },
    {
      title: 'Frontend Developer',
      description:
        'I am a mobile developer with a passion for creating beautiful and functional mobile applications.',
      image: '/assets/images/backgrounds/wallpaperflare.com_wallpaper.jpg',
    },
  ];
}

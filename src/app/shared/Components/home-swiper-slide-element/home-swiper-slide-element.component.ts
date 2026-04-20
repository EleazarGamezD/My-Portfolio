import { Component, Input } from '@angular/core';
import { IApiHeroSlide } from '@core/interfaces/content/content.interface';
import { IProjectAsset } from '@core/interfaces/projects/projects.interfaces';
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

  get backgroundImage() {
    return this.resolveImage(this.sliderContent.image) || '/assets/images/shared/backgrounds/bg-1.webp';
  }

  private resolveImage(asset?: string | IProjectAsset | null) {
    if (!asset) {
      return null;
    }

    if (typeof asset === 'string') {
      return asset;
    }

    if (asset.url) {
      return asset.url;
    }

    if (asset.base64 && asset.mimeType) {
      return `data:${asset.mimeType};base64,${asset.base64}`;
    }

    if (asset.base64) {
      return asset.base64.startsWith('data:') ? asset.base64 : `data:image/webp;base64,${asset.base64}`;
    }

    return null;
  }
}

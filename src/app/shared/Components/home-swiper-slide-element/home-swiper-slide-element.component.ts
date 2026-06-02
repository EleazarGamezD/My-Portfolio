import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IApiHeroSlide } from '@core/interfaces/content/content.interface';
import { IProjectAsset } from '@core/interfaces/projects/projects.interfaces';
import { I18nService } from '@core/services/i18n/i18n.service';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import { createPortfolioPlaceholder } from '@core/utils/image/portfolio-placeholder.utils';
import { requestTemplateReinit } from '@core/utils/template/template-reinit.utils';

@Component({
  selector: 'app-home-swiper-slide-element',
  imports: [],
  templateUrl: './home-swiper-slide-element.component.html',
  styleUrl: './home-swiper-slide-element.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeSwiperSlideElementComponent {
  constructor(public i18nService: I18nService) {}

  @Input({ required: true }) sliderContent: IApiHeroSlide = {};
  @Input() priority = false;
  private priorityImageInitialized = false;

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
    return this.resolveImage(this.sliderContent.image) || createPortfolioPlaceholder('Hero Slide', 1600, 900);
  }

  onImageLoad() {
    if (!this.priority || this.priorityImageInitialized) {
      return;
    }

    this.priorityImageInitialized = true;
    requestTemplateReinit([120, 420, 900]);
  }

  private resolveImage(asset?: string | IProjectAsset | null) {
    return resolveImageAssetUrl(asset);
  }
}

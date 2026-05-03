import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IApiContentItem, IApiProfile } from '@core/interfaces/content/content.interface';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import { createPortfolioPlaceholder } from '@core/utils/image/portfolio-placeholder.utils';
import { requestTemplateReinit } from '@core/utils/template/template-reinit.utils';

@Component({
  selector: 'app-career-path',
  imports: [],
  templateUrl: './career-path.component.html',
  styleUrl: './career-path.component.scss',
})
export class CareerPathComponent implements OnInit {
  careerPathArray: IApiContentItem[] = [];
  profile: IApiProfile | null = null;

  constructor(
    public i18nService: I18nService,
    private readonly contentService: ContentService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    try {
      const [experience, profile] = await Promise.all([
        this.contentService.getExperience(),
        this.contentService.getProfile(),
      ]);
      this.careerPathArray = experience;
      this.profile = profile;
    } catch (error) {
      console.warn('Failed to load experience from API.', error);
    } finally {
      this.changeDetectorRef.detectChanges();
      requestTemplateReinit();
    }
  }

  getTitle(item: IApiContentItem) {
    return this.i18nService.selectText(
      item.label?.es ?? item.value ?? '',
      item.label?.en ?? item.label?.es ?? item.value ?? '',
    );
  }

  getDescription(item: IApiContentItem) {
    return this.i18nService.selectText(
      item.description?.es ?? '',
      item.description?.en ?? item.description?.es ?? '',
    );
  }

  getPeriod(item: IApiContentItem) {
    if (item.period?.start) {
      if (item.period.current || !item.period.end) {
        return `${item.period.start} - Actual`;
      }

      return `${item.period.start} - ${item.period.end}`;
    }

    return item.value ?? '';
  }

  t(key: string) {
    return this.i18nService.t(key);
  }

  get apiIcon() {
    return (
      resolveImageAssetUrl(this.profile?.metadata?.portfolioMedia?.decorativeApiIcon) ||
      createPortfolioPlaceholder('API Icon', 360, 360)
    );
  }

  get rainDigits() {
    return (
      resolveImageAssetUrl(this.profile?.metadata?.portfolioMedia?.decorativeRainDigits) ||
      createPortfolioPlaceholder('Rain Digits', 640, 640)
    );
  }

  get webBackground() {
    return (
      resolveImageAssetUrl(this.profile?.metadata?.portfolioMedia?.decorativeWebBackground) ||
      createPortfolioPlaceholder('Web Background', 520, 520)
    );
  }
}

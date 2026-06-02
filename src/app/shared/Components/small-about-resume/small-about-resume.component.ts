import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IApiProfile } from '@core/interfaces/content/content.interface';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import { createPortfolioPlaceholder } from '@core/utils/image/portfolio-placeholder.utils';
import { requestTemplateReinit } from '@core/utils/template/template-reinit.utils';

@Component({
  selector: 'app-small-about-resume',
  imports: [],
  templateUrl: './small-about-resume.component.html',
  styleUrl: './small-about-resume.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmallAboutResumeComponent implements OnInit {
  profile: IApiProfile | null = null;

  constructor(
    public i18nService: I18nService,
    private readonly contentService: ContentService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    try {
      this.profile = await this.contentService.getProfile();
    } catch (error) {
      console.warn('Failed to load profile content from API.', error);
    } finally {
      this.changeDetectorRef.markForCheck();
      requestTemplateReinit();
    }
  }

  get titleText() {
    return this.profile
      ? this.i18nService.selectText(
          this.profile.title?.es ?? '',
          this.profile.title?.en ?? this.profile.title?.es ?? '',
        )
      : '';
  }

  get primaryDescription() {
    return this.profile
      ? this.i18nService.selectText(
          this.profile.description?.es ?? '',
          this.profile.description?.en ?? this.profile.description?.es ?? '',
        )
      : '';
  }

  get secondaryDescription() {
    return this.profile
      ? this.i18nService.selectText(
          this.profile.metadata?.about?.es ?? '',
          this.profile.metadata?.about?.en ?? this.profile.metadata?.about?.es ?? '',
        )
      : '';
  }

  get primaryImage() {
    return (
      resolveImageAssetUrl(this.profile?.metadata?.portfolioMedia?.aboutPrimaryImage) ||
      createPortfolioPlaceholder('About Photo A', 900, 1100)
    );
  }

  get secondaryImage() {
    return (
      resolveImageAssetUrl(this.profile?.metadata?.portfolioMedia?.aboutSecondaryImage) ||
      createPortfolioPlaceholder('About Photo B', 900, 1100)
    );
  }

  t(key: string) {
    return this.i18nService.t(key);
  }
}

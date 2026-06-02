import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IApiProfile } from '@core/interfaces/content/content.interface';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import { createPortfolioPlaceholder } from '@core/utils/image/portfolio-placeholder.utils';
import { requestTemplateReinit } from '@core/utils/template/template-reinit.utils';

@Component({
  selector: 'app-small-about-resume',
  templateUrl: './small-about-resume.component.html',
  styleUrl: './small-about-resume.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmallAboutResumeComponent implements OnInit {
  profile: IApiProfile | null = null;
  primaryImageSrc = createPortfolioPlaceholder('About Photo A', 900, 1100);
  secondaryImageSrc = createPortfolioPlaceholder('About Photo B', 900, 1100);

  constructor(
    public i18nService: I18nService,
    private readonly contentService: ContentService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    try {
      this.profile = await this.contentService.getProfile();
      this.syncPortfolioMedia();
    } catch (error) {
      console.warn('Failed to load profile content from API.', error);
    } finally {
      this.changeDetectorRef.detectChanges();
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
    if (!this.profile) {
      return '';
    }

    const profileDescription = this.i18nService.selectText(
      this.profile.description?.es ?? '',
      this.profile.description?.en ?? this.profile.description?.es ?? '',
    );

    if (profileDescription.trim()) {
      return profileDescription;
    }

    return this.i18nService.selectText(
      this.profile.metadata?.about?.es ?? '',
      this.profile.metadata?.about?.en ?? this.profile.metadata?.about?.es ?? '',
    );
  }

  get secondaryDescription() {
    if (!this.profile) {
      return '';
    }

    const aboutDescription = this.i18nService.selectText(
      this.profile.metadata?.about?.es ?? '',
      this.profile.metadata?.about?.en ?? this.profile.metadata?.about?.es ?? '',
    );

    if (aboutDescription.trim() && aboutDescription.trim() !== this.primaryDescription.trim()) {
      return aboutDescription;
    }

    return '';
  }

  get sectionBackgroundImage() {
    if (this.profile?.metadata?.portfolioMedia?.aboutSectionTransparentBackground) {
      return 'none';
    }

    const backgroundUrl =
      resolveImageAssetUrl(this.profile?.metadata?.portfolioMedia?.aboutSectionBackground) ||
      'images/demo-spa-salon-home-bg-01.jpg';
    return backgroundUrl ? `url('${backgroundUrl}')` : 'none';
  }

  t(key: string) {
    return this.i18nService.t(key);
  }

  private syncPortfolioMedia(): void {
    this.primaryImageSrc =
      resolveImageAssetUrl(this.profile?.metadata?.portfolioMedia?.aboutPrimaryImage) ||
      createPortfolioPlaceholder('About Photo A', 900, 1100);

    this.secondaryImageSrc =
      resolveImageAssetUrl(this.profile?.metadata?.portfolioMedia?.aboutSecondaryImage) ||
      createPortfolioPlaceholder('About Photo B', 900, 1100);
  }
}

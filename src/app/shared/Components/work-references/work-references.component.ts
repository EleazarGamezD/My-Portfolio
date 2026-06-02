import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IApiContentItem, IApiProfile } from '@core/interfaces/content/content.interface';
import { ContentService } from '@core/services/content/content.service';
import { I18nService } from '@core/services/i18n/i18n.service';
import { resolveImageAssetUrl } from '@core/utils/image/admin-image.utils';
import { createPortfolioPlaceholder } from '@core/utils/image/portfolio-placeholder.utils';
import { requestTemplateReinit } from '@core/utils/template/template-reinit.utils';

@Component({
  selector: 'app-work-references',
  imports: [],
  templateUrl: './work-references.component.html',
  styleUrl: './work-references.component.scss'
})
export class WorkReferencesComponent implements OnInit {
  profile: IApiProfile | null = null;
  workReferences: IApiContentItem[] = [];
  downSideIcons: { url: string }[] = [];

  constructor(
    public i18nService: I18nService,
    private readonly contentService: ContentService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    try {
      const [testimonials, profile] = await Promise.all([
        this.contentService.getTestimonials(),
        this.contentService.getProfile(),
      ]);
      this.workReferences = Array.isArray(testimonials)
        ? testimonials.filter((item): item is IApiContentItem => Boolean(item))
        : [];
      this.profile = profile;
      this.downSideIcons = (profile.metadata?.portfolioMedia?.testimonialLogos ?? [])
        .map((asset) => resolveImageAssetUrl(asset))
        .filter((url): url is string => Boolean(url))
        .map((url) => ({ url }));
    } catch (error) {
      console.warn('Failed to load testimonials from API.', error);
    } finally {
      this.changeDetectorRef.detectChanges();
      requestTemplateReinit();
    }
  }

  getTestimonial(item: IApiContentItem | null | undefined) {
    return this.i18nService.selectText(
      item?.description?.es ?? '',
      item?.description?.en ?? item?.description?.es ?? '',
    );
  }

  getMetadataText(item: IApiContentItem | null | undefined, key: 'position' | 'company') {
    const value = item?.[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }

    const metadataValue = item?.metadata?.[key];
    return typeof metadataValue === 'string' ? metadataValue : '';
  }

  getName(item: IApiContentItem | null | undefined) {
    if (typeof item?.name === 'string' && item.name.trim()) {
      return item.name;
    }

    const metadataName = item?.metadata?.['name'];
    if (typeof metadataName === 'string' && metadataName.trim()) {
      return metadataName;
    }

    return this.i18nService.selectText(
      item?.label?.es ?? '',
      item?.label?.en ?? item?.label?.es ?? '',
    );
  }

  t(key: string) {
    return this.i18nService.t(key);
  }

  get serverIcon() {
    return (
      resolveImageAssetUrl(this.profile?.metadata?.portfolioMedia?.decorativeServerIcon) ||
      createPortfolioPlaceholder('Server Icon', 360, 360)
    );
  }

  get sectionBackgroundImage() {
    if (this.profile?.metadata?.portfolioMedia?.testimonialsSectionTransparentBackground) {
      return 'none';
    }

    const backgroundUrl =
      resolveImageAssetUrl(this.profile?.metadata?.portfolioMedia?.testimonialsSectionBackground) ||
      'images/demo-spa-salon-home-bg-01.jpg';
    return backgroundUrl ? `url('${backgroundUrl}')` : 'none';
  }
}

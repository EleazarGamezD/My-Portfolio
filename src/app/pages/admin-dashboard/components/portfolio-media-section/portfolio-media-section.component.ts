import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IApiPortfolioMedia, IApiProfile } from '@core/interfaces/content/content.interface';
import { IProjectAsset } from '@core/interfaces/projects/projects.interfaces';
import { ButtonModule, CardModule, SpinnerModule } from '@coreui/angular';
import { PhotoEditorComponent } from '../shared/photo-editor/photo-editor.component';

type PortfolioMediaAssetField = keyof Omit<
  IApiPortfolioMedia,
  | 'testimonialLogos'
  | 'aboutSectionTransparentBackground'
  | 'projectsSectionTransparentBackground'
  | 'testimonialsSectionTransparentBackground'
  | 'contactSectionTransparentBackground'
>;

type PortfolioMediaBooleanField =
  | 'aboutSectionTransparentBackground'
  | 'projectsSectionTransparentBackground'
  | 'testimonialsSectionTransparentBackground'
  | 'contactSectionTransparentBackground';

@Component({
  selector: 'app-admin-portfolio-media-section',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, SpinnerModule, PhotoEditorComponent],
  templateUrl: './portfolio-media-section.component.html',
  styleUrl: './portfolio-media-section.component.scss',
})
export class AdminPortfolioMediaSectionComponent {
  @Input() profile: IApiProfile | null = null;
  @Input() contentLoading = false;
  @Input() saveLoading = false;
  @Output() saveProfile = new EventEmitter<void>();
  @Output() imageUploadError = new EventEmitter<string>();
  readonly backgroundMaxMb = 10;
  readonly mediaMaxMb = 8;

  get portfolioMedia(): IApiPortfolioMedia {
    if (!this.profile) {
      return {};
    }

    this.profile.metadata ??= {};
    this.profile.metadata.about ??= { es: '', en: '' };
    this.profile.metadata.heroSlides ??= [];
    this.profile.metadata.portfolioMedia ??= {
      testimonialLogos: [],
      aboutSectionTransparentBackground: false,
      projectsSectionTransparentBackground: false,
      testimonialsSectionTransparentBackground: false,
      contactSectionTransparentBackground: false,
    };
    this.profile.metadata.portfolioMedia.testimonialLogos ??= [];
    this.profile.metadata.portfolioMedia.aboutSectionTransparentBackground ??= false;
    this.profile.metadata.portfolioMedia.projectsSectionTransparentBackground ??= false;
    this.profile.metadata.portfolioMedia.testimonialsSectionTransparentBackground ??= false;
    this.profile.metadata.portfolioMedia.contactSectionTransparentBackground ??= false;

    return this.profile.metadata.portfolioMedia;
  }

  setSingleAsset(field: PortfolioMediaAssetField, assets: IProjectAsset[]) {
    this.portfolioMedia[field] = assets[0] ?? null;
  }

  setBooleanField(field: PortfolioMediaBooleanField, value: boolean) {
    this.portfolioMedia[field] = value;
  }

  setTestimonialLogos(assets: IProjectAsset[]) {
    this.portfolioMedia.testimonialLogos = [...assets];
  }

  getSingleAsset(field: PortfolioMediaAssetField): IProjectAsset[] {
    const asset = this.portfolioMedia[field];

    if (!asset) {
      return [];
    }

    return [typeof asset === 'string' ? { url: asset } : asset];
  }

  getTestimonialLogos(): IProjectAsset[] {
    return (this.portfolioMedia.testimonialLogos ?? []).map((asset) =>
      typeof asset === 'string' ? { url: asset } : asset,
    );
  }

  isTransparentBackground(field: PortfolioMediaBooleanField): boolean {
    return this.portfolioMedia[field] ?? false;
  }
}

import type { IProjectAsset } from '@core/interfaces/projects/projects.interfaces';

export interface ILocalizedText {
  es?: string;
  en?: string;
}

export interface IApiExperiencePeriod {
  start?: string;
  end?: string | null;
  current?: boolean;
}

export interface IApiHeroSlide {
  title?: ILocalizedText;
  description?: ILocalizedText;
  image?: string | IProjectAsset | null;
}

export interface IApiPortfolioMedia {
  headerLogo?: string | IProjectAsset | null;
  aboutPrimaryImage?: string | IProjectAsset | null;
  aboutSecondaryImage?: string | IProjectAsset | null;
  footerCenterImage?: string | IProjectAsset | null;
  aboutSectionBackground?: string | IProjectAsset | null;
  aboutSectionTransparentBackground?: boolean;
  cvHeroBackground?: string | IProjectAsset | null;
  cvSectionBackground?: string | IProjectAsset | null;
  heroSlideFallbackImage?: string | IProjectAsset | null;
  projectFallbackImage?: string | IProjectAsset | null;
  projectsSectionBackground?: string | IProjectAsset | null;
  projectsSectionTransparentBackground?: boolean;
  testimonialsSectionBackground?: string | IProjectAsset | null;
  testimonialsSectionTransparentBackground?: boolean;
  contactSectionBackground?: string | IProjectAsset | null;
  contactSectionTransparentBackground?: boolean;
  decorativeCloudIcon?: string | IProjectAsset | null;
  decorativeWebDevelopmentIcon?: string | IProjectAsset | null;
  decorativeMultitaskIcon?: string | IProjectAsset | null;
  decorativeApiIcon?: string | IProjectAsset | null;
  decorativeServerIcon?: string | IProjectAsset | null;
  decorativeRainDigits?: string | IProjectAsset | null;
  decorativeWebBackground?: string | IProjectAsset | null;
  testimonialLogos?: Array<string | IProjectAsset>;
}

export interface IApiProfileMetadata {
  about?: ILocalizedText;
  heroSlides?: IApiHeroSlide[];
  portfolioMedia?: IApiPortfolioMedia;
}

export interface IApiContentItem {
  _id?: string;
  slug?: string;
  label?: ILocalizedText;
  title?: ILocalizedText;
  description?: ILocalizedText;
  value?: string;
  name?: string;
  position?: string;
  company?: string;
  language?: string;
  period?: IApiExperiencePeriod;
  icon?: string | IProjectAsset | null;
  href?: string;
  order?: number;
  active?: boolean;
  metadata?: Record<string, unknown>;
  /** Skill IDs associated with this content item (e.g. experience entry). Stored in metadata.skillIds. */
  skillIds?: string[];
}

export interface IApiTechSkill extends IApiContentItem {
  icon?: string | IProjectAsset | null;
  value?: string;
}

export interface IApiResume extends IApiContentItem {
  fileName?: string;
  mimeType?: string;
  base64?: string;
  active?: boolean;
}

export interface IApiProfile {
  _id?: string;
  slug?: string;
  label?: ILocalizedText;
  title?: ILocalizedText;
  description?: ILocalizedText;
  location?: string;
  availability?: string;
  email?: string;
  phone?: string;
  metadata?: IApiProfileMetadata;
}

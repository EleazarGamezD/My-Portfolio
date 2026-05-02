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

export interface IApiContentItem {
  _id?: string;
  slug?: string;
  label?: ILocalizedText;
  title?: ILocalizedText;
  description?: ILocalizedText;
  value?: string;
  period?: IApiExperiencePeriod;
  icon?: string | IProjectAsset | null;
  href?: string;
  order?: number;
  active?: boolean;
  metadata?: Record<string, unknown>;
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
  metadata?: {
    about?: ILocalizedText;
    heroSlides?: IApiHeroSlide[];
  };
}

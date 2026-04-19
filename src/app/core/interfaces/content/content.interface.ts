export interface ILocalizedText {
  es?: string;
  en?: string;
}

export interface IApiHeroSlide {
  title?: ILocalizedText;
  description?: ILocalizedText;
  image?: string;
}

export interface IApiContentItem {
  label?: ILocalizedText;
  title?: ILocalizedText;
  description?: ILocalizedText;
  value?: string;
  icon?: string | null;
  href?: string;
  metadata?: Record<string, unknown>;
}

export interface IApiProfile {
  label?: ILocalizedText;
  title?: ILocalizedText;
  description?: ILocalizedText;
  location?: string;
  availability?: string;
  metadata?: {
    about?: ILocalizedText;
    heroSlides?: IApiHeroSlide[];
  };
}

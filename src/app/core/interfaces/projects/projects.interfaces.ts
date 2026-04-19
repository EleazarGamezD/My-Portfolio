export interface ILocalizedText {
  es?: string;
  en?: string;
}

export interface IProjectAsset {
  url?: string;
  base64?: string;
  mimeType?: string;
  fileName?: string;
}

export interface IProject {
  _id?: string;
  slug?: string;
  title?: ILocalizedText;
  summary?: ILocalizedText;
  description?: ILocalizedText;
  stack?: string[];
  images?: Array<string | IProjectAsset>;
  coverImage?: string | IProjectAsset | null;
  projectLink?: string;
  codeLink?: string;
  icon?: string;
}

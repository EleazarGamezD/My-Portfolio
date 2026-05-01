export interface ILocalizedText {
  es?: string;
  en?: string;
}

export interface IProjectAsset {
  id?: string;
  name?: string;
  url?: string;
  file?: string;
  base64?: string;
  fileName?: string;
  extension?: string;
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
  featured?: boolean;
  status?: string;
  publishedAt?: string;
}

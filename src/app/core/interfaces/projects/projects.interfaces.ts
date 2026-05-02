import type { IApiTechSkill } from '@core/interfaces/content/content.interface';

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
  skillIds?: string[];
  primarySkillId?: string | null;
  skills?: IApiTechSkill[];
  primarySkill?: IApiTechSkill | null;
  images?: Array<string | IProjectAsset>;
  coverImage?: string | IProjectAsset | null;
  projectLink?: string;
  codeLink?: string;
  icon?: string;
  featured?: boolean;
  status?: string;
  publishedAt?: string;
}

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginationResponse<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

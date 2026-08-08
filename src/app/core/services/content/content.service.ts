import { Injectable } from '@angular/core';
import { RequestMethod } from '@core/enum/globalHttpRequest/globalHttpRequest.enum';
import type { TechSkillCategory } from '@core/enum/tech-skills/tech-skill-category.enum';
import {
  IApiContentItem,
  IApiProfile,
  IApiResume,
  IApiTechSkill,
} from '@core/interfaces/content/content.interface';
import { IPaginationOptions, IPaginationResponse } from '@core/interfaces/projects/projects.interfaces';
import { API_CONTENT_ROUTES } from '@core/routes/content/content.routes';
import { GlobalHttpService } from '@services/globalHttp/global-http.service';

interface TechSkillPaginationOptions extends IPaginationOptions {
  search?: string;
  category?: TechSkillCategory;
}

@Injectable({
  providedIn: 'root',
})
export class ContentService extends GlobalHttpService {
  private normalizeContentItems(items: IApiContentItem[] | null | undefined): IApiContentItem[] {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter((item): item is IApiContentItem => Boolean(item)).map((item) => ({
      ...item,
      label: { es: item.label?.es ?? '', en: item.label?.en ?? '' },
      title: { es: item.title?.es ?? '', en: item.title?.en ?? '' },
      description: { es: item.description?.es ?? '', en: item.description?.en ?? '' },
      period: {
        start: item.period?.start ?? '',
        end: item.period?.end ?? null,
        current: item.period?.current ?? false,
      },
      metadata: item.metadata && typeof item.metadata === 'object' ? item.metadata : {},
      name:
        typeof item.name === 'string' && item.name.trim()
          ? item.name
          : typeof item.metadata?.['name'] === 'string'
            ? item.metadata['name']
            : undefined,
      position:
        typeof item.position === 'string' && item.position.trim()
          ? item.position
          : typeof item.metadata?.['position'] === 'string'
            ? item.metadata['position']
            : undefined,
      company:
        typeof item.company === 'string' && item.company.trim()
          ? item.company
          : typeof item.metadata?.['company'] === 'string'
            ? item.metadata['company']
            : undefined,
      language:
        typeof item.language === 'string' && item.language.trim()
          ? item.language
          : typeof item.metadata?.['language'] === 'string'
            ? item.metadata['language']
            : undefined,
    }));
  }

  private normalizeResumes(items: IApiResume[] | null | undefined): IApiResume[] {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter((item): item is IApiResume => Boolean(item)).map((item) => ({
      ...item,
      metadata: item.metadata && typeof item.metadata === 'object' ? item.metadata : {},
      language:
        typeof item.language === 'string' && item.language.trim()
          ? item.language
          : typeof item.metadata?.['language'] === 'string'
            ? item.metadata['language']
            : undefined,
    }));
  }

  private buildPaginatedRoute(baseRoute: string, options: IPaginationOptions): string {
    const params = new URLSearchParams();

    if (typeof options.page === 'number') {
      params.set('page', options.page.toString());
    }

    if (typeof options.limit === 'number') {
      params.set('limit', options.limit.toString());
    }

    if (typeof options.sortBy === 'string' && options.sortBy.trim()) {
      params.set('sortBy', options.sortBy.trim());
    }

    if (options.sortOrder === 'asc' || options.sortOrder === 'desc') {
      params.set('sortOrder', options.sortOrder);
    }

    return params.size ? `${baseRoute}?${params.toString()}` : baseRoute;
  }

  async createContentItem<T extends IApiContentItem | IApiResume>(
    resourceName: string,
    payload: Partial<T>,
  ): Promise<T> {
    const response = await this.makeRequest<T, Partial<T>>(
      API_CONTENT_ROUTES.getResource(resourceName),
      payload,
      RequestMethod.POST,
    );
    this.invalidateResourceCache(resourceName);
    return response;
  }

  async updateProfile(payload: Partial<IApiProfile>): Promise<IApiProfile> {
    return this.makeRequest<IApiProfile, Partial<IApiProfile>>(
      API_CONTENT_ROUTES.updateProfile,
      payload,
      RequestMethod.PUT,
    );
  }

  async getProfile(): Promise<IApiProfile> {
    return this.makeRequest<IApiProfile, null>(
      API_CONTENT_ROUTES.getProfile,
      null,
      RequestMethod.GET,
    );
  }

  async getTechSkills(): Promise<IApiTechSkill[]> {
    return this.makeRequest<IApiTechSkill[], null>(
      API_CONTENT_ROUTES.getTechSkills,
      null,
      RequestMethod.GET,
    );
  }

  async getTechSkillsPaginated(options: TechSkillPaginationOptions): Promise<IPaginationResponse<IApiTechSkill>> {
    const params = new URLSearchParams(this.buildPaginatedRoute('', options).replace(/^\?/u, ''));
    if (options.search?.trim()) params.set('search', options.search.trim());
    if (options.category) params.set('category', options.category);
    const route = `${API_CONTENT_ROUTES.getTechSkills}?${params.toString()}`;
    return this.makeRequest<IPaginationResponse<IApiTechSkill>, null>(route, null, RequestMethod.GET);
  }

  async getExperience(): Promise<IApiContentItem[]> {
    return this.makeRequest<IApiContentItem[], null>(API_CONTENT_ROUTES.getExperience, null, RequestMethod.GET).then(
      (items) => this.normalizeContentItems(items),
    );
  }

  async getEducation(): Promise<IApiContentItem[]> {
    return this.makeRequest<IApiContentItem[], null>(API_CONTENT_ROUTES.getEducation, null, RequestMethod.GET).then(
      (items) => this.normalizeContentItems(items),
    );
  }

  async getCertifications(): Promise<IApiContentItem[]> {
    return this.makeRequest<IApiContentItem[], null>(API_CONTENT_ROUTES.getCertifications, null, RequestMethod.GET).then(
      (items) => this.normalizeContentItems(items),
    );
  }

  async getTestimonials(): Promise<IApiContentItem[]> {
    return this.makeRequest<IApiContentItem[], null>(API_CONTENT_ROUTES.getTestimonials, null, RequestMethod.GET).then(
      (items) => this.normalizeContentItems(items),
    );
  }

  async getTestimonialsPaginated(options: IPaginationOptions): Promise<IPaginationResponse<IApiContentItem>> {
    const route = this.buildPaginatedRoute(API_CONTENT_ROUTES.getTestimonials, options);
    return this.makeRequest<IPaginationResponse<IApiContentItem>, null>(route, null, RequestMethod.GET);
  }

  async getSocialLinks(): Promise<IApiContentItem[]> {
    return this.makeRequest<IApiContentItem[], null>(API_CONTENT_ROUTES.getSocialLinks, null, RequestMethod.GET).then(
      (items) => this.normalizeContentItems(items),
    );
  }

  async getResumes(): Promise<IApiResume[]> {
    return this.makeRequest<IApiResume[], null>(API_CONTENT_ROUTES.getResumes, null, RequestMethod.GET).then((items) =>
      this.normalizeResumes(items),
    );
  }

  async updateContentItem<T extends IApiContentItem | IApiResume>(
    resourceName: string,
    id: string,
    payload: Partial<T>,
  ): Promise<T> {
    const response = await this.makeRequest<T, Partial<T>>(
      API_CONTENT_ROUTES.updateResourceItem(resourceName, id),
      payload,
      RequestMethod.PATCH,
    );
    return response;
  }

  async deleteContentItem(resourceName: string, id: string): Promise<{ deleted: boolean }> {
    const response = await this.makeRequest<{ deleted: boolean }, null>(
      API_CONTENT_ROUTES.deleteResourceItem(resourceName, id),
      null,
      RequestMethod.DELETE,
    );
    return response;
  }

  invalidateResourceCache(_resourceName: string): void {
    void _resourceName;
  }

  invalidateAllContentCache(): void {
    return;
  }
}

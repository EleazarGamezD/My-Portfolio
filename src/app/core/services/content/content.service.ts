import { Injectable } from '@angular/core';
import { RequestMethod } from '@core/enum/globalHttpRequest/globalHttpRequest.enum';
import {
  IApiContentItem,
  IApiProfile,
  IApiResume,
  IApiTechSkill,
} from '@core/interfaces/content/content.interface';
import { IPaginationOptions, IPaginationResponse } from '@core/interfaces/projects/projects.interfaces';
import { API_CONTENT_ROUTES } from '@core/routes/content/content.routes';
import { GlobalHttpService } from '@services/globalHttp/global-http.service';

@Injectable({
  providedIn: 'root',
})
export class ContentService extends GlobalHttpService {
  private profilePromise: Promise<IApiProfile> | null = null;
  private techSkillsPromise: Promise<IApiTechSkill[]> | null = null;
  private experiencePromise: Promise<IApiContentItem[]> | null = null;
  private testimonialsPromise: Promise<IApiContentItem[]> | null = null;
  private socialLinksPromise: Promise<IApiContentItem[]> | null = null;
  private resumesPromise: Promise<IApiResume[]> | null = null;

  private withCacheResetOnError<T>(
    request: Promise<T>,
    reset: () => void,
  ): Promise<T> {
    return request.catch((error) => {
      reset();
      throw error;
    });
  }

  private normalizeContentItems(items: IApiContentItem[] | null | undefined): IApiContentItem[] {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter((item): item is IApiContentItem => Boolean(item)).map((item) => ({
      ...item,
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
    const response = await this.makeRequest<IApiProfile, Partial<IApiProfile>>(
      API_CONTENT_ROUTES.updateProfile,
      payload,
      RequestMethod.PUT,
    );
    this.profilePromise = Promise.resolve(response);
    return response;
  }

  async getProfile(): Promise<IApiProfile> {
    this.profilePromise ??= this.withCacheResetOnError(
      this.makeRequest<IApiProfile, null>(
        API_CONTENT_ROUTES.getProfile,
        null,
        RequestMethod.GET,
      ),
      () => {
        this.profilePromise = null;
      },
    );

    return this.profilePromise;
  }

  async getTechSkills(): Promise<IApiTechSkill[]> {
    this.techSkillsPromise ??= this.withCacheResetOnError(
      this.makeRequest<IApiTechSkill[], null>(
        API_CONTENT_ROUTES.getTechSkills,
        null,
        RequestMethod.GET,
      ),
      () => {
        this.techSkillsPromise = null;
      },
    );

    return this.techSkillsPromise;
  }

  async getTechSkillsPaginated(options: IPaginationOptions): Promise<IPaginationResponse<IApiTechSkill>> {
    const route = this.buildPaginatedRoute(API_CONTENT_ROUTES.getTechSkills, options);
    return this.makeRequest<IPaginationResponse<IApiTechSkill>, null>(route, null, RequestMethod.GET);
  }

  async getExperience(): Promise<IApiContentItem[]> {
    this.experiencePromise ??= this.withCacheResetOnError(
      this.makeRequest<IApiContentItem[], null>(API_CONTENT_ROUTES.getExperience, null, RequestMethod.GET).then(
        (items) => this.normalizeContentItems(items),
      ),
      () => {
        this.experiencePromise = null;
      },
    );

    return this.experiencePromise;
  }

  async getTestimonials(): Promise<IApiContentItem[]> {
    this.testimonialsPromise ??= this.withCacheResetOnError(
      this.makeRequest<IApiContentItem[], null>(API_CONTENT_ROUTES.getTestimonials, null, RequestMethod.GET).then(
        (items) => this.normalizeContentItems(items),
      ),
      () => {
        this.testimonialsPromise = null;
      },
    );

    return this.testimonialsPromise;
  }

  async getTestimonialsPaginated(options: IPaginationOptions): Promise<IPaginationResponse<IApiContentItem>> {
    const route = this.buildPaginatedRoute(API_CONTENT_ROUTES.getTestimonials, options);
    return this.makeRequest<IPaginationResponse<IApiContentItem>, null>(route, null, RequestMethod.GET);
  }

  async getSocialLinks(): Promise<IApiContentItem[]> {
    this.socialLinksPromise ??= this.withCacheResetOnError(
      this.makeRequest<IApiContentItem[], null>(API_CONTENT_ROUTES.getSocialLinks, null, RequestMethod.GET).then(
        (items) => this.normalizeContentItems(items),
      ),
      () => {
        this.socialLinksPromise = null;
      },
    );

    return this.socialLinksPromise;
  }

  async getResumes(): Promise<IApiResume[]> {
    this.resumesPromise ??= this.withCacheResetOnError(
      this.makeRequest<IApiResume[], null>(API_CONTENT_ROUTES.getResumes, null, RequestMethod.GET).then((items) =>
        this.normalizeResumes(items),
      ),
      () => {
        this.resumesPromise = null;
      },
    );

    return this.resumesPromise;
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
    this.invalidateResourceCache(resourceName);
    return response;
  }

  async deleteContentItem(resourceName: string, id: string): Promise<{ deleted: boolean }> {
    const response = await this.makeRequest<{ deleted: boolean }, null>(
      API_CONTENT_ROUTES.deleteResourceItem(resourceName, id),
      null,
      RequestMethod.DELETE,
    );
    this.invalidateResourceCache(resourceName);
    return response;
  }

  private invalidateResourceCache(resourceName: string) {
    switch (resourceName) {
      case 'profile':
        this.profilePromise = null;
        return;
      case 'techSkills':
        this.techSkillsPromise = null;
        return;
      case 'experience':
        this.experiencePromise = null;
        return;
      case 'testimonials':
        this.testimonialsPromise = null;
        return;
      case 'socialLinks':
        this.socialLinksPromise = null;
        return;
      case 'resumes':
        this.resumesPromise = null;
        return;
      default:
        return;
    }
  }
}

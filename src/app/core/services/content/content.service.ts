import { Injectable } from '@angular/core';
import { RequestMethod } from '@core/enum/globalHttpRequest/globalHttpRequest.enum';
import {
  IApiContentItem,
  IApiProfile,
  IApiResume,
} from '@core/interfaces/content/content.interface';
import { API_CONTENT_ROUTES } from '@core/routes/content/content.routes';
import { GlobalHttpService } from '@services/globalHttp/global-http.service';

@Injectable({
  providedIn: 'root',
})
export class ContentService extends GlobalHttpService {
  async createContentItem<T extends IApiContentItem | IApiResume>(
    resourceName: string,
    payload: Partial<T>,
  ): Promise<T> {
    return this.makeRequest<T, Partial<T>>(
      API_CONTENT_ROUTES.getResource(resourceName),
      payload,
      RequestMethod.POST,
    );
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

  async getTechSkills(): Promise<IApiContentItem[]> {
    return this.makeRequest<IApiContentItem[], null>(
      API_CONTENT_ROUTES.getTechSkills,
      null,
      RequestMethod.GET,
    );
  }

  async getExperience(): Promise<IApiContentItem[]> {
    return this.makeRequest<IApiContentItem[], null>(
      API_CONTENT_ROUTES.getExperience,
      null,
      RequestMethod.GET,
    );
  }

  async getTestimonials(): Promise<IApiContentItem[]> {
    return this.makeRequest<IApiContentItem[], null>(
      API_CONTENT_ROUTES.getTestimonials,
      null,
      RequestMethod.GET,
    );
  }

  async getSocialLinks(): Promise<IApiContentItem[]> {
    return this.makeRequest<IApiContentItem[], null>(
      API_CONTENT_ROUTES.getSocialLinks,
      null,
      RequestMethod.GET,
    );
  }

  async getResumes(): Promise<IApiResume[]> {
    return this.makeRequest<IApiResume[], null>(
      API_CONTENT_ROUTES.getResumes,
      null,
      RequestMethod.GET,
    );
  }

  async updateContentItem<T extends IApiContentItem | IApiResume>(
    resourceName: string,
    id: string,
    payload: Partial<T>,
  ): Promise<T> {
    return this.makeRequest<T, Partial<T>>(
      API_CONTENT_ROUTES.updateResourceItem(resourceName, id),
      payload,
      RequestMethod.PATCH,
    );
  }

  async deleteContentItem(resourceName: string, id: string): Promise<{ deleted: boolean }> {
    return this.makeRequest<{ deleted: boolean }, null>(
      API_CONTENT_ROUTES.deleteResourceItem(resourceName, id),
      null,
      RequestMethod.DELETE,
    );
  }
}

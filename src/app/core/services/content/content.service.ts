import { Injectable } from '@angular/core';
import { RequestMethod } from '@core/enum/globalHttpRequest/globalHttpRequest.enum';
import {
  IApiContentItem,
  IApiProfile,
} from '@core/interfaces/content/content.interface';
import { API_CONTENT_ROUTES } from '@core/routes/content/content.routes';
import { GlobalHttpService } from '@services/globalHttp/global-http.service';

@Injectable({
  providedIn: 'root',
})
export class ContentService extends GlobalHttpService {
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

  async getResumes(): Promise<IApiContentItem[]> {
    return this.makeRequest<IApiContentItem[], null>(
      API_CONTENT_ROUTES.getResumes,
      null,
      RequestMethod.GET,
    );
  }
}

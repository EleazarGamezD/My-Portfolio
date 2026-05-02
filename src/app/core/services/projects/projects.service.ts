import { Injectable } from '@angular/core';
import { RequestMethod } from '@core/enum/globalHttpRequest/globalHttpRequest.enum';
import { IPaginationOptions, IPaginationResponse, IProject } from '@core/interfaces/projects/projects.interfaces';
import { API_PROJECT_ROUTES } from '@core/routes/projects/projects.routes';
import { GlobalHttpService } from '@services/globalHttp/global-http.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService extends GlobalHttpService {
  async createProject(payload: Partial<IProject>): Promise<IProject> {
    return this.makeRequest<IProject, Partial<IProject>>(
      API_PROJECT_ROUTES.getProjects,
      payload,
      RequestMethod.POST,
    );
  }

  async getProjects(): Promise<IProject[]> {
    return this.makeRequest<IProject[], null>(
      API_PROJECT_ROUTES.getProjects,
      null,
      RequestMethod.GET,
    );
  }

  async getProjectsPaginated(options: IPaginationOptions): Promise<IPaginationResponse<IProject>> {
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

    const route = params.size
      ? `${API_PROJECT_ROUTES.getProjects}?${params.toString()}`
      : API_PROJECT_ROUTES.getProjects;

    return this.makeRequest<IPaginationResponse<IProject>, null>(route, null, RequestMethod.GET);
  }

  async getProjectByIdOrSlug(idOrSlug: string): Promise<IProject> {
    return this.makeRequest<IProject, null>(
      API_PROJECT_ROUTES.getProjectById(idOrSlug),
      null,
      RequestMethod.GET,
    );
  }

  async updateProject(id: string, payload: Partial<IProject>): Promise<IProject> {
    return this.makeRequest<IProject, Partial<IProject>>(
      API_PROJECT_ROUTES.updateProject(id),
      payload,
      RequestMethod.PATCH,
    );
  }

  async deleteProject(id: string): Promise<{ deleted: boolean }> {
    return this.makeRequest<{ deleted: boolean }, null>(
      API_PROJECT_ROUTES.deleteProject(id),
      null,
      RequestMethod.DELETE,
    );
  }
}

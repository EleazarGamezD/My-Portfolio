import { Injectable } from '@angular/core';
import { RequestMethod } from '@core/enum/globalHttpRequest/globalHttpRequest.enum';
import { IProject } from '@core/interfaces/projects/projects.interfaces';
import { API_PROJECT_ROUTES } from '@core/routes/projects/projects.routes';
import { GlobalHttpService } from '@services/globalHttp/global-http.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService extends GlobalHttpService {
  async getProjects(): Promise<IProject[]> {
    return this.makeRequest<IProject[], null>(
      API_PROJECT_ROUTES.getProjects,
      null,
      RequestMethod.GET,
    );
  }

  async getProjectByIdOrSlug(idOrSlug: string): Promise<IProject> {
    return this.makeRequest<IProject, null>(
      API_PROJECT_ROUTES.getProjectById(idOrSlug),
      null,
      RequestMethod.GET,
    );
  }
}

import { environment } from '../../../../environments/environment';


export const API_PROJECT_ROUTES = {
  getProjects: `${environment.apiUrl}/projects`,
  getProjectById: (idOrSlug: string) => `${environment.apiUrl}/projects/${idOrSlug}`,
  updateProject: (id: string) => `${environment.apiUrl}/projects/${id}`,
  deleteProject: (id: string) => `${environment.apiUrl}/projects/${id}`,
};

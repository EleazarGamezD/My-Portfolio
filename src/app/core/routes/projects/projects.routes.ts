import { environment } from 'src/environments/environment';

export const API_PROJECT_ROUTES = {
  getProjects: `${environment.apiUrl}/api/projects`,
  getProjectById: (idOrSlug: string) => `${environment.apiUrl}/api/projects/${idOrSlug}`,
};

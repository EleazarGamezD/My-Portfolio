import { environment } from 'src/environments/environment';

export const API_PROJECT_ROUTES = {
  getProjects: `${environment.apiUrl}/projects`,
  getProjectById: (idOrSlug: string) => `${environment.apiUrl}/projects/${idOrSlug}`,
};
